import React from "react";

interface StatsDisplayProps {
  correct: number;
  total: number;
  streak: number;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ correct, total, streak }) => {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>Richtig:</span>
        <span className="font-semibold text-success">{correct}</span>
        <span>/</span>
        <span>{total}</span>
        {total > 0 && (
          <span className="text-muted-foreground">({percentage}%)</span>
        )}
      </div>
      {streak > 1 && (
        <div className="flex items-center gap-2">
          <span>🔥</span>
          <span className="font-semibold text-primary">{streak} Streak</span>
        </div>
      )}
    </div>
  );
};

export default StatsDisplay;
