import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff, Volume2, ChevronDown, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/stores/user";

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_MICROPHONES = [
  "MacBook Pro Microphone",
  "AirPods Pro",
  "Blue Yeti USB Mic",
  "Logitech HD Webcam",
];

const MOCK_SPEAKERS = [
  "MacBook Pro Speakers",
  "AirPods Pro",
  "Sony WH-1000XM5",
  "External Monitor Audio",
];

interface TranscriptLine {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

const MOCK_TRANSCRIPT: TranscriptLine[] = [
  {
    id: "1",
    role: "assistant",
    text: "Hey! Welcome to your AI coaching session. I'm here to help you build your solopreneur business. What would you like to work on today?",
    time: "0:02",
  },
  {
    id: "2",
    role: "user",
    text: "I want to figure out my niche. I've been trying to pick between the health and wealth markets.",
    time: "0:15",
  },
  {
    id: "3",
    role: "assistant",
    text: "Great question! Both are strong markets, but the key is to pick the one that aligns with your own story and credibility. Have you had personal results in either area that you could speak to authentically?",
    time: "0:28",
  },
  {
    id: "4",
    role: "user",
    text: "Yes — I spent 3 years building an online business from scratch and hit six figures. So probably the wealth market.",
    time: "0:45",
  },
  {
    id: "5",
    role: "assistant",
    text: "Perfect. Your story is your authority. Now let's get specific — within the wealth market, the richest niches are those with a specific transformation. Think: 'I help [specific group] achieve [specific result] in [specific timeframe] without [specific pain].'",
    time: "1:02",
  },
];

// ─── Voice Orb ────────────────────────────────────────────────────────────────

interface VoiceOrbProps {
  isActive: boolean;
  isSpeaking: boolean;
}

function VoiceOrb({ isActive, isSpeaking }: VoiceOrbProps) {
  return (
    <div className="relative flex items-center justify-center w-52 h-52">
      {/* Outermost pulse ring — only when active */}
      {isActive && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(155 35% 45% / 0.08) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.55, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(155 35% 45% / 0.12) 0%, transparent 65%)",
            }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0.1, 0.7] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </>
      )}

      {/* Speaking rings */}
      {isSpeaking && isActive && (
        <>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-[hsl(var(--sidebar-primary))]/30"
              style={{ inset: -i * 14 }}
              animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 0.15, 0.5] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.18,
              }}
            />
          ))}
        </>
      )}

      {/* Core orb */}
      <motion.div
        className="relative w-36 h-36 rounded-full overflow-hidden shadow-2xl"
        animate={
          isActive
            ? isSpeaking
              ? { scale: [1, 1.07, 0.96, 1.04, 1] }
              : { scale: [1, 1.03, 1] }
            : { scale: 1 }
        }
        transition={
          isActive
            ? isSpeaking
              ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
              : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
            : {}
        }
      >
        {/* Gradient sphere */}
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

        {/* Shimmer highlight */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse 60% 45% at 35% 30%, rgba(255,255,255,0.18) 0%, transparent 70%)",
          }}
          animate={isActive ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.4 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 2.5, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
          >
            {isActive ? (
              <Bot className="w-10 h-10 text-white/90 drop-shadow-lg" />
            ) : (
              <Bot className="w-10 h-10 text-white/40" />
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Transcript Panel ─────────────────────────────────────────────────────────

interface TranscriptPanelProps {
  lines: TranscriptLine[];
  isStreaming: boolean;
  userInitials: string;
}

function TranscriptPanel({ lines, isStreaming, userInitials }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines.length]);

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
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                "flex gap-3",
                line.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5",
                line.role === "user"
                  ? "bg-[hsl(var(--sidebar-primary))]/30 text-[hsl(var(--sidebar-primary))]"
                  : "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]/70"
              )}>
                {line.role === "user" ? userInitials.slice(0, 1) : <Bot className="w-3 h-3" />}
              </div>

              {/* Bubble */}
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

        {/* Streaming indicator */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
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

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function VoiceCallPage() {
  const { user } = useUserStore();

  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [selectedMic, setSelectedMic] = useState(MOCK_MICROPHONES[0]);
  const [selectedSpeaker, setSelectedSpeaker] = useState(MOCK_SPEAKERS[0]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Call duration timer
  useEffect(() => {
    if (isConnected) {
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isConnected]);

  // Mock transcript streaming after connection
  useEffect(() => {
    if (!isConnected) {
      setTranscriptLines([]);
      setIsAISpeaking(false);
      return;
    }

    // Stream in mock transcript lines with delays
    MOCK_TRANSCRIPT.forEach((line, i) => {
      const delay = 1200 + i * 3200;
      const t = setTimeout(() => {
        setIsAISpeaking(line.role === "assistant");
        setTranscriptLines((prev) => [...prev, line]);
        // Turn off speaking indicator after 2s
        setTimeout(() => setIsAISpeaking(false), 2000);
      }, delay);
      // Store last timeout for cleanup
      if (i === MOCK_TRANSCRIPT.length - 1) transcriptTimerRef.current = t;
    });

    return () => {
      if (transcriptTimerRef.current) clearTimeout(transcriptTimerRef.current);
    };
  }, [isConnected]);

  function formatDuration(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function handleConnect() {
    if (isConnected) return;
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 1800);
  }

  function handleDisconnect() {
    setIsConnected(false);
    setIsConnecting(false);
    setIsMuted(false);
    setIsAISpeaking(false);
    setTranscriptLines([]);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main call area */}
      <div
        className="flex-1 flex flex-col items-center justify-between py-10 px-6 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 40%, hsl(160 35% 11%) 0%, hsl(160 45% 6%) 60%, hsl(160 40% 4%) 100%)",
        }}
      >
        {/* Ambient background glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(155 35% 20% / 0.25) 0%, transparent 70%)",
          }}
          animate={isConnected ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.3 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Top status */}
        <div className="w-full max-w-sm flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isConnected ? (
              <motion.div
                key="connected"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-white/90">
                  Connected · {formatDuration(callDuration)}
                </span>
              </motion.div>
            ) : isConnecting ? (
              <motion.div
                key="connecting"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm"
              >
                <motion.span
                  className="w-2 h-2 rounded-full bg-amber-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                <span className="text-sm font-medium text-white/90">Connecting...</span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm text-white/40">AI Voice Coach</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Central section — orb + label */}
        <div className="flex flex-col items-center gap-8 relative z-10">
          {/* Orb */}
          <VoiceOrb isActive={isConnected} isSpeaking={isAISpeaking} />

          {/* Label */}
          <div className="text-center">
            <AnimatePresence mode="wait">
              {isConnected ? (
                <motion.div
                  key="ai-name"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-lg font-semibold text-white/90">AI Coach</p>
                  <motion.p
                    className="text-sm text-white/50 mt-0.5 h-5"
                    key={isAISpeaking ? "speaking" : "listening"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isAISpeaking ? "Speaking..." : isMuted ? "You are muted" : "Listening..."}
                  </motion.p>
                </motion.div>
              ) : !isConnecting ? (
                <motion.div
                  key="idle-label"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-lg font-semibold text-white/70">AI Voice Coach</p>
                  <p className="text-sm text-white/35 mt-1">Click to start your voice session</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Call controls */}
          <div className="flex items-center gap-4">
            {/* Mute button — only when connected */}
            <AnimatePresence>
              {isConnected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() => setIsMuted((v) => !v)}
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 border",
                      isMuted
                        ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
                        : "bg-white/10 border-white/15 text-white/70 hover:bg-white/15 hover:text-white"
                    )}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main call button */}
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

            {/* Spacer to balance layout */}
            {isConnected && <div className="w-14 h-14" />}
          </div>
        </div>

        {/* Bottom — Audio device selectors */}
        <div className="w-full max-w-sm flex items-center justify-center gap-3 z-10">
          {/* Microphone */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white/60 hover:text-white/80 transition-all duration-200">
                <Mic className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[120px]">{selectedMic}</span>
                <ChevronDown className="w-3 h-3 shrink-0 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {MOCK_MICROPHONES.map((mic) => (
                <DropdownMenuItem
                  key={mic}
                  onClick={() => setSelectedMic(mic)}
                  className={cn(selectedMic === mic && "bg-muted font-medium")}
                >
                  <Mic className="w-3.5 h-3.5 mr-2 opacity-60" />
                  {mic}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Speaker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white/60 hover:text-white/80 transition-all duration-200">
                <Volume2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[120px]">{selectedSpeaker}</span>
                <ChevronDown className="w-3 h-3 shrink-0 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {MOCK_SPEAKERS.map((speaker) => (
                <DropdownMenuItem
                  key={speaker}
                  onClick={() => setSelectedSpeaker(speaker)}
                  className={cn(selectedSpeaker === speaker && "bg-muted font-medium")}
                >
                  <Volume2 className="w-3.5 h-3.5 mr-2 opacity-60" />
                  {speaker}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Transcript panel — desktop only */}
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
              <TranscriptPanel
                lines={transcriptLines}
                isStreaming={isAISpeaking}
                userInitials={user.initials}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
