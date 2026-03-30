import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Send,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMessagesStore } from "@/stores/messages";
import type { Conversation } from "@/types";
import { cn } from "@/lib/utils";

const CURRENT_USER_ID = "gusten-sun";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
  ];
  let hash = 0;
  for (const c of name) hash = c.charCodeAt(0) + hash * 31;
  return colors[Math.abs(hash) % colors.length];
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isGroupConversation(conv: Conversation) {
  return conv.participants.length > 2;
}

// ─── Conversation List Item ───────────────────────────────────────────────────

function ConversationItem({
  conv,
  isActive,
  onClick,
}: {
  conv: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  const isGroup = isGroupConversation(conv);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50",
        isActive && "bg-primary/8 hover:bg-primary/10"
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {isGroup ? (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
        ) : (
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
              getAvatarColor(conv.title)
            )}
          >
            {getInitials(conv.title)}
          </div>
        )}
        {conv.unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
            {conv.unreadCount}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <span
            className={cn(
              "text-sm font-medium truncate",
              conv.unreadCount > 0 && "font-semibold"
            )}
          >
            {conv.title}
          </span>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {formatTime(conv.updatedAt)}
          </span>
        </div>
        <p
          className={cn(
            "text-xs truncate",
            conv.unreadCount > 0
              ? "text-foreground/80 font-medium"
              : "text-muted-foreground"
          )}
        >
          {conv.lastMessage || "No messages yet"}
        </p>
      </div>
    </button>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  content,
  isSent,
}: {
  content: string;
  isSent: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("flex gap-2 max-w-[80%]", isSent ? "ml-auto flex-row-reverse" : "")}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words",
          isSent
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border rounded-tl-sm"
        )}
      >
        {content}
      </div>
    </motion.div>
  );
}

// ─── New Conversation Dialog ──────────────────────────────────────────────────

function NewConversationDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (id: string) => void;
}) {
  const { createConversation } = useMessagesStore();
  const [title, setTitle] = useState("");

  function handleCreate() {
    if (!title.trim()) return;
    const id = createConversation(title.trim(), []);
    setTitle("");
    onCreate(id);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setTitle(""); onClose(); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Conversation Title / Name</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Emily Rodriguez"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setTitle(""); onClose(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!title.trim()}>
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    sendMessage,
    markAsRead,
    getMessagesByConversation,
  } = useMessagesStore();

  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [newConvOpen, setNewConvOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) ?? null;
  const activeMessages = activeConversationId
    ? getMessagesByConversation(activeConversationId)
    : [];

  const filteredConversations = conversations.filter((c) => {
    if (!search) return true;
    return c.title.toLowerCase().includes(search.toLowerCase());
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length]);

  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId);
      inputRef.current?.focus();
    }
  }, [activeConversationId]);

  function handleSelectConversation(id: string) {
    setActiveConversation(id);
  }

  function handleSend() {
    if (!input.trim() || !activeConversationId) return;
    sendMessage(activeConversationId, input.trim());
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="h-[calc(100vh-0px)] flex flex-col">
      {/* Page title row */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <h1 className="page-title">Messages</h1>
          </div>
          <Button size="sm" onClick={() => setNewConvOpen(true)}>
            <Plus className="h-4 w-4" />
            New Conversation
          </Button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 min-h-0 mx-4 sm:mx-6 lg:mx-8 mb-6 rounded-xl border border-border overflow-hidden glass-card">
        {/* Left panel: Conversation list */}
        <div className="w-72 flex-shrink-0 border-r border-border flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-muted/50 border-0 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/50">
            {filteredConversations.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground px-4">
                No conversations yet
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === activeConversationId}
                  onClick={() => handleSelectConversation(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right panel: Message thread */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeConv ? (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border flex-shrink-0 bg-background/60">
                {isGroupConversation(activeConv) ? (
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4.5 w-4.5 text-primary" />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                      getAvatarColor(activeConv.title)
                    )}
                  >
                    {getInitials(activeConv.title)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm">{activeConv.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {activeConv.participants.length} participant
                    {activeConv.participants.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {activeMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No messages yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Send the first message below
                    </p>
                  </div>
                ) : (
                  activeMessages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      content={msg.content}
                      isSent={msg.senderId === CURRENT_USER_ID}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border p-3 flex-shrink-0 bg-background/60">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (Enter to send)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-muted/50 text-sm border border-border/50 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  />
                  <Button
                    size="sm"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="h-10 w-10 p-0 rounded-xl"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-primary/60" />
              </div>
              <h3 className="font-semibold mb-1">No conversation selected</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                Choose a conversation from the left, or start a new one.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewConvOpen(true)}
              >
                <Plus className="h-4 w-4" />
                New Conversation
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* New conversation dialog */}
      <NewConversationDialog
        open={newConvOpen}
        onClose={() => setNewConvOpen(false)}
        onCreate={(id) => setActiveConversation(id)}
      />
    </div>
  );
}
