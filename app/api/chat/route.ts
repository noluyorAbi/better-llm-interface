import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { readFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

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

    const { messages, chatId } = await request.json();

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
      const title = firstUserMessage?.content?.slice(0, 50) || "New Chat";

      const { data: newChat, error: chatError } = await supabase
        .from("chats")
        .insert({
          user_id: user.id,
          title: title,
        })
        .select()
        .single();

      if (chatError) {
        console.error("Error creating chat:", chatError);
        return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
      }

      currentChatId = newChat.id;
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
        "\n\n## Available Tools\n\nYou have access to the following tools:\n\n1. **image_generation** - Generate images using GPT-5's built-in image generation capability. Use this when users request image generation, creation, or visualization.\n\nNote: Other tools mentioned in the prompt (bio, canmore, python, web, file_search, automations, guardian_tool) are not available in this API implementation. For those requests, provide helpful text-based responses explaining what you would do if the tool were available.";
    } catch (error) {
      console.error("Failed to read base_prompt.txt:", error);
      return NextResponse.json({ error: "Failed to load system prompt" }, { status: 500 });
    }

    const tools = [
      {
        type: "image_generation" as const,
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

    const buildInput = () => {
      if (messages.length === 0) return "";

      let conversation = systemPrompt ? `${systemPrompt}\n\n` : "";

      for (const msg of messages) {
        if (msg.role === "user") {
          let userMessage = msg.content || "";

          // Process files and include their content
          if (msg.files && Array.isArray(msg.files) && msg.files.length > 0) {
            const fileSections: string[] = [];

            for (const file of msg.files) {
              if (file.type.startsWith("image/")) {
                // For images, include metadata
                fileSections.push(
                  `[Image file: ${file.name} (${(file.size / 1024).toFixed(1)} KB, type: ${file.type})]`
                );
              } else {
                // For text-based files, extract and include content
                const content = extractFileContent(file);
                if (content) {
                  // Limit content length to avoid token limits (keep first 50k characters)
                  const truncatedContent =
                    content.length > 50000
                      ? content.substring(0, 50000) + "\n\n[... content truncated ...]"
                      : content;

                  fileSections.push(
                    `[File: ${file.name} (${(file.size / 1024).toFixed(1)} KB, type: ${file.type})]\n` +
                      `Content:\n${truncatedContent}`
                  );
                } else {
                  // If we can't extract content, just show metadata
                  fileSections.push(
                    `[File: ${file.name} (${(file.size / 1024).toFixed(1)} KB, type: ${file.type}) - Content could not be extracted]`
                  );
                }
              }
            }

            const filesSection = fileSections.join("\n\n---\n\n");
            userMessage = userMessage
              ? `${userMessage}\n\n---\n\nAttached files:\n\n${filesSection}`
              : `Attached files:\n\n${filesSection}`;
          }

          conversation += `User: ${userMessage}\n\n`;
        } else if (msg.role === "assistant") {
          conversation += `Assistant: ${msg.content}\n\n`;
        }
      }

      return conversation.trim();
    };

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          const response = await openai.responses.create({
            model: "gpt-5-mini",
            input: buildInput(),
            tools: tools,
            reasoning: {
              effort: "medium",
            },
            text: {
              verbosity: "medium",
            },
          });

          const outputText = response.output_text || "";
          const images: Array<{ url: string; prompt?: string }> = [];

          if (outputText) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: outputText })}\n\n`)
            );
          }

          if (response.output) {
            for (const output of response.output) {
              if (output.type === "image_generation_call" && output.result) {
                try {
                  const imageBase64 = output.result;
                  const imageDataUrl = `data:image/png;base64,${imageBase64}`;

                  const imagePrompt: string =
                    "revised_prompt" in output && output.revised_prompt
                      ? String(output.revised_prompt)
                      : "Generated image";

                  images.push({
                    url: imageDataUrl,
                    prompt: imagePrompt,
                  });

                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        type: "function_result",
                        data: JSON.stringify({
                          type: "image",
                          url: imageDataUrl,
                          prompt: imagePrompt,
                        }),
                      })}\n\n`
                    )
                  );
                } catch (error) {
                  console.error("Error processing image:", error);
                }
              }
            }
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "chat_id", chatId: currentChatId })}\n\n`
            )
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
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

          const existingMessages = Array.isArray(currentChat?.messages)
            ? (
                currentChat.messages as Array<{
                  id?: string;
                  role: string;
                  content: string;
                  images?: Array<{ url: string; prompt?: string }> | null;
                  files?: FileAttachment[] | null;
                  created_at?: string;
                  message_number?: number;
                }>
              ).map((msg, index) => ({
                id: msg.id || randomUUID(),
                role: msg.role,
                content: msg.content,
                images: msg.images || null,
                files: msg.files || null,
                created_at: msg.created_at || new Date().toISOString(),
                message_number: msg.message_number || index + 1,
              }))
            : [];

          const nextMessageNumber =
            existingMessages.length > 0
              ? Math.max(...existingMessages.map((msg) => msg.message_number || 0), 0) + 1
              : 1;

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
              images: images.length > 0 ? images : null,
              created_at: new Date().toISOString(),
              message_number:
                lastUserMessage && lastUserMessage.role === "user"
                  ? nextMessageNumber + 1
                  : nextMessageNumber,
            },
          ];

          const updatedMessages = [...existingMessages, ...newMessages];

          const updateData: {
            messages: Array<{
              id: string;
              role: string;
              content: string;
              images?: Array<{ url: string; prompt?: string }> | null;
              files?: FileAttachment[] | null;
              created_at: string;
              message_number: number;
            }>;
            title?: string;
          } = {
            messages: updatedMessages,
          };

          if (messages.length === 1 && lastUserMessage) {
            updateData.title = lastUserMessage.content.slice(0, 50);
          }

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
