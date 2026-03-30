import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import TextareaAutosize from "react-textarea-autosize";
import {
  Plus,
  Send,
  Paperclip,
  Mic,
  Copy,
  RotateCcw,
  Pencil,
  Check,
  Trash2,
  ChevronDown,
  MessageSquare,
  Sparkles,
  Zap,
  Bot,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useChatStore } from "@/stores/chat";
import { useUserStore } from "@/stores/user";
import type { AgentTool, AIModel } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const AGENT_TOOLS: { value: AgentTool; label: string; icon: string }[] = [
  { value: "none", label: "No Tool", icon: "✦" },
  { value: "ad", label: "Ad Writer", icon: "📣" },
  { value: "copy", label: "Copy Writer", icon: "✍️" },
  { value: "vsl", label: "VSL Generator", icon: "🎬" },
  { value: "offer", label: "Offer Creator", icon: "💎" },
  { value: "niche", label: "Niche Expert", icon: "🎯" },
  { value: "brand", label: "Brand Voice", icon: "🌿" },
  { value: "program", label: "Program Builder", icon: "📚" },
  { value: "gdoc", label: "GDoc Magic", icon: "📄" },
  { value: "avatar", label: "Avatar Architect", icon: "👤" },
  { value: "content", label: "Content Strategist", icon: "🗺️" },
];

const AI_MODELS: { value: AIModel; label: string; desc: string }[] = [
  { value: "claude-sonnet", label: "Claude Sonnet", desc: "Best for writing & strategy" },
  { value: "gemini-flash", label: "Gemini Flash", desc: "Fastest responses" },
];

const ROTATING_HEADLINES = [
  "Build your new AI Solopreneur business...",
  "Write copy that converts like crazy...",
  "Design your 6-figure offer today...",
  "Craft content that builds authority...",
  "Map out your perfect niche market...",
];

const STARTER_PROMPTS = [
  { icon: "💎", text: "Help me create a high-ticket coaching offer" },
  { icon: "✍️", text: "Write persuasive copy for my sales page" },
  { icon: "🎯", text: "Find my perfect niche with low competition" },
  { icon: "🌿", text: "Define my personal brand voice and story" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function StreamingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-60"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

function RotatingHeadline() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % ROTATING_HEADLINES.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-10 overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-2xl font-semibold text-foreground/90 text-center"
        >
          {ROTATING_HEADLINES[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

interface ConversationListProps {
  onSelect?: () => void;
}

function ConversationList({ onSelect }: ConversationListProps) {
  const {
    conversations,
    currentConversationId,
    setCurrentConversation,
    deleteConversation,
    createConversation,
  } = useChatStore();

  function handleNew() {
    createConversation();
    onSelect?.();
  }

  function handleSelect(id: string) {
    setCurrentConversation(id);
    onSelect?.();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 pt-4 pb-3 shrink-0">
        <Button
          onClick={handleNew}
          className="w-full gap-2 bg-[hsl(var(--sidebar-accent))] hover:bg-[hsl(var(--sidebar-accent))]/80 text-[hsl(var(--sidebar-foreground))] border border-[hsl(var(--sidebar-border))]"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {conversations.length === 0 && (
          <div className="text-center py-8 px-4">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-[hsl(var(--sidebar-foreground))]" />
            <p className="text-xs text-[hsl(var(--sidebar-muted))]">No conversations yet</p>
          </div>
        )}
        <AnimatePresence>
          {conversations.map((conv) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-150",
                conv.id === currentConversationId
                  ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]"
                  : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-accent))]/60 hover:text-[hsl(var(--sidebar-foreground))]"
              )}
              onClick={() => handleSelect(conv.id)}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
              <span className="flex-1 text-sm truncate leading-snug">{conv.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-destructive shrink-0"
                aria-label="Delete conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AIChatPage() {
  const {
    conversations,
    currentConversationId,
    agentTool,
    model,
    isStreaming,
    attachedFiles,
    sendMessage,
    editMessage,
    regenerateMessage,
    setAgentTool,
    setModel,
    removeAttachedFile,
    getCurrentMessages,
  } = useChatStore();

  const { user } = useUserStore();

  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = getCurrentMessages();
  const currentConv = conversations.find((c) => c.id === currentConversationId);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isStreaming]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    sendMessage(trimmed);
    setInput("");
    inputRef.current?.focus();
  }, [input, isStreaming, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleEditSave = (conversationId: string, messageId: string) => {
    if (editingContent.trim()) {
      editMessage(conversationId, messageId, editingContent.trim());
    }
    setEditingId(null);
    setEditingContent("");
  };

  const selectedTool = AGENT_TOOLS.find((t) => t.value === agentTool) ?? AGENT_TOOLS[0];
  const selectedModel = AI_MODELS.find((m) => m.value === model) ?? AI_MODELS[0];

  // ─── Sidebar content (shared between desktop + mobile sheet) ──────────────
  const sidebarContent = (
    <div className="h-full bg-[hsl(var(--sidebar-background))] flex flex-col">
      {/* Sidebar top logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[hsl(var(--sidebar-border))] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[hsl(var(--sidebar-primary))]/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-[hsl(var(--sidebar-primary))]" />
        </div>
        <span className="text-sm font-semibold text-[hsl(var(--sidebar-foreground))]">AI Chat</span>
      </div>
      <ConversationList onSelect={() => setMobileSidebarOpen(false)} />
    </div>
  );

  // ─── Welcome / Empty state ─────────────────────────────────────────────────
  const welcomeState = (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl text-center"
      >
        {/* Logo mark */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--forest))]/8 border border-[hsl(var(--forest))]/12 flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-[hsl(var(--forest-light))]" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2 tracking-tight">
          Your AI Solopreneur Coach
        </h1>
        <div className="mb-8">
          <RotatingHeadline />
        </div>

        {/* Starter prompts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
          {STARTER_PROMPTS.map((p) => (
            <button
              key={p.text}
              onClick={() => {
                setInput(p.text);
                inputRef.current?.focus();
              }}
              className="flex items-start gap-3 text-left p-4 rounded-xl bg-card border border-border hover:border-[hsl(var(--forest-light))]/40 hover:bg-card/80 hover:shadow-sm transition-all duration-200 group"
            >
              <span className="text-xl leading-none mt-0.5">{p.icon}</span>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-snug">
                {p.text}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // ─── Message list ──────────────────────────────────────────────────────────
  const messageList = (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      <AnimatePresence initial={false}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const isLast = idx === messages.length - 1;
          const isStreamingThis = isStreaming && isLast && msg.role === "assistant";
          const isEditing = editingId === msg.id;

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={cn("flex gap-3 group", isUser ? "flex-row-reverse" : "flex-row")}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold mt-0.5",
                isUser
                  ? "bg-[hsl(var(--forest))] text-[hsl(var(--primary-foreground))]"
                  : "bg-[hsl(var(--forest-light))]/15 border border-[hsl(var(--forest-light))]/25 text-[hsl(var(--forest-light))]"
              )}>
                {isUser ? (user.initials || "U") : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble + actions */}
              <div className={cn("flex flex-col gap-1.5 max-w-[75%]", isUser && "items-end")}>
                {/* Bubble */}
                {isEditing ? (
                  <div className="flex flex-col gap-2 w-full min-w-[300px]">
                    <TextareaAutosize
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(var(--forest-light))]/30 resize-none"
                      minRows={2}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-7 px-3 text-xs bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest-light))] text-[hsl(var(--primary-foreground))]"
                        onClick={() => handleEditSave(currentConversationId!, msg.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-3 text-xs"
                        onClick={() => { setEditingId(null); setEditingContent(""); }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    isUser
                      ? "bg-[hsl(var(--forest))] text-[hsl(var(--primary-foreground))] rounded-tr-sm"
                      : "bg-card border border-border/70 text-foreground rounded-tl-sm shadow-sm"
                  )}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1.5 prose-li:my-0.5 prose-headings:font-semibold">
                        {msg.content ? (
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        ) : isStreamingThis ? (
                          <StreamingDots />
                        ) : null}
                        {isStreamingThis && msg.content && <StreamingDots />}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                )}

                {/* Actions (hover) */}
                {!isEditing && (
                  <div className={cn(
                    "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                    isUser ? "flex-row-reverse" : "flex-row"
                  )}>
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {isUser && (
                      <button
                        onClick={() => { setEditingId(msg.id); setEditingContent(msg.content); }}
                        className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {msg.role === "assistant" && !isStreaming && (
                      <button
                        onClick={() => regenerateMessage(currentConversationId!, msg.id)}
                        className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Regenerate"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-xs text-muted-foreground/50 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );

  // ─── Input area ────────────────────────────────────────────────────────────
  const inputArea = (
    <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur px-4 pt-3 pb-4">
      {/* Context bar */}
      <div className="flex items-center gap-2 mb-2.5 px-1">
        {/* Agent tool selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg border border-border/60 hover:border-border bg-card/50 hover:bg-card">
              <span>{selectedTool.icon}</span>
              <span className="font-medium">{selectedTool.label}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 max-h-72 overflow-y-auto">
            {AGENT_TOOLS.map((t) => (
              <DropdownMenuItem
                key={t.value}
                onClick={() => setAgentTool(t.value)}
                className={cn("gap-2.5", agentTool === t.value && "bg-muted font-medium")}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Model selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg border border-border/60 hover:border-border bg-card/50 hover:bg-card">
              <Zap className="w-3 h-3" />
              <span className="font-medium">{selectedModel.label}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            {AI_MODELS.map((m) => (
              <DropdownMenuItem
                key={m.value}
                onClick={() => setModel(m.value)}
                className={cn("flex flex-col items-start gap-0.5 py-2.5", model === m.value && "bg-muted")}
              >
                <span className="font-medium text-sm">{m.label}</span>
                <span className="text-xs text-muted-foreground">{m.desc}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Attached files */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2.5 px-1">
          {attachedFiles.map((f) => (
            <div key={f.id} className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-lg text-xs">
              <Paperclip className="w-3 h-3 text-muted-foreground" />
              <span className="max-w-[120px] truncate">{f.name}</span>
              <button onClick={() => removeAttachedFile(f.id)} className="hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className={cn(
        "flex items-end gap-2 rounded-2xl border bg-card px-3 py-2 shadow-sm transition-all duration-200",
        "border-border/80 focus-within:border-[hsl(var(--forest-light))]/50 focus-within:shadow-md focus-within:shadow-[hsl(var(--forest))]/5"
      )}>
        {/* File attach */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mb-0.5"
          title="Attach file"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input ref={fileInputRef} type="file" className="hidden" multiple />

        {/* Textarea */}
        <TextareaAutosize
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your AI coach anything..."
          minRows={1}
          maxRows={8}
          className="flex-1 bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground/60 py-1.5 leading-relaxed"
          disabled={isStreaming}
        />

        {/* Voice note */}
        <button
          className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mb-0.5"
          title="Voice note (coming soon)"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className={cn(
            "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 mb-0.5",
            input.trim() && !isStreaming
              ? "bg-[hsl(var(--forest))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--forest-light))] shadow-sm hover:shadow active:scale-95"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
          title="Send (Enter)"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground/40 mt-2">
        AI can make mistakes. Review important information.
      </p>
    </div>
  );

  // ─── Layout ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="hidden md:flex flex-col h-full overflow-hidden border-r border-[hsl(var(--sidebar-border))]"
            style={{ minWidth: 0 }}
          >
            <div className="w-[260px] h-full">
              {sidebarContent}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[260px]">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 h-12 border-b border-border shrink-0 bg-background/95 backdrop-blur">
          {/* Mobile sidebar trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <PanelLeftOpen className="w-4 h-4" />
          </Button>

          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-8 w-8"
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen
              ? <PanelLeftClose className="w-4 h-4" />
              : <PanelLeftOpen className="w-4 h-4" />}
          </Button>

          {/* Conversation title */}
          <span className="text-sm font-medium text-foreground/80 truncate">
            {currentConv?.title ?? "New Conversation"}
          </span>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {messages.length === 0 ? welcomeState : messageList}
          {inputArea}
        </div>
      </div>
    </div>
  );
}
