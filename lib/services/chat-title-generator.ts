import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a concise, descriptive title for a chat based on the first user message.
 *
 * @param firstMessage - The content of the first user message
 * @returns A generated title (max 50 characters) or a fallback title
 */
export async function generateChatTitle(firstMessage: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OpenAI API key not configured, using fallback title");
    return firstMessage.slice(0, 50) || "New Chat";
  }

  if (!firstMessage || firstMessage.trim().length === 0) {
    return "New Chat";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Generate a concise, descriptive title (maximum 50 characters) for a chat conversation based on the user's first message. Return only the title, nothing else. Make it clear and specific.",
        },
        {
          role: "user",
          content: firstMessage,
        },
      ],
      max_tokens: 20,
      temperature: 0.7,
    });

    const generatedTitle = response.choices[0]?.message?.content?.trim() || "";

    if (generatedTitle && generatedTitle.length > 0) {
      return generatedTitle.slice(0, 50);
    }

    return firstMessage.slice(0, 50) || "New Chat";
  } catch (error) {
    console.error("Error generating chat title:", error);
    return firstMessage.slice(0, 50) || "New Chat";
  }
}
