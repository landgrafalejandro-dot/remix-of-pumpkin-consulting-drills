import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, Paperclip, Square } from "lucide-react";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { cn } from "@/lib/utils";

interface IBBotComposerProps {
  onSend: (text: string, mode: "text" | "audio") => void;
  disabled?: boolean;
}

const MIN_HEIGHT = 60;
const MAX_HEIGHT = 200;

const IBBotComposer: React.FC<IBBotComposerProps> = ({ onSend, disabled }) => {
  const [value, setValue] = useState("");
  const [lastInputMode, setLastInputMode] = useState<"text" | "audio">("text");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback((reset?: boolean) => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (reset) {
      ta.style.height = `${MIN_HEIGHT}px`;
      return;
    }
    ta.style.height = `${MIN_HEIGHT}px`;
    const next = Math.max(MIN_HEIGHT, Math.min(ta.scrollHeight, MAX_HEIGHT));
    ta.style.height = `${next}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  const { state, elapsed, start, stop } = useAudioRecording({
    onTranscript: (text) => {
      setValue((prev) => (prev ? prev + " " + text : text));
      setLastInputMode("audio");
      requestAnimationFrame(() => adjustHeight());
    },
  });

  const recording = state === "recording";
  const transcribing = state === "transcribing";

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text, lastInputMode);
    setValue("");
    setLastInputMode("text");
    adjustHeight(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled) handleSend();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const canSend = value.trim().length > 0 && !disabled && !recording && !transcribing;

  return (
    <div className="w-full">
      <div className="relative rounded-xl border border-white/[0.08] bg-[#101013] focus-within:border-primary/40">
        <div className="overflow-y-auto">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setLastInputMode("text");
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              recording
                ? "Aufnahme läuft…"
                : transcribing
                  ? "Wird transkribiert…"
                  : "Deine Antwort — tippen oder Mikro nutzen"
            }
            disabled={disabled || recording || transcribing}
            className={cn(
              "w-full resize-none bg-transparent px-4 py-3 text-sm text-foreground",
              "placeholder:text-muted-foreground/50",
              "focus:outline-none",
              "min-h-[60px] disabled:opacity-60",
            )}
            style={{ overflow: "hidden" }}
          />
        </div>

        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              title="Attach (coming soon)"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/40 transition-colors hover:bg-white/5"
            >
              <Paperclip className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {recording ? (
              <button
                type="button"
                onClick={stop}
                className="flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/25"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                {formatTime(elapsed)}
                <Square className="h-3 w-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={start}
                disabled={disabled || transcribing}
                title="Audio aufnehmen"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-transparent text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Mic className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              title="Senden"
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                canSend
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-white/10 bg-transparent text-muted-foreground/40",
              )}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IBBotComposer;
