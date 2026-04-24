import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { DifficultyLevel } from "./DifficultySelector";

interface LevelPromptProps {
  type: "up" | "down";
  currentLevel: DifficultyLevel;
  targetLevel: DifficultyLevel;
  onAccept: () => void;
  onDecline: () => void;
}

const levelNames: Record<DifficultyLevel, string> = {
  1: "Einfach",
  2: "Mittel",
  3: "Schwer",
};

const LevelPrompt: React.FC<LevelPromptProps> = ({
  type,
  currentLevel,
  targetLevel,
  onAccept,
  onDecline,
}) => {
  const isLevelUp = type === "up";

  return (
    <div className={`mt-6 rounded-xl border-2 p-4 ${
      isLevelUp 
        ? "border-emerald-500/50 bg-emerald-500/10" 
        : "border-primary/50 bg-primary/10"
    }`}>
      <div className="flex items-center gap-3">
        {isLevelUp ? (
          <TrendingUp className="h-6 w-6 text-emerald-500" />
        ) : (
          <TrendingDown className="h-6 w-6 text-primary" />
        )}
        <div className="flex-1">
          <p className={`font-semibold ${isLevelUp ? "text-emerald-500" : "text-primary"}`}>
            {isLevelUp 
              ? `Stark! Level Up auf "${levelNames[targetLevel]}"?`
              : `Kurz auf "${levelNames[targetLevel]}" zurückschalten?`
            }
          </p>
          <p className="text-sm text-muted-foreground">
            {isLevelUp 
              ? "Du hast 3 Aufgaben in Folge gemeistert!"
              : "Sicherheit gewinnen und Grundlagen festigen."
            }
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={onAccept}
          className={`flex-1 rounded-lg px-4 py-2 font-medium text-white transition-all ${
            isLevelUp
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-primary hover:bg-primary/80"
          }`}
        >
          {isLevelUp ? "Level Up! 🚀" : "Ja, gute Idee"}
        </button>
        <button
          onClick={onDecline}
          className="flex-1 rounded-lg border border-border bg-card px-4 py-2 font-medium text-muted-foreground transition-all hover:bg-muted"
        >
          {isLevelUp ? "Noch nicht" : "Nein, weiter so"}
        </button>
      </div>
    </div>
  );
};

export default LevelPrompt;