import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateChatTitle } from "@/lib/services/chat-title-generator";

export async function POST(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const { firstMessage } = await request.json();

    if (!firstMessage || typeof firstMessage !== "string") {
      return NextResponse.json({ error: "First message is required" }, { status: 400 });
    }

    // Generate title immediately
    const aiTitle = await generateChatTitle(firstMessage);

    // Update chat title in database
    const { data: updatedChat, error: updateError } = await supabase
      .from("chats")
      .update({ title: aiTitle })
      .eq("id", chatId)
      .eq("user_id", user.id)
      .select("id, title")
      .single();

    if (updateError) {
      console.error("Error updating chat title:", updateError);
      return NextResponse.json({ error: "Failed to update title" }, { status: 500 });
    }

    return NextResponse.json({ title: updatedChat.title });
  } catch (error) {
    console.error("Title generation API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
