"use client";

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, Trash2, Loader2, Search, FileText, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: Array<{
    id?: string;
    role: string;
    content: string;
    created_at?: string;
    message_number?: number;
  }> | null;
}

interface ChatWithMatch extends Chat {
  matchType?: "title" | "content";
}

interface ChatSidebarProps {
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

export interface ChatSidebarRef {
  addChat: (chat: Chat) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  refreshChat: (chatId: string) => Promise<void>;
}

export const ChatSidebar = forwardRef<ChatSidebarRef, ChatSidebarProps>(
  ({ currentChatId, onChatSelect, onNewChat }, ref) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<{ id: string; title: string } | null>(null);
    const isInitialLoadRef = useRef(true);

    const fetchChats = useCallback(async () => {
      const isInitialLoad = isInitialLoadRef.current;
      try {
        if (isInitialLoad) {
          setLoading(true);
        }
        const response = await fetch("/api/chats");
        if (!response.ok) throw new Error("Failed to fetch chats");
        const data = await response.json();
        const chatsData = (data.chats || []).map((chat: Chat) => ({
          ...chat,
          // Ensure messages is always an array
          messages: Array.isArray(chat.messages) ? chat.messages : chat.messages === null ? [] : [],
        }));
        setChats(chatsData);
        isInitialLoadRef.current = false;
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    }, []);

    useEffect(() => {
      fetchChats();
    }, [fetchChats]);

    const addChat = useCallback((chat: Chat) => {
      setChats((prevChats) => {
        // Check if chat already exists
        if (prevChats.some((c) => c.id === chat.id)) {
          return prevChats;
        }
        // Add new chat at the beginning
        return [chat, ...prevChats];
      });
    }, []);

    const updateChatTitle = useCallback((chatId: string, title: string) => {
      setChats((prevChats) =>
        prevChats.map((chat) => (chat.id === chatId ? { ...chat, title } : chat))
      );
    }, []);

    const refreshChat = useCallback(async (chatId: string) => {
      try {
        const response = await fetch(`/api/chats?id=${chatId}`);
        if (!response.ok) throw new Error("Failed to fetch chat");
        const data = await response.json();
        const chat = data.chat;
        if (chat) {
          setChats((prevChats) =>
            prevChats.map((c) =>
              c.id === chatId
                ? {
                    ...c,
                    ...chat,
                    messages: Array.isArray(chat.messages)
                      ? chat.messages
                      : chat.messages === null
                        ? []
                        : [],
                  }
                : c
            )
          );
        }
      } catch (error) {
        console.error("Error refreshing chat:", error);
      }
    }, []);

    useImperativeHandle(ref, () => ({
      addChat,
      updateChatTitle,
      refreshChat,
    }));

    const handleDeleteClick = (chatId: string, chatTitle: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setChatToDelete({ id: chatId, title: chatTitle });
      setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
      if (!chatToDelete) return;

      try {
        setDeletingId(chatToDelete.id);
        const response = await fetch(`/api/chats?id=${chatToDelete.id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete chat");

        setChats(chats.filter((chat) => chat.id !== chatToDelete.id));
        if (currentChatId === chatToDelete.id) {
          onNewChat();
        }
        setDeleteDialogOpen(false);
        setChatToDelete(null);
      } catch (error) {
        console.error("Error deleting chat:", error);
        alert("Failed to delete chat");
      } finally {
        setDeletingId(null);
      }
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days} days ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };

    const searchInChat = (chat: Chat, query: string): ChatWithMatch | null => {
      if (!query.trim()) return { ...chat };

      const lowerQuery = query.toLowerCase().trim();

      // Search in title first (priority)
      if (chat.title?.toLowerCase().includes(lowerQuery)) {
        return { ...chat, matchType: "title" };
      }

      // Search in message content
      if (chat.messages) {
        let messagesArray: Array<{
          id?: string;
          role: string;
          content: string;
          created_at?: string;
          message_number?: number;
        }> = [];

        // Handle different message structures
        if (Array.isArray(chat.messages)) {
          messagesArray = chat.messages;
        } else if (typeof chat.messages === "object") {
          // If messages is an object, try to extract array
          messagesArray = Object.values(chat.messages) as Array<{
            id?: string;
            role: string;
            content: string;
            created_at?: string;
            message_number?: number;
          }>;
        }

        // Search through all messages (both user and assistant)
        const foundInContent = messagesArray.some((msg) => {
          if (!msg) return false;

          // Use content field (standard field name)
          const content = msg.content || "";

          // Ensure content is a string
          if (typeof content !== "string") {
            return false;
          }

          // Search in content
          return content.toLowerCase().includes(lowerQuery);
        });

        if (foundInContent) {
          return { ...chat, matchType: "content" };
        }
      }

      return null;
    };

    const filteredChats: ChatWithMatch[] = searchQuery
      ? chats
          .map((chat) => searchInChat(chat, searchQuery))
          .filter((chat): chat is ChatWithMatch => chat !== null)
      : chats.map((chat) => ({ ...chat }));

    // Group chats by date
    const groupedChats = filteredChats.reduce(
      (acc, chat) => {
        const date = formatDate(chat.updated_at);
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(chat);
        return acc;
      },
      {} as Record<string, Chat[]>
    );

    return (
      <div className="flex flex-col h-full overflow-hidden bg-sidebar border-r border-sidebar-border">
        {/* Header */}
        <div className="px-5 py-6 border-b border-sidebar-border/50">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-sidebar-foreground tracking-tight">
              Conversations
            </h2>
          </div>
          <Button onClick={onNewChat} className="w-full h-11 shadow-sm font-medium" size="default">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        {chats.length > 0 && (
          <div className="px-5 py-4 border-b border-sidebar-border/50 bg-sidebar/50">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/50" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-background/50 border-sidebar-border/50 text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:border-sidebar-ring transition-all"
              />
            </div>
          </div>
        )}

        {/* Chat List */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-3 py-3">
            {loading ? null : (
              <>
                {filteredChats.length === 0 && chats.length > 0 ? (
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-sidebar-accent/80 mb-4">
                      <Search className="h-6 w-6 text-sidebar-foreground/50" />
                    </div>
                    <p className="text-sm font-semibold text-sidebar-foreground mb-1.5">
                      No matches found
                    </p>
                    <p className="text-xs text-sidebar-foreground/60">
                      Try adjusting your search query
                    </p>
                  </div>
                ) : chats.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sidebar-accent/80 mb-5">
                      <MessageSquare className="h-7 w-7 text-sidebar-foreground/50" />
                    </div>
                    <p className="text-sm font-semibold text-sidebar-foreground mb-1.5">
                      No conversations yet
                    </p>
                    <p className="text-xs text-sidebar-foreground/60">
                      Create your first chat to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {Object.entries(groupedChats).map(([date, dateChats]) => (
                      <div key={date} className="space-y-1">
                        <div className="px-3 py-2.5">
                          <span className="text-[11px] font-bold text-sidebar-foreground/50 uppercase tracking-widest">
                            {date}
                          </span>
                        </div>
                        <AnimatePresence>
                          {dateChats.map((chat) => {
                            const formattedDate = formatDate(chat.updated_at);
                            const isToday = formattedDate === "Today";
                            const isYesterday = formattedDate === "Yesterday";
                            const showTime = isToday || isYesterday;
                            const chatWithMatch = chat as ChatWithMatch;
                            const messageCount = Array.isArray(chat.messages)
                              ? chat.messages.length
                              : 0;
                            const isActive = currentChatId === chat.id;
                            return (
                              <motion.div
                                key={chat.id}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.15 }}
                              >
                                <div
                                  className={`group relative cursor-pointer rounded-lg transition-all duration-200 ${
                                    isActive
                                      ? "bg-sidebar-accent shadow-sm ring-1 ring-sidebar-border/50"
                                      : "hover:bg-sidebar-accent/60"
                                  }`}
                                  onClick={() => onChatSelect(chat.id)}
                                >
                                  <div className="px-3.5 py-3 relative">
                                    <div className="flex items-start gap-3">
                                      <div
                                        className={`mt-0.5 shrink-0 transition-colors ${
                                          isActive
                                            ? "text-sidebar-primary"
                                            : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60"
                                        }`}
                                      >
                                        <MessageSquare className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1 min-w-0 pr-9 overflow-hidden">
                                        <p
                                          className={`text-sm font-semibold line-clamp-2 leading-tight mb-1 break-words ${
                                            isActive
                                              ? "text-sidebar-foreground"
                                              : "text-sidebar-foreground/95"
                                          }`}
                                        >
                                          {chat.title || "New Chat"}
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer ${
                                        isActive
                                          ? "hover:bg-sidebar-accent-foreground/10 text-sidebar-foreground/70"
                                          : "hover:bg-sidebar-accent text-sidebar-foreground/50"
                                      }`}
                                      onClick={(e) =>
                                        handleDeleteClick(chat.id, chat.title || "New Chat", e)
                                      }
                                      disabled={deletingId === chat.id}
                                    >
                                      {deletingId === chat.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-3.5 w-3.5" />
                                      )}
                                    </Button>
                                    <div className="flex items-center gap-2 flex-wrap mt-1.5">
                                      <span
                                        className={`text-[11px] font-medium ${
                                          isActive
                                            ? "text-sidebar-foreground/60"
                                            : "text-sidebar-foreground/50"
                                        }`}
                                      >
                                        {showTime
                                          ? formatTime(chat.updated_at)
                                          : formatDate(chat.updated_at)}
                                      </span>
                                      {messageCount > 0 && (
                                        <>
                                          <span
                                            className={`text-[10px] ${
                                              isActive
                                                ? "text-sidebar-foreground/40"
                                                : "text-sidebar-foreground/35"
                                            }`}
                                          >
                                            •
                                          </span>
                                          <span
                                            className={`text-[11px] ${
                                              isActive
                                                ? "text-sidebar-foreground/60"
                                                : "text-sidebar-foreground/50"
                                            }`}
                                          >
                                            {messageCount}{" "}
                                            {messageCount === 1 ? "message" : "messages"}
                                          </span>
                                        </>
                                      )}
                                      {chatWithMatch.matchType && (
                                        <>
                                          <span
                                            className={`text-[10px] ${
                                              isActive
                                                ? "text-sidebar-foreground/40"
                                                : "text-sidebar-foreground/35"
                                            }`}
                                          >
                                            •
                                          </span>
                                          <Badge
                                            variant="secondary"
                                            className={`h-5 px-2 text-[10px] font-semibold ${
                                              isActive
                                                ? "bg-sidebar-accent-foreground/10 text-sidebar-foreground/70 border-sidebar-border/50"
                                                : "bg-sidebar-accent/80 text-sidebar-foreground/60 border-sidebar-border/50"
                                            }`}
                                          >
                                            {chatWithMatch.matchType === "title" ? (
                                              <Tag className="h-2.5 w-2.5 mr-1" />
                                            ) : (
                                              <FileText className="h-2.5 w-2.5 mr-1" />
                                            )}
                                            {chatWithMatch.matchType === "title"
                                              ? "Title"
                                              : "Content"}
                                          </Badge>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the chat &ldquo;
                <span className="font-bold">{chatToDelete?.title || "this conversation"}</span>
                &rdquo;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setChatToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
);

ChatSidebar.displayName = "ChatSidebar";
