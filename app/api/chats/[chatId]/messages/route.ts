import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;

    const { data: chat, error } = await supabase
      .from("chats")
      .select("messages")
      .eq("id", chatId)
      .single();

    if (error) {
      console.error("Error fetching chat:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const messages = Array.isArray(chat?.messages) ? chat.messages : [];

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Messages API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
