import { useAudioRecording } from "@/hooks/useAudioRecording";

interface AudioRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function AudioRecorder({ onTranscript, disabled = false }: AudioRecorderProps) {
  const { state, elapsed, start, stop } = useAudioRecording({ onTranscript });

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (state === "transcribing") {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="animate-spin text-sm">⏳</span>
        Wird transkribiert…
      </div>
    );
  }

  if (state === "recording") {
    return (
      <button
        type="button"
        onClick={stop}
        className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/20"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
        </span>
        {formatTime(elapsed)} — Stoppen
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      disabled={disabled}
      title="Audio aufnehmen und transkribieren"
      className="inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
      Diktieren
    </button>
  );
}
