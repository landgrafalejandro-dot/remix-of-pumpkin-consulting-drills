import React from "react";
import { DrillButton } from "@/components/ui/drill-button";
import { SprintDuration } from "@/types/drill";
import { DrillConfig } from "@/types/textDrill";
import { Clock, Zap, Tag } from "lucide-react";

interface TextDrillConfigProps {
  config: DrillConfig;
  duration: SprintDuration;
  onDurationChange: (d: SprintDuration) => void;
  difficulty: "easy" | "medium" | "hard";
  onDifficultyChange: (d: "easy" | "medium" | "hard") => void;
  category: string;
  onCategoryChange: (c: string) => void;
  onStart: () => void;
}

const durationOptions: { value: SprintDuration; label: string; desc: string }[] = [
  { value: 120, label: "2 Min", desc: "Schneller Sprint" },
  { value: 300, label: "5 Min", desc: "Standard" },
  { value: 600, label: "10 Min", desc: "Marathon" },
];

const TextDrillConfig: React.FC<TextDrillConfigProps> = ({
  config, duration, onDurationChange, difficulty, onDifficultyChange,
  category, onCategoryChange, onStart,
}) => {
  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Duration (only in sprint mode) */}
      {config.sprintMode !== false && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Sprint-Dauer</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {durationOptions.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => onDurationChange(value)}
                className={`flex flex-col items-center rounded-xl border-2 px-6 py-4 transition-all ${
                  duration === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                }`}
              >
                <span className="text-lg font-bold">{label}</span>
                <span className="mt-1 text-xs opacity-80">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">Schwierigkeit</span>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {config.difficultyOptions.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => onDifficultyChange(value)}
              className={`flex flex-col items-center rounded-xl border-2 px-6 py-4 transition-all ${
                difficulty === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              <span className="text-lg font-bold">{label}</span>
              <span className="mt-1 text-xs opacity-80">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Tag className="h-4 w-4" />
          <span className="text-sm font-medium">{config.categoryLabel}</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => onCategoryChange("all")}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
              category === "all"
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            Alle
          </button>
          {config.categories.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onCategoryChange(value)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                category === value
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="mx-auto max-w-md rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
        {config.hintText}
      </div>

      {/* Start */}
      <div className="flex justify-center pt-4">
        <DrillButton variant="active" size="lg" onClick={onStart} className="px-12 py-5 text-xl">
          {config.startButtonText}
        </DrillButton>
      </div>
    </div>
  );
};

export default TextDrillConfig;
