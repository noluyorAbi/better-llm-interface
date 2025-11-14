"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Loader2 } from "lucide-react";

export default function NewChatPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (authLoading || !user) {
      return;
    }

    // Don't create a chat automatically - just redirect to the chat interface
    // The chat will be created when the user sends their first message
    // This prevents creating empty "New Chat" entries that can't be deleted
    router.push("/chat/new");
  }, [user, authLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
