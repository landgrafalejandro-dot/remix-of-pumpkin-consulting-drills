import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";
import SessionTimer from "./SessionTimer";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript.length, botThinking]);

  const lastBotTurnId = [...transcript].reverse().find((t) => t.role === "bot")?.id;

  return (
    <div className="mx-auto flex h-full w-full max-w-[760px] flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <SessionTimer
          remainingSec={sessionState.time_remaining_sec}
          totalSec={SESSION_MAX_SECONDS_CLIENT}
          difficulty={sessionState.current_difficulty}
          maxDifficulty={sessionState.max_difficulty}
        />
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-red-500/40 hover:text-red-400"
        >
          <X className="h-3.5 w-3.5" />
          Beenden
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex flex-col gap-4">
          {transcript.map((turn) => (
            <ChatBubble
              key={turn.id}
              role={turn.role}
              text={turn.text}
              audioUrl={turn.audio_url}
              autoPlay={turn.role === "bot" && turn.id === lastBotTurnId}
            />
          ))}
          {botThinking && <TypingIndicator />}
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-4 py-4">
        <IBBotComposer onSend={onSend} disabled={botThinking} />
      </div>
    </div>
  );
};

export default IBBotChat;
