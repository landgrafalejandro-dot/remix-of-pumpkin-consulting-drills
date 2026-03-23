import React from "react";
import { DrillButton } from "@/components/ui/drill-button";
import { TaskType, SprintDuration } from "@/types/drill";
import { DifficultyLevel } from "@/components/DifficultySelector";
import { Clock, Zap, Target } from "lucide-react";

interface SprintConfigProps {
  duration: SprintDuration;
  onDurationChange: (duration: SprintDuration) => void;
  difficulty: DifficultyLevel;
  onDifficultyChange: (level: DifficultyLevel) => void;
  selectedTypes: TaskType[];
  onTypesChange: (types: TaskType[]) => void;
  onStart: () => void;
}

const durationOptions: { value: SprintDuration; label: string; description: string }[] = [
  { value: 120, label: "2 Min", description: "Schneller Sprint" },
  { value: 300, label: "5 Min", description: "Standard" },
  { value: 600, label: "10 Min", description: "Marathon" },
];

const difficultyLevels: { level: DifficultyLevel; label: string; description: string }[] = [
  { level: 1, label: "Einfach", description: "Sofort im Kopf" },
  { level: 2, label: "Mittel", description: "Mit Shortcut lösbar" },
  { level: 3, label: "Schwer", description: "Stift & Papier" },
];

const taskTypeOptions: { type: TaskType; label: string }[] = [
  { type: "multiplication", label: "Multiplikation" },
  { type: "percentage", label: "Prozentrechnung" },
  { type: "division", label: "Division" },
  { type: "zeros", label: "Nullen-Management" },
];

const SprintConfig: React.FC<SprintConfigProps> = ({
  duration,
  onDurationChange,
  difficulty,
  onDifficultyChange,
  selectedTypes,
  onTypesChange,
  onStart,
}) => {
  const handleTypeToggle = (type: TaskType) => {
    if (selectedTypes.includes(type)) {
      // Don't allow deselecting the last type
      if (selectedTypes.length > 1) {
        onTypesChange(selectedTypes.filter(t => t !== type));
      }
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const selectAllTypes = () => {
    onTypesChange(taskTypeOptions.map(t => t.type));
  };

  const allSelected = selectedTypes.length === taskTypeOptions.length;

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Duration Selection */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Sprint-Dauer</span>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {durationOptions.map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => onDurationChange(value)}
              className={`flex flex-col items-center rounded-xl border-2 px-6 py-4 transition-all ${
                duration === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <span className="text-lg font-bold">{label}</span>
              <span className="mt-1 text-xs opacity-80">{description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">Schwierigkeit</span>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {difficultyLevels.map(({ level, label, description }) => (
            <button
              key={level}
              onClick={() => onDifficultyChange(level)}
              className={`flex flex-col items-center rounded-xl border-2 px-6 py-4 transition-all ${
                difficulty === level
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <span className="text-lg font-bold">{label}</span>
              <span className="mt-1 text-xs opacity-80">{description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Task Type Selection */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Target className="h-4 w-4" />
          <span className="text-sm font-medium">Aufgabentypen</span>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={selectAllTypes}
            className={`flex flex-col items-center rounded-xl border-2 px-6 py-4 transition-all ${
              allSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <span className="text-lg font-bold">Alle</span>
          </button>
          {taskTypeOptions.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => handleTypeToggle(type)}
              className={`flex flex-col items-center rounded-xl border-2 px-6 py-4 transition-all ${
                selectedTypes.includes(type)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <span className="text-lg font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interview Hint */}
      <div className="mx-auto max-w-md rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
        📝 Nutze Stift & Papier – kein Taschenrechner. So übst du unter realen Interview-Bedingungen.
      </div>

      {/* Start Button */}
      <div className="flex justify-center pt-4">
        <DrillButton
          variant="active"
          size="lg"
          onClick={onStart}
          className="px-12 py-5 text-xl"
        >
          Start Drill →
        </DrillButton>
      </div>
    </div>
  );
};

export default SprintConfig;
