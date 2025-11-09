import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { readFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { generateChatTitle } from "@/lib/services/chat-title-generator";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, chatId, isEdit } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    interface FileAttachment {
      name: string;
      type: string;
      size: number;
      data: string; // base64 data URL
    }

    let currentChatId = chatId;

    if (!currentChatId) {
      const firstUserMessage = messages.find((msg: { role: string }) => msg.role === "user");
      const firstMessageContent = firstUserMessage?.content || "";

      // Create chat immediately with temporary title for instant UI feedback
      const tempTitle = firstMessageContent.slice(0, 50) || "New Chat";

      const { data: newChat, error: chatError } = await supabase
        .from("chats")
        .insert({
          user_id: user.id,
          title: tempTitle,
        })
        .select()
        .single();

      if (chatError) {
        console.error("Error creating chat:", chatError);
        return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
      }

      currentChatId = newChat.id;

      // Generate AI title asynchronously and update in background
      if (firstMessageContent.trim().length > 0) {
        generateChatTitle(firstMessageContent)
          .then(async (aiTitle) => {
            try {
              await supabase.from("chats").update({ title: aiTitle }).eq("id", currentChatId);
            } catch (error) {
              console.error("Error updating chat title:", error);
            }
          })
          .catch((error: unknown) => {
            console.error("Error generating chat title:", error);
          });
      }
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 });
    }

    let systemPrompt: string;
    try {
      const basePromptPath = join(process.cwd(), "app", "api", "chat", "base_prompt.txt");
      const basePromptContent = await readFile(basePromptPath, "utf-8");
      systemPrompt = basePromptContent.trim();

      systemPrompt +=
        "\n\n## Available Tools\n\nYou have access to the following tools:\n\n1. **generate_image** - Generate images using DALL-E. Use this when users request image generation, creation, or visualization. Call this function directly when the user asks for an image.\n\n**IMPORTANT: When an image is generated, it is automatically displayed to the user. DO NOT include markdown image syntax like ![description](url) or any image URLs in your response. Simply respond with a brief confirmation or empty message.**";
    } catch (error) {
      console.error("Failed to read base_prompt.txt:", error);
      return NextResponse.json({ error: "Failed to load system prompt" }, { status: 500 });
    }

    // Define tools for function calling (image generation)
    const tools = [
      {
        type: "function" as const,
        function: {
          name: "generate_image",
          description:
            "Generate an image using DALL-E based on a text description. Use this when the user requests image generation, creation, or visualization.",
          parameters: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description: "A detailed description of the image to generate",
              },
              size: {
                type: "string",
                enum: ["256x256", "512x512", "1024x1024"],
                description: "The size of the generated image",
                default: "1024x1024",
              },
            },
            required: ["prompt"],
          },
        },
      },
    ];

    const extractFileContent = (file: FileAttachment): string | null => {
      try {
        // Extract base64 data from data URL (format: data:type;base64,base64data)
        const base64Match = file.data.match(/^data:[^;]+;base64,(.+)$/);
        if (!base64Match) {
          return null;
        }

        const base64Data = base64Match[1];

        // Skip images - they'll be handled separately
        if (file.type.startsWith("image/")) {
          return null;
        }

        // Try to decode as UTF-8 (for text-based files)
        // We'll validate the content to ensure it's actually text
        try {
          const content = Buffer.from(base64Data, "base64").toString("utf-8");

          // Basic validation: check if the content looks like text
          // (not too many null bytes or control characters)
          const nullByteCount = (content.match(/\0/g) || []).length;
          if (nullByteCount > content.length * 0.1) {
            // Too many null bytes, likely binary
            return null;
          }

          return content;
        } catch {
          // If UTF-8 fails, try latin1 as fallback
          try {
            return Buffer.from(base64Data, "base64").toString("latin1");
          } catch {
            return null;
          }
        }
      } catch (error) {
        console.error("Error extracting file content:", error);
        return null;
      }
    };

    // Convert messages to OpenAI chat completions format
    const buildOpenAIMessages = () => {
      const openAIMessages: Array<
        | { role: "system"; content: string }
        | {
            role: "user";
            content:
              | string
              | Array<
                  { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
                >;
          }
        | { role: "assistant"; content: string }
      > = [];

      // Add system prompt as first message
      if (systemPrompt) {
        openAIMessages.push({
          role: "system",
          content: systemPrompt,
        });
      }

      // Convert user/assistant messages
      for (const msg of messages) {
        if (msg.role === "user") {
          let userContent:
            | string
            | Array<
                { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
              > = msg.content || "";

          // Process files and images
          if (msg.files && Array.isArray(msg.files) && msg.files.length > 0) {
            const contentParts: Array<
              { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
            > = [];

            // Add text content if present
            if (msg.content) {
              let textContent = msg.content;

              // Process non-image files and include their content in text
              const fileSections: string[] = [];
              for (const file of msg.files) {
                if (!file.type.startsWith("image/")) {
                  const content = extractFileContent(file);
                  if (content) {
                    const truncatedContent =
                      content.length > 50000
                        ? content.substring(0, 50000) + "\n\n[... content truncated ...]"
                        : content;
                    fileSections.push(
                      `[File: ${file.name} (${(file.size / 1024).toFixed(1)} KB, type: ${file.type})]\n` +
                        `Content:\n${truncatedContent}`
                    );
                  } else {
                    fileSections.push(
                      `[File: ${file.name} (${(file.size / 1024).toFixed(1)} KB, type: ${file.type}) - Content could not be extracted]`
                    );
                  }
                }
              }

              if (fileSections.length > 0) {
                textContent += `\n\n---\n\nAttached files:\n\n${fileSections.join("\n\n---\n\n")}`;
              }

              if (textContent.trim()) {
                contentParts.push({ type: "text", text: textContent });
              }
            }

            // Add images
            for (const file of msg.files) {
              if (file.type.startsWith("image/")) {
                contentParts.push({
                  type: "image_url",
                  image_url: { url: file.data },
                });
              }
            }

            userContent = contentParts.length > 0 ? contentParts : msg.content || "";
          }

          openAIMessages.push({
            role: "user",
            content: userContent,
          });
        } else if (msg.role === "assistant") {
          openAIMessages.push({
            role: "assistant",
            content: msg.content || "",
          });
        }
      }

      return openAIMessages;
    };

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const images: Array<{ url: string; prompt?: string }> = [];

        try {
          const openAIMessages = buildOpenAIMessages();

          // Use chat completions with streaming
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: openAIMessages,
            tools: tools,
            stream: true, // 👈 Enable token-by-token streaming
          });

          let fullContent = "";
          let tokenBuffer = "";
          let lastFlushTime = Date.now();
          const FLUSH_INTERVAL = 16; // ~60fps for smooth streaming (16ms)
          const MIN_BUFFER_SIZE = 3; // Minimum characters before flushing (smaller = smoother)
          const toolCalls: Array<{
            id: string;
            type: "function";
            function: { name: string; arguments: string };
          }> = [];
          let finishReason: string | null = null;

          // Stream tokens as they arrive with batching for smoother visual experience
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta;
            finishReason = chunk.choices[0]?.finish_reason || null;

            if (delta?.content) {
              // Accumulate tokens in buffer
              tokenBuffer += delta.content;
              fullContent += delta.content;

              const now = Date.now();
              const timeSinceLastFlush = now - lastFlushTime;

              // Flush buffer if it's large enough or enough time has passed
              if (tokenBuffer.length >= MIN_BUFFER_SIZE || timeSinceLastFlush >= FLUSH_INTERVAL) {
                if (tokenBuffer.length > 0) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content: tokenBuffer })}\n\n`)
                  );
                  tokenBuffer = "";
                  lastFlushTime = now;
                }
              }
            }

            // Handle tool calls
            if (delta?.tool_calls) {
              for (const toolCallDelta of delta.tool_calls) {
                if (toolCallDelta.index !== undefined) {
                  const index = toolCallDelta.index;

                  // Initialize tool call if needed
                  if (!toolCalls[index]) {
                    toolCalls[index] = {
                      id: toolCallDelta.id || "",
                      type: "function",
                      function: { name: "", arguments: "" },
                    };
                  }

                  // Update tool call
                  if (toolCallDelta.id) {
                    toolCalls[index].id = toolCallDelta.id;
                  }
                  if (toolCallDelta.function?.name) {
                    toolCalls[index].function.name = toolCallDelta.function.name;
                  }
                  if (toolCallDelta.function?.arguments) {
                    toolCalls[index].function.arguments += toolCallDelta.function.arguments;
                  }
                }
              }
            }
          }

          // After streaming completes, execute tool calls if any
          if (finishReason === "tool_calls" && toolCalls.length > 0) {
            // Execute tool calls
            for (const toolCall of toolCalls) {
              if (toolCall.function.name === "generate_image") {
                try {
                  const args = JSON.parse(toolCall.function.arguments);
                  const prompt = args.prompt || "";
                  const size = args.size || "1024x1024";

                  // Generate image using DALL-E
                  const imageResponse = await openai.images.generate({
                    model: "dall-e-3",
                    prompt: prompt,
                    size: size as "256x256" | "512x512" | "1024x1024",
                    n: 1,
                    quality: "standard",
                  });

                  const imageUrl = imageResponse.data?.[0]?.url;
                  if (imageUrl) {
                    images.push({
                      url: imageUrl,
                      prompt: prompt,
                    });

                    // Send image result via SSE
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          type: "function_result",
                          data: JSON.stringify({
                            type: "image",
                            url: imageUrl,
                            prompt: prompt,
                          }),
                        })}\n\n`
                      )
                    );
                  }
                } catch (error) {
                  console.error("Error generating image:", error);
                }
              }
            }

            // Continue conversation with tool results to get final response
            // First, add the assistant message with tool_calls
            const assistantMessageWithTools = {
              role: "assistant" as const,
              content: fullContent || null,
              tool_calls: toolCalls.map((tc) => ({
                id: tc.id,
                type: "function" as const,
                function: {
                  name: tc.function.name,
                  arguments: tc.function.arguments,
                },
              })),
            };

            // Then add tool results
            const toolResults = toolCalls.map((toolCall) => {
              if (toolCall.function.name === "generate_image") {
                const args = JSON.parse(toolCall.function.arguments);
                const image = images.find((img) => img.prompt === args.prompt);
                return {
                  role: "tool" as const,
                  tool_call_id: toolCall.id,
                  content: image
                    ? JSON.stringify({
                        type: "image",
                        url: image.url,
                        prompt: image.prompt,
                      })
                    : "",
                };
              }
              return {
                role: "tool" as const,
                tool_call_id: toolCall.id,
                content: "",
              };
            });

            // Add assistant message with tools and tool results to messages
            const messagesWithToolResults = [
              ...openAIMessages,
              assistantMessageWithTools,
              ...toolResults,
            ];

            const finalCompletion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: messagesWithToolResults,
              stream: true,
            });

            // Stream final response
            let finalTokenBuffer = "";
            let finalLastFlushTime = Date.now();

            for await (const chunk of finalCompletion) {
              const delta = chunk.choices[0]?.delta;

              if (delta?.content) {
                finalTokenBuffer += delta.content;
                fullContent += delta.content;

                const now = Date.now();
                const timeSinceLastFlush = now - finalLastFlushTime;

                if (
                  finalTokenBuffer.length >= MIN_BUFFER_SIZE ||
                  timeSinceLastFlush >= FLUSH_INTERVAL
                ) {
                  if (finalTokenBuffer.length > 0) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content: finalTokenBuffer })}\n\n`)
                    );
                    finalTokenBuffer = "";
                    finalLastFlushTime = now;
                  }
                }
              }
            }

            // Flush remaining final tokens
            if (finalTokenBuffer.length > 0) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: finalTokenBuffer })}\n\n`)
              );
            }
          }

          // Flush any remaining tokens
          if (tokenBuffer.length > 0) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: tokenBuffer })}\n\n`)
            );
          }

          // Send chat ID after streaming completes
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "chat_id", chatId: currentChatId })}\n\n`
            )
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));

          // Store fullContent and images for database save (will be used after controller.close())
          const outputText = fullContent;
          const savedImages = [...images]; // Copy images array for use outside stream

          controller.close();

          const lastUserMessage = messages[messages.length - 1] as
            | {
                role: string;
                content: string;
                files?: FileAttachment[];
              }
            | undefined;

          const { data: currentChat } = await supabase
            .from("chats")
            .select("messages")
            .eq("id", currentChatId)
            .single();

          // If this is an edit operation, truncate existing messages to match incoming messages
          // The incoming messages array already contains only the messages up to and including the edited one
          let existingMessages: Array<{
            id: string;
            role: string;
            content: string;
            images?: Array<{ url: string; prompt?: string }> | null;
            files?: FileAttachment[] | null;
            created_at: string;
            message_number: number;
            edited?: boolean;
            edited_at?: string;
          }> = [];

          if (isEdit) {
            // For edits, use the incoming messages (already truncated) as the base
            // Exclude the last message (the edited one) - we'll add it back with the edited flag
            existingMessages = messages.slice(0, -1).map(
              (
                msg: {
                  role: string;
                  content: string;
                  files?: FileAttachment[];
                  edited?: boolean;
                  edited_at?: string;
                },
                index: number
              ) => {
                // Try to preserve existing message IDs and metadata from database
                const dbMessage = Array.isArray(currentChat?.messages)
                  ? (
                      currentChat.messages as Array<{
                        id?: string;
                        role: string;
                        content: string;
                        created_at?: string;
                        message_number?: number;
                        edited?: boolean;
                        edited_at?: string;
                      }>
                    ).find((m) => m.content === msg.content && m.role === msg.role)
                  : null;

                return {
                  id: dbMessage?.id || randomUUID(),
                  role: msg.role,
                  content: msg.content,
                  images: null,
                  files: msg.files || null,
                  created_at: dbMessage?.created_at || new Date().toISOString(),
                  message_number: dbMessage?.message_number || index + 1,
                  edited: dbMessage?.edited || false,
                  edited_at: dbMessage?.edited_at || undefined,
                };
              }
            );
          } else {
            // For normal messages, load from database
            existingMessages = Array.isArray(currentChat?.messages)
              ? (
                  currentChat.messages as Array<{
                    id?: string;
                    role: string;
                    content: string;
                    images?: Array<{ url: string; prompt?: string }> | null;
                    files?: FileAttachment[] | null;
                    created_at?: string;
                    message_number?: number;
                    edited?: boolean;
                    edited_at?: string;
                  }>
                ).map((msg, index) => ({
                  id: msg.id || randomUUID(),
                  role: msg.role,
                  content: msg.content,
                  images: msg.images || null,
                  files: msg.files || null,
                  created_at: msg.created_at || new Date().toISOString(),
                  message_number: msg.message_number || index + 1,
                  edited: msg.edited || false,
                  edited_at: msg.edited_at || undefined,
                }))
              : [];
          }

          const nextMessageNumber =
            existingMessages.length > 0
              ? Math.max(...existingMessages.map((msg) => msg.message_number || 0), 0) + 1
              : 1;

          // For edit operations, the last message in the incoming array is the edited user message
          // We need to add it to existingMessages with the edited flag preserved
          let messagesToSave: Array<{
            id: string;
            role: string;
            content: string;
            images?: Array<{ url: string; prompt?: string }> | null;
            files?: FileAttachment[] | null;
            created_at: string;
            message_number: number;
            edited?: boolean;
            edited_at?: string;
          }> = [];

          if (isEdit && lastUserMessage && lastUserMessage.role === "user") {
            // Find the edited message from incoming messages
            const editedUserMessage = messages[messages.length - 1];
            messagesToSave = [
              ...existingMessages,
              {
                id: randomUUID(),
                role: "user",
                content: editedUserMessage.content,
                files: editedUserMessage.files || null,
                created_at: new Date().toISOString(),
                message_number: nextMessageNumber,
                edited: editedUserMessage.edited || false,
                edited_at: editedUserMessage.edited_at || undefined,
              },
              {
                id: randomUUID(),
                role: "assistant",
                content: outputText,
                images: savedImages.length > 0 ? savedImages : null,
                created_at: new Date().toISOString(),
                message_number: nextMessageNumber + 1,
              },
            ];
          } else {
            // Normal flow: add new user message and assistant response
            const newMessages = [
              ...(lastUserMessage && lastUserMessage.role === "user"
                ? [
                    {
                      id: randomUUID(),
                      role: "user",
                      content: lastUserMessage.content,
                      files: lastUserMessage.files || null,
                      created_at: new Date().toISOString(),
                      message_number: nextMessageNumber,
                    },
                  ]
                : []),
              {
                id: randomUUID(),
                role: "assistant",
                content: outputText,
                images: savedImages.length > 0 ? savedImages : null,
                created_at: new Date().toISOString(),
                message_number:
                  lastUserMessage && lastUserMessage.role === "user"
                    ? nextMessageNumber + 1
                    : nextMessageNumber,
              },
            ];
            messagesToSave = [...existingMessages, ...newMessages];
          }

          const updateData: {
            messages: Array<{
              id: string;
              role: string;
              content: string;
              images?: Array<{ url: string; prompt?: string }> | null;
              files?: FileAttachment[] | null;
              created_at: string;
              message_number: number;
              edited?: boolean;
              edited_at?: string;
            }>;
          } = {
            messages: messagesToSave,
          };

          await supabase.from("chats").update(updateData).eq("id", currentChatId);
        } catch (error) {
          console.error("Response error:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const errorContent = `\n\nError: ${errorMessage}`;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: errorContent })}\n\n`)
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
