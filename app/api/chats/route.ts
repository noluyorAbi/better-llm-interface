import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: chats, error } = await supabase
      .from("chats")
      .select("id, title, created_at, updated_at, messages")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Ensure messages are properly formatted
    const formattedChats = (chats || []).map(
      (chat: {
        id: string;
        title: string;
        created_at: string;
        updated_at: string;
        messages?: unknown;
      }) => ({
        ...chat,
        messages: Array.isArray(chat.messages) ? chat.messages : chat.messages || [],
      })
    );

    return NextResponse.json({ chats: formattedChats });
  } catch (error) {
    console.error("Chats API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await request.json();

    const { data: chat, error } = await supabase
      .from("chats")
      .insert({
        user_id: user.id,
        title: title || "New Chat",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating chat:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Create chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("id");

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    const { error } = await supabase.from("chats").delete().eq("id", chatId).eq("user_id", user.id);

    if (error) {
      console.error("Error deleting chat:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
