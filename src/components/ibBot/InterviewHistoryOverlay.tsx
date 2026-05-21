import React, { useEffect } from "react";
import { X } from "lucide-react";
import ChatBubble from "./ChatBubble";
import type { ChatTurn } from "@/types/ibBot";

interface InterviewHistoryOverlayProps {
  transcript: ChatTurn[];
  onClose: () => void;
}

const InterviewHistoryOverlay: React.FC<InterviewHistoryOverlayProps> = ({ transcript, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          Verlauf
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <X className="h-3.5 w-3.5" />
          Schließen
        </button>
      </header>

      <div role="log" className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-[760px] flex-col gap-4">
          {transcript.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Noch keine Nachrichten.
            </p>
          ) : (
            transcript.map((turn) => (
              <ChatBubble
                key={turn.id}
                role={turn.role}
                text={turn.text}
                audioUrl={turn.audio_url}
                autoPlay={false}
                controls={false}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewHistoryOverlay;
