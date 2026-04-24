import { Clock } from "lucide-react";

interface SessionTimerProps {
  remainingSec: number;
  totalSec: number;
  difficulty: number;
  maxDifficulty: number;
}

const SessionTimer = ({ remainingSec, totalSec, difficulty, maxDifficulty }: SessionTimerProps) => {
  const m = Math.floor(remainingSec / 60);
  const s = remainingSec % 60;
  const pct = Math.max(0, Math.min(100, (remainingSec / totalSec) * 100));
  const warning = remainingSec < 5 * 60;

  return (
    <div className="flex items-center gap-4">
      <div className={`flex items-center gap-1.5 font-mono text-sm font-medium ${warning ? "text-red-400" : "text-foreground"}`}>
        <Clock className="h-4 w-4" />
        {m}:{s.toString().padStart(2, "0")}
      </div>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full transition-all ${warning ? "bg-red-500" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        SL {difficulty}/{maxDifficulty}
      </div>
    </div>
  );
};

export default SessionTimer;
