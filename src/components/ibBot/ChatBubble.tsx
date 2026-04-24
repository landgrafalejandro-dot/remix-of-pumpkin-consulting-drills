import React, { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface ChatBubbleProps {
  role: "user" | "bot";
  text: string;
  audioUrl?: string | null;
  autoPlay?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ role, text, audioUrl, autoPlay }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (autoPlay && audioUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [audioUrl, autoPlay]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-md border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm text-foreground">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex max-w-[80%] flex-col gap-2">
        <div className="rounded-2xl rounded-tl-md border border-white/[0.08] bg-[#101013] px-4 py-2.5 text-sm text-foreground">
          {text}
        </div>
        {audioUrl && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#101013] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <audio
              ref={audioRef}
              src={audioUrl}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              preload="auto"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
