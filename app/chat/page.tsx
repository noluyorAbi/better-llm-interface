"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatSidebar, type ChatSidebarRef } from "@/components/chat-sidebar";
import { Navbar } from "@/components/navbar";
import { Send, Bot, User, Loader2, Paperclip, X, Copy, Check, MoreVertical } from "lucide-react";
import { GrDocumentTxt } from "react-icons/gr";
import { FaMarkdown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";

interface FileAttachment {
  name: string;
  type: string;
  size: number;
  data: string; // base64 data URL
}

interface Message {
  role: "user" | "assistant";
  content: string;
  images?: Array<{ url: string; prompt?: string }>;
  files?: FileAttachment[];
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<ChatSidebarRef>(null);
  const mobileSidebarRef = useRef<ChatSidebarRef>(null);
  const titleRefreshScheduledRef = useRef<string | null>(null);

  const isDark = resolvedTheme === "dark" || theme === "dark";
  const codeTheme = isDark ? oneDark : oneLight;

  const handleCopyCode = async (code: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(codeId);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const generateCodeId = (code: string) => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `code-${Math.abs(hash)}`;
  };

  const handleCopyAsMarkdown = async (content: string, messageIndex: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(`markdown-${messageIndex}`);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error("Failed to copy as markdown:", error);
    }
  };

  const handleCopyAsPlaintext = async (content: string, messageIndex: number) => {
    try {
      // Strip markdown formatting for plaintext
      const plainText = content
        .replace(/#{1,6}\s+/g, "") // Remove headers
        .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
        .replace(/\*(.*?)\*/g, "$1") // Remove italic
        .replace(/`(.*?)`/g, "$1") // Remove inline code
        .replace(/```[\s\S]*?```/g, "") // Remove code blocks
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove links, keep text
        .replace(/^\s*[-*+]\s+/gm, "") // Remove list markers
        .replace(/^\s*\d+\.\s+/gm, "") // Remove numbered list markers
        .trim();
      await navigator.clipboard.writeText(plainText);
      setCopiedMessageId(`plaintext-${messageIndex}`);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error("Failed to copy as plaintext:", error);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea on mount and when input changes
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const scrollHeight = inputRef.current.scrollHeight;
      const maxHeight = 200;
      inputRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      inputRef.current.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [input]);

  const markdownComponents: Components = {
    p: ({ ...props }) => <p className="m-0 mb-2 last:mb-0" {...props} />,
    h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2 first:mt-0" {...props} />,
    h2: ({ ...props }) => <h2 className="text-xl font-semibold mt-4 mb-2 first:mt-0" {...props} />,
    h3: ({ ...props }) => <h3 className="text-lg font-semibold mt-3 mb-2 first:mt-0" {...props} />,
    h4: ({ ...props }) => (
      <h4 className="text-base font-semibold mt-2 mb-1 first:mt-0" {...props} />
    ),
    ul: ({ ...props }) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
    ol: ({ ...props }) => <ol className="list-decimal list-inside my-2 space-y-1" {...props} />,
    li: ({ ...props }) => <li className="ml-4" {...props} />,
    code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<"code">) => {
      const match = /language-(\w+)/.exec(className || "");
      const isInline = !match;
      const codeString = String(children).replace(/\n$/, "");
      const codeId = generateCodeId(codeString);
      const isCopied = copiedCodeId === codeId;

      return isInline ? (
        <code className="bg-background/30 px-1 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      ) : (
        <div className="group relative my-2 rounded-lg border border-border/50 bg-muted/30 overflow-hidden">
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-background/80 hover:bg-background border border-border/50"
              onClick={() => handleCopyCode(codeString, codeId)}
            >
              {isCopied ? (
                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <SyntaxHighlighter
            language={match ? match[1] : "text"}
            style={codeTheme as Record<string, React.CSSProperties>}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: "1rem",
              fontSize: "0.875rem",
              background: "transparent",
            }}
            codeTagProps={{
              style: {
                fontFamily: "var(--font-geist-mono), monospace",
              } as React.CSSProperties,
            }}
            {...(props as Record<string, unknown>)}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    },
    pre: ({ children, ...props }: React.ComponentPropsWithoutRef<"pre">) => {
      // If the child is a code element with syntax highlighting, don't wrap it
      if (
        children &&
        typeof children === "object" &&
        "props" in children &&
        children.props &&
        typeof children.props === "object" &&
        "className" in children.props &&
        typeof children.props.className === "string" &&
        children.props.className.includes("language-")
      ) {
        return <>{children}</>;
      }
      // If it's a SyntaxHighlighter component, don't wrap it
      if (
        children &&
        typeof children === "object" &&
        "type" in children &&
        children.type === SyntaxHighlighter
      ) {
        return <>{children}</>;
      }
      return (
        <pre className="bg-background/30 p-3 rounded-lg overflow-x-auto my-2" {...props}>
          {children}
        </pre>
      );
    },
    blockquote: ({ ...props }) => (
      <blockquote className="border-l-4 border-primary-foreground/30 pl-4 italic my-2" {...props} />
    ),
    table: ({ ...props }) => (
      <div className="overflow-x-auto my-2">
        <table
          className="min-w-full border-collapse border border-primary-foreground/20"
          {...props}
        />
      </div>
    ),
    thead: ({ ...props }) => <thead className="bg-background/20" {...props} />,
    th: ({ ...props }) => (
      <th
        className="border border-primary-foreground/20 px-3 py-2 text-left font-semibold"
        {...props}
      />
    ),
    td: ({ ...props }) => (
      <td className="border border-primary-foreground/20 px-3 py-2" {...props} />
    ),
    hr: ({ ...props }) => <hr className="my-4 border-primary-foreground/20" {...props} />,
    a: ({ ...props }) => <a className="underline hover:opacity-80" {...props} />,
    strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
    em: ({ ...props }) => <em className="italic" {...props} />,
  };

  const markdownComponentsDark: Components = {
    p: ({ ...props }) => <p className="m-0 mb-2 last:mb-0" {...props} />,
    h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2 first:mt-0" {...props} />,
    h2: ({ ...props }) => <h2 className="text-xl font-semibold mt-4 mb-2 first:mt-0" {...props} />,
    h3: ({ ...props }) => <h3 className="text-lg font-semibold mt-3 mb-2 first:mt-0" {...props} />,
    h4: ({ ...props }) => (
      <h4 className="text-base font-semibold mt-2 mb-1 first:mt-0" {...props} />
    ),
    ul: ({ ...props }) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
    ol: ({ ...props }) => <ol className="list-decimal list-inside my-2 space-y-1" {...props} />,
    li: ({ ...props }) => <li className="ml-4" {...props} />,
    code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<"code">) => {
      const match = /language-(\w+)/.exec(className || "");
      const isInline = !match;
      const codeString = String(children).replace(/\n$/, "");
      const codeId = generateCodeId(codeString);
      const isCopied = copiedCodeId === codeId;

      return isInline ? (
        <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      ) : (
        <div className="group relative my-2 rounded-lg border border-border/50 bg-muted/30 overflow-hidden">
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-background/80 hover:bg-background border border-border/50"
              onClick={() => handleCopyCode(codeString, codeId)}
            >
              {isCopied ? (
                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <SyntaxHighlighter
            language={match ? match[1] : "text"}
            style={codeTheme as Record<string, React.CSSProperties>}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: "1rem",
              fontSize: "0.875rem",
              background: "transparent",
            }}
            codeTagProps={{
              style: {
                fontFamily: "var(--font-geist-mono), monospace",
              } as React.CSSProperties,
            }}
            {...(props as Record<string, unknown>)}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    },
    pre: ({ children, ...props }: React.ComponentPropsWithoutRef<"pre">) => {
      // If the child is a code element with syntax highlighting, don't wrap it
      if (
        children &&
        typeof children === "object" &&
        "props" in children &&
        children.props &&
        typeof children.props === "object" &&
        "className" in children.props &&
        typeof children.props.className === "string" &&
        children.props.className.includes("language-")
      ) {
        return <>{children}</>;
      }
      // If it's a SyntaxHighlighter component, don't wrap it
      if (
        children &&
        typeof children === "object" &&
        "type" in children &&
        children.type === SyntaxHighlighter
      ) {
        return <>{children}</>;
      }
      return (
        <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-2" {...props}>
          {children}
        </pre>
      );
    },
    blockquote: ({ ...props }) => (
      <blockquote className="border-l-4 border-primary/30 pl-4 italic my-2" {...props} />
    ),
    table: ({ ...props }) => (
      <div className="overflow-x-auto my-2">
        <table className="min-w-full border-collapse border border-border" {...props} />
      </div>
    ),
    thead: ({ ...props }) => <thead className="bg-muted" {...props} />,
    th: ({ ...props }) => (
      <th className="border border-border px-3 py-2 text-left font-semibold" {...props} />
    ),
    td: ({ ...props }) => <td className="border border-border px-3 py-2" {...props} />,
    hr: ({ ...props }) => <hr className="my-4 border-border" {...props} />,
    a: ({ ...props }) => <a className="text-primary underline hover:text-primary/80" {...props} />,
    strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
    em: ({ ...props }) => <em className="italic" {...props} />,
  };

  const loadChatMessages = async (chatId: string) => {
    try {
      setLoadingMessages(true);
      const response = await fetch(`/api/chats/${chatId}/messages`);
      if (!response.ok) throw new Error("Failed to load messages");
      const data = await response.json();
      const loadedMessages: Message[] = (data.messages || []).map(
        (msg: {
          role: string;
          content?: string;
          images?: Array<{ url: string; prompt?: string }>;
          files?: FileAttachment[];
        }) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content || "",
          images: msg.images || undefined,
          files: msg.files || undefined,
        })
      );
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    loadChatMessages(chatId);
    setMobileMenuOpen(false);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setAttachedFiles([]);
    inputRef.current?.focus();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: FileAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64,
        });
      } catch (error) {
        console.error("Error reading file:", error);
        alert(`Failed to read file ${file.name}`);
      }
    }

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input, // Keep original formatting, don't trim
      files: attachedFiles.length > 0 ? attachedFiles : undefined,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setAttachedFiles([]);
    setIsLoading(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    let chatIdToUse = currentChatId;

    // Create chat immediately if this is the first message for instant UI feedback
    if (!chatIdToUse) {
      try {
        const tempTitle = input.slice(0, 50) || "New Chat";
        const createResponse = await fetch("/api/chats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: tempTitle }),
        });

        if (createResponse.ok) {
          const { chat } = await createResponse.json();
          chatIdToUse = chat.id;
          setCurrentChatId(chat.id);

          // Add chat optimistically to sidebar without re-rendering entire list
          const chatToAdd = {
            ...chat,
            messages: [],
          };
          sidebarRef.current?.addChat(chatToAdd);
          mobileSidebarRef.current?.addChat(chatToAdd);

          // Generate and update title immediately
          if (!titleRefreshScheduledRef.current && input.trim().length > 0) {
            titleRefreshScheduledRef.current = chat.id;

            // Call title generation API immediately
            fetch(`/api/chats/${chat.id}/title`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ firstMessage: input }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.title) {
                  // Update title directly without refreshing entire chat
                  sidebarRef.current?.updateChatTitle(chat.id, data.title);
                  mobileSidebarRef.current?.updateChatTitle(chat.id, data.title);
                }
                titleRefreshScheduledRef.current = null;
              })
              .catch((error) => {
                console.error("Error generating title:", error);
                titleRefreshScheduledRef.current = null;
              });
          }
        }
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            files: msg.files,
          })),
          chatId: chatIdToUse,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let buffer = "";
      const messageImages: Array<{ url: string; prompt?: string }> = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") {
                break;
              }
              if (data) {
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    assistantMessage += parsed.content;
                    setMessages([
                      ...newMessages,
                      {
                        role: "assistant",
                        content: assistantMessage,
                        images: messageImages.length > 0 ? messageImages : undefined,
                      },
                    ]);
                  } else if (parsed.type === "function_result") {
                    try {
                      const functionData = JSON.parse(parsed.data);
                      if (functionData.type === "image" && functionData.url) {
                        messageImages.push({
                          url: functionData.url,
                          prompt: functionData.prompt,
                        });
                        setMessages([
                          ...newMessages,
                          {
                            role: "assistant",
                            content: assistantMessage,
                            images: [...messageImages],
                          },
                        ]);
                      }
                    } catch (e) {
                      console.error("Failed to parse function result:", e, parsed.data);
                    }
                  } else if (parsed.type === "chat_id" && parsed.chatId) {
                    // Chat ID received from API (fallback if frontend creation failed)
                    if (!currentChatId) {
                      setCurrentChatId(parsed.chatId);

                      // Fetch and add chat to sidebar
                      fetch(`/api/chats?id=${parsed.chatId}`)
                        .then((res) => res.json())
                        .then((data) => {
                          if (data.chat) {
                            const chatToAdd = {
                              ...data.chat,
                              messages: Array.isArray(data.chat.messages) ? data.chat.messages : [],
                            };
                            sidebarRef.current?.addChat(chatToAdd);
                            mobileSidebarRef.current?.addChat(chatToAdd);

                            // Refresh once after a delay to catch AI-generated title (backend generates it asynchronously)
                            if (!titleRefreshScheduledRef.current) {
                              titleRefreshScheduledRef.current = parsed.chatId;
                              setTimeout(() => {
                                sidebarRef.current?.refreshChat(parsed.chatId);
                                mobileSidebarRef.current?.refreshChat(parsed.chatId);
                                titleRefreshScheduledRef.current = null;
                              }, 3000);
                            }
                          }
                        })
                        .catch((error) => {
                          console.error("Error fetching chat:", error);
                        });
                    }
                  }
                } catch (e) {
                  console.error("Failed to parse SSE data:", e, data);
                }
              }
            }
          }
        }

        if (buffer) {
          const line = buffer.trim();
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data && data !== "[DONE]") {
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantMessage += parsed.content;
                  setMessages([
                    ...newMessages,
                    {
                      role: "assistant",
                      content: assistantMessage,
                      images: messageImages.length > 0 ? messageImages : undefined,
                    },
                  ]);
                }
              } catch (e) {
                console.error("Failed to parse final SSE data:", e, data);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="w-72 border-r bg-background hidden lg:flex flex-col sticky top-0 h-screen overflow-hidden">
        <ChatSidebar
          ref={sidebarRef}
          currentChatId={currentChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title="Chat with AI"
          titleIcon={<Bot className="h-5 w-5 text-primary" />}
          showBackButton
          backHref="/"
          showMobileMenu
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuOpenChange={setMobileMenuOpen}
          mobileMenuContent={
            <ChatSidebar
              ref={mobileSidebarRef}
              currentChatId={currentChatId}
              onChatSelect={handleChatSelect}
              onNewChat={handleNewChat}
            />
          }
        />

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-semibold mb-2">Start a conversation</h2>
                <p className="text-muted-foreground">Ask me anything and I&apos;ll help you out!</p>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 items-center ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <Card
                    className={`group relative max-w-[80%] sm:max-w-[70%] p-4 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.role === "user" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {message.files && message.files.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {message.files.map((file, idx) => (
                              <div key={idx} className="space-y-2">
                                <div className="flex items-center gap-2 p-2 bg-background/20 rounded border text-sm">
                                  <Paperclip className="h-4 w-4 shrink-0" />
                                  <span className="truncate flex-1">{file.name}</span>
                                  <span className="text-xs opacity-80">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                                {file.type.startsWith("image/") && (
                                  <div className="rounded-lg overflow-hidden">
                                    <Image
                                      src={file.data}
                                      alt={file.name}
                                      width={192}
                                      height={192}
                                      className="max-w-xs max-h-48 rounded"
                                      unoptimized
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {message.content && (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {message.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {message.images && message.images.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {message.images.map((img, idx) => (
                              <div key={idx} className="rounded-lg overflow-hidden">
                                <Image
                                  src={img.url}
                                  alt={img.prompt || "Generated image"}
                                  width={512}
                                  height={512}
                                  className="w-full h-auto max-w-md"
                                  unoptimized
                                />
                                {img.prompt && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    {img.prompt}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {message.files && message.files.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {message.files.map((file, idx) => (
                              <div key={idx} className="space-y-2">
                                <div className="flex items-center gap-2 p-2 bg-background/50 rounded border text-sm">
                                  <Paperclip className="h-4 w-4 shrink-0" />
                                  <span className="truncate flex-1">{file.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                                {file.type.startsWith("image/") && (
                                  <div className="rounded-lg overflow-hidden">
                                    <Image
                                      src={file.data}
                                      alt={file.name}
                                      width={192}
                                      height={192}
                                      className="max-w-xs max-h-48 rounded"
                                      unoptimized
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {message.content && (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponentsDark}
                          >
                            {message.content}
                          </ReactMarkdown>
                        )}
                        <div className="mt-3 pt-2 border-t border-border/50">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                              >
                                <MoreVertical className="h-3.5 w-3.5 mr-1.5" />
                                Copy
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem
                                onClick={() => handleCopyAsMarkdown(message.content, index)}
                                className="cursor-pointer"
                              >
                                {copiedMessageId === `markdown-${index}` ? (
                                  <>
                                    <Check className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                    Copied as Markdown
                                  </>
                                ) : (
                                  <>
                                    <FaMarkdown className="h-4 w-4 mr-2" />
                                    Copy as Markdown
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCopyAsPlaintext(message.content, index)}
                                className="cursor-pointer"
                              >
                                {copiedMessageId === `plaintext-${index}` ? (
                                  <>
                                    <Check className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                    Copied as Plaintext
                                  </>
                                ) : (
                                  <>
                                    <GrDocumentTxt className="h-4 w-4 mr-2" />
                                    Copy as Plaintext
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )}
                  </Card>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start items-center"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <Card className="max-w-[80%] sm:max-w-[70%] bg-muted p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </Card>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              {attachedFiles.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {attachedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-sm"
                    >
                      <Paperclip className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="hover:bg-background/50 rounded p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.txt,.doc,.docx,.csv,.json"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || loadingMessages}
                  className="shrink-0 h-[44px] w-[44px]"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    // Auto-resize textarea
                    if (inputRef.current) {
                      inputRef.current.style.height = "auto";
                      const scrollHeight = inputRef.current.scrollHeight;
                      const maxHeight = 200; // Max height in pixels (about 8-10 lines)
                      inputRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
                      inputRef.current.style.overflowY =
                        scrollHeight > maxHeight ? "auto" : "hidden";
                    }
                  }}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  disabled={isLoading || loadingMessages}
                  className="flex-1 min-h-[44px] max-h-[200px] resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={
                    isLoading || loadingMessages || (!input.trim() && attachedFiles.length === 0)
                  }
                  size="icon"
                  className="shrink-0 h-[44px] w-[44px]"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
