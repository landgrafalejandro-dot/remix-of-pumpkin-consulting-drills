import React, { useEffect, useRef, useState } from "react";
import { History, X } from "lucide-react";
import SessionTimer from "./SessionTimer";
import SiriOrb, { type OrbState } from "./SiriOrb";
import BotAudioPlayer, { type BotAudioPlayerHandle } from "./BotAudioPlayer";
import InterviewHistoryOverlay from "./InterviewHistoryOverlay";
import IBBotComposer from "./IBBotComposer";
import type { ChatTurn, SessionState } from "@/types/ibBot";
import { SESSION_MAX_SECONDS_CLIENT } from "@/lib/ibBotClient";

interface IBBotChatProps {
  transcript: ChatTurn[];
  sessionState: SessionState;
  botThinking: boolean;
  onSend: (text: string, mode: "text" | "audio") => void;
  onExit: () => void;
}

const IBBotChat: React.FC<IBBotChatProps> = ({
  transcript,
  sessionState,
  botThinking,
  onSend,
  onExit,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const audioPlayerRef = useRef<BotAudioPlayerHandle>(null);

  const lastBotTurn = [...transcript].reverse().find((t) => t.role === "bot");
  const lastUserTurn = [...transcript].reverse().find((t) => t.role === "user");

  const orbState: OrbState = isRecording
    ? "listening"
    : botThinking
      ? "thinking"
      : isBotSpeaking
        ? "speaking"
        : "idle";

  useEffect(() => {
    if (isRecording) audioPlayerRef.current?.pause();
  }, [isRecording]);

  return (
    <div className="mx-auto flex h-full w-full max-w-[1080px] flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <SessionTimer
          remainingSec={sessionState.time_remaining_sec}
          totalSec={SESSION_MAX_SECONDS_CLIENT}
          difficulty={sessionState.current_difficulty}
          maxDifficulty={sessionState.max_difficulty}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <History className="h-3.5 w-3.5" />
            Verlauf
          </button>
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-red-500/40 hover:text-red-400"
          >
            <X className="h-3.5 w-3.5" />
            Beenden
          </button>
        </div>
      </div>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-10">
        <SiriOrb state={orbState} size="240px" />

        {lastBotTurn && (
          <p
            aria-live="polite"
            className="max-w-[920px] text-center text-2xl font-medium leading-relaxed text-foreground"
          >
            {lastBotTurn.text}
          </p>
        )}

        {lastUserTurn && (
          <>
            <div className="h-px w-32 bg-white/10" />
            <p className="max-w-[920px] text-center text-base leading-relaxed text-muted-foreground">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60">
                du
              </span>
              <br />
              {lastUserTurn.text}
            </p>
          </>
        )}
      </main>

      {lastBotTurn?.audio_url && (
        <BotAudioPlayer
          ref={audioPlayerRef}
          audioUrl={lastBotTurn.audio_url}
          autoPlay
          onPlayingChange={setIsBotSpeaking}
        />
      )}

      <div className="border-t border-white/[0.06] px-4 py-4">
        <IBBotComposer
          onSend={onSend}
          disabled={botThinking}
          onRecordingChange={setIsRecording}
        />
      </div>

      {historyOpen && (
        <InterviewHistoryOverlay
          transcript={transcript}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  );
};

export default IBBotChat;
