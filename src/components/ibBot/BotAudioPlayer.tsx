import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

interface BotAudioPlayerProps {
  audioUrl: string | null;
  autoPlay: boolean;
  onPlayingChange: (playing: boolean) => void;
}

export interface BotAudioPlayerHandle {
  pause: () => void;
}

const BotAudioPlayer = forwardRef<BotAudioPlayerHandle, BotAudioPlayerProps>(
  ({ audioUrl, autoPlay, onPlayingChange }, ref) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useImperativeHandle(ref, () => ({
      pause: () => audioRef.current?.pause(),
    }));

    useEffect(() => {
      if (autoPlay && audioUrl && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }, [audioUrl, autoPlay]);

    if (!audioUrl) return null;

    return (
      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => onPlayingChange(true)}
        onPause={() => onPlayingChange(false)}
        onEnded={() => onPlayingChange(false)}
        preload="auto"
      />
    );
  },
);

BotAudioPlayer.displayName = "BotAudioPlayer";

export default BotAudioPlayer;
