import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import type { MessagePayload } from "@elevenlabs/types";
import { Phone, PhoneOff, Mic, MicOff, Volume2, ChevronDown, Bot, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/stores/user";
import { generateId } from "@/lib/utils";

// ─── Constants ─────────────────────────────────────────────────────────────────

const AGENT_ID = "agent_3401kmzjycgaerm9an18fx8fsvan";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TranscriptLine {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

interface AudioDevice {
  deviceId: string;
  label: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Voice Orb ─────────────────────────────────────────────────────────────────

function VoiceOrb({ isActive, isSpeaking }: { isActive: boolean; isSpeaking: boolean }) {
  return (
    <div className="relative flex items-center justify-center w-52 h-52">
      {isActive && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, hsl(155 35% 45% / 0.08) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.55, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, hsl(155 35% 45% / 0.12) 0%, transparent 65%)" }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0.1, 0.7] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </>
      )}

      {isSpeaking && isActive && [1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-[hsl(var(--sidebar-primary))]/30"
          style={{ inset: -i * 14 }}
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.18 }}
        />
      ))}

      <motion.div
        className="relative w-36 h-36 rounded-full overflow-hidden shadow-2xl"
        animate={isActive ? (isSpeaking ? { scale: [1, 1.07, 0.96, 1.04, 1] } : { scale: [1, 1.03, 1] }) : { scale: 1 }}
        transition={isActive ? (isSpeaking ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" } : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }) : {}}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background: isActive
              ? "conic-gradient(from 0deg at 50% 50%, hsl(160 45% 12%) 0deg, hsl(155 40% 22%) 90deg, hsl(150 35% 30%) 180deg, hsl(155 35% 18%) 270deg, hsl(160 45% 12%) 360deg)"
              : "radial-gradient(circle at 40% 35%, hsl(160 25% 22%), hsl(160 30% 10%) 80%)",
          }}
          animate={isActive ? { rotate: [0, 360] } : { rotate: 0 }}
          transition={isActive ? { duration: 8, repeat: Infinity, ease: "linear" } : {}}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(ellipse 60% 45% at 35% 30%, rgba(255,255,255,0.18) 0%, transparent 70%)" }}
          animate={isActive ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.4 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 2.5, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
          >
            <Bot className={cn("w-10 h-10 drop-shadow-lg", isActive ? "text-white/90" : "text-white/40")} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Transcript Panel ──────────────────────────────────────────────────────────

function TranscriptPanel({ lines, isSpeaking, userInitials }: {
  lines: TranscriptLine[];
  isSpeaking: boolean;
  userInitials: string;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[hsl(var(--sidebar-border))] shrink-0">
        <h3 className="text-sm font-semibold text-[hsl(var(--sidebar-foreground))]">Live Transcript</h3>
        <p className="text-xs text-[hsl(var(--sidebar-muted))] mt-0.5">Real-time conversation</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {lines.map((line) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn("flex gap-3", line.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              <div className={cn(
                "w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5",
                line.role === "user"
                  ? "bg-[hsl(var(--sidebar-primary))]/30 text-[hsl(var(--sidebar-primary))]"
                  : "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]/70"
              )}>
                {line.role === "user" ? userInitials.slice(0, 1) : <Bot className="w-3 h-3" />}
              </div>
              <div className={cn(
                "max-w-[80%] rounded-xl px-3 py-2",
                line.role === "user"
                  ? "bg-[hsl(var(--sidebar-primary))]/20 text-[hsl(var(--sidebar-foreground))]"
                  : "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]/90"
              )}>
                <p className="text-xs leading-relaxed">{line.text}</p>
                <p className="text-[10px] mt-1 opacity-40">{line.time}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isSpeaking && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[hsl(var(--sidebar-accent))] flex items-center justify-center shrink-0">
              <Bot className="w-3 h-3 text-[hsl(var(--sidebar-foreground))]/70" />
            </div>
            <div className="bg-[hsl(var(--sidebar-accent))] rounded-xl px-3 py-2.5">
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--sidebar-foreground))]/50"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.16 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ─── Inner component (must be inside ConversationProvider) ─────────────────────

function VoiceCallInner() {
  const { user } = useUserStore();
  const conversation = useConversation();

  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [micDevices, setMicDevices] = useState<AudioDevice[]>([]);
  const [speakerDevices, setSpeakerDevices] = useState<AudioDevice[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>("");
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef(0);

  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting";

  // Enumerate audio devices
  useEffect(() => {
    async function loadDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter((d) => d.kind === "audioinput").map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${d.deviceId.slice(0, 4)}`,
        }));
        const speakers = devices.filter((d) => d.kind === "audiooutput").map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Speaker ${d.deviceId.slice(0, 4)}`,
        }));
        setMicDevices(mics);
        setSpeakerDevices(speakers);
        if (mics[0]) setSelectedMicId(mics[0].deviceId);
        if (speakers[0]) setSelectedSpeakerId(speakers[0].deviceId);
      } catch {
        // Silently fail — devices populated after permission granted on call start
      }
    }
    loadDevices();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Timer
  useEffect(() => {
    if (isConnected) {
      durationRef.current = 0;
      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setCallDuration(durationRef.current);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      durationRef.current = 0;
      setCallDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isConnected]);

  // Call handlers
  async function handleConnect() {
    setPermissionError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      conversation.startSession({
        agentId: AGENT_ID,
        connectionType: "webrtc",
        onMessage: (msg: MessagePayload) => {
          setTranscriptLines((prev) => [
            ...prev,
            {
              id: generateId(),
              role: msg.role === "user" ? "user" : "assistant",
              text: msg.message,
              time: formatTime(durationRef.current),
            },
          ]);
        },
        onError: (message: string) => {
          setPermissionError(message);
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Microphone permission denied";
      setPermissionError(msg);
    }
  }

  function handleDisconnect() {
    conversation.endSession();
    setTranscriptLines([]);
    setIsMuted(false);
  }

  function handleMuteToggle() {
    conversation.setVolume({ volume: isMuted ? 1 : 0 });
    setIsMuted((v) => !v);
  }

  const selectedMicLabel = micDevices.find((d) => d.deviceId === selectedMicId)?.label ?? "Default Microphone";
  const selectedSpeakerLabel = speakerDevices.find((d) => d.deviceId === selectedSpeakerId)?.label ?? "Default Speaker";

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main call area */}
      <div
        className="flex-1 flex flex-col items-center justify-between py-10 px-6 relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 40%, hsl(160 35% 11%) 0%, hsl(160 45% 6%) 60%, hsl(160 40% 4%) 100%)",
        }}
      >
        {/* Ambient glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(155 35% 20% / 0.25) 0%, transparent 70%)" }}
          animate={isConnected ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.3 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Error banner */}
        <AnimatePresence>
          {permissionError && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-300 text-xs rounded-full px-4 py-2 backdrop-blur-sm z-20 max-w-sm"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {permissionError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status pill */}
        <div className="w-full max-w-sm flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isConnected ? (
              <motion.div key="connected" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-white/90">Connected · {formatDuration(callDuration)}</span>
              </motion.div>
            ) : isConnecting ? (
              <motion.div key="connecting" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <motion.span className="w-2 h-2 rounded-full bg-amber-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                <span className="text-sm font-medium text-white/90">Connecting…</span>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <span className="text-sm text-white/40">AI Voice Coach</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Orb + label + controls */}
        <div className="flex flex-col items-center gap-8 relative z-10">
          <VoiceOrb isActive={isConnected} isSpeaking={conversation.isSpeaking} />

          <div className="text-center">
            <AnimatePresence mode="wait">
              {isConnected ? (
                <motion.div key="active" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                  <p className="text-lg font-semibold text-white/90">AI Coach</p>
                  <motion.p
                    className="text-sm text-white/50 mt-0.5 h-5"
                    key={conversation.isSpeaking ? "speaking" : isMuted ? "muted" : "listening"}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                  >
                    {conversation.isSpeaking ? "Speaking…" : isMuted ? "You are muted" : "Listening…"}
                  </motion.p>
                </motion.div>
              ) : !isConnecting ? (
                <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                  <p className="text-lg font-semibold text-white/70">AI Voice Coach</p>
                  <p className="text-sm text-white/35 mt-1">Click to start your coaching session</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <AnimatePresence>
              {isConnected && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}>
                  <button
                    onClick={handleMuteToggle}
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 border",
                      isMuted
                        ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
                        : "bg-white/10 border-white/15 text-white/70 hover:bg-white/15 hover:text-white"
                    )}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={isConnected ? handleDisconnect : handleConnect}
              disabled={isConnecting}
              whileHover={{ scale: isConnecting ? 1 : 1.06 }}
              whileTap={{ scale: isConnecting ? 1 : 0.94 }}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-2",
                isConnected
                  ? "bg-red-500 border-red-400 hover:bg-red-600 text-white shadow-red-500/30"
                  : isConnecting
                  ? "bg-[hsl(var(--sidebar-primary))]/50 border-[hsl(var(--sidebar-primary))]/30 text-white cursor-not-allowed"
                  : "bg-[hsl(var(--sidebar-primary))] border-[hsl(var(--sidebar-primary))]/60 hover:bg-[hsl(155_40%_40%)] text-white shadow-[hsl(var(--sidebar-primary))]/30"
              )}
            >
              <AnimatePresence mode="wait">
                {isConnected ? (
                  <motion.span key="end" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <PhoneOff className="w-7 h-7" />
                  </motion.span>
                ) : (
                  <motion.span key="start" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Phone className="w-7 h-7" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {isConnected && <div className="w-14 h-14" />}
          </div>
        </div>

        {/* Audio device selectors */}
        <div className="w-full max-w-sm flex items-center justify-center gap-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white/60 hover:text-white/80 transition-all duration-200">
                <Mic className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[120px]">{selectedMicLabel}</span>
                <ChevronDown className="w-3 h-3 shrink-0 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              {micDevices.length > 0 ? micDevices.map((d) => (
                <DropdownMenuItem key={d.deviceId} onClick={() => setSelectedMicId(d.deviceId)}
                  className={cn(selectedMicId === d.deviceId && "bg-muted font-medium")}>
                  <Mic className="w-3.5 h-3.5 mr-2 opacity-60" />{d.label}
                </DropdownMenuItem>
              )) : (
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  Grant mic permission to see devices
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white/60 hover:text-white/80 transition-all duration-200">
                <Volume2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[120px]">{selectedSpeakerLabel}</span>
                <ChevronDown className="w-3 h-3 shrink-0 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              {speakerDevices.length > 0 ? speakerDevices.map((d) => (
                <DropdownMenuItem key={d.deviceId} onClick={() => setSelectedSpeakerId(d.deviceId)}
                  className={cn(selectedSpeakerId === d.deviceId && "bg-muted font-medium")}>
                  <Volume2 className="w-3.5 h-3.5 mr-2 opacity-60" />{d.label}
                </DropdownMenuItem>
              )) : (
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  Grant mic permission to see devices
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Transcript panel */}
      <AnimatePresence>
        {isConnected && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden lg:flex flex-col h-full overflow-hidden border-l border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))]"
            style={{ minWidth: 0 }}
          >
            <div className="w-[340px] h-full">
              <TranscriptPanel lines={transcriptLines} isSpeaking={conversation.isSpeaking} userInitials={user.initials} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page export (wraps inner with ConversationProvider) ───────────────────────

export default function VoiceCallPage() {
  return (
    <ConversationProvider>
      <VoiceCallInner />
    </ConversationProvider>
  );
}
