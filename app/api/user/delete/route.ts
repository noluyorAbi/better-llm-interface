import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function DELETE() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if service role key is available
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        {
          error:
            "Service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to your environment variables.",
        },
        { status: 500 }
      );
    }

    // Create admin client with service role key
    const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Delete the user using admin API
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message || "Failed to delete account" },
        { status: 500 }
      );
    }

    // Sign out the user session
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete account";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
