import React from "react";
import { DrillButton } from "@/components/ui/drill-button";
import { CaseMathCategory } from "@/types/caseMath";
import { SprintDuration } from "@/types/drill";
import { DifficultyLevel } from "@/components/DifficultySelector";
import { Clock, Zap, Target } from "lucide-react";

interface CaseMathConfigProps {
  duration: SprintDuration;
  onDurationChange: (duration: SprintDuration) => void;
  difficulty: DifficultyLevel;
  onDifficultyChange: (level: DifficultyLevel) => void;
  selectedCategories: CaseMathCategory[];
  onCategoriesChange: (categories: CaseMathCategory[]) => void;
  onStart: () => void;
}

const durationOptions: { value: SprintDuration; label: string; description: string }[] = [
  { value: 120, label: "2 Min", description: "Schneller Sprint" },
  { value: 300, label: "5 Min", description: "Standard" },
  { value: 600, label: "10 Min", description: "Marathon" },
];

const difficultyLevels: { level: DifficultyLevel; label: string; description: string }[] = [
  { level: 1, label: "Einfach", description: "1-Schritt, runde Zahlen" },
  { level: 2, label: "Mittel", description: "2-Schritt, k/Mio Notation" },
  { level: 3, label: "Schwer", description: "Multi-Step, Ablenkungen" },
];

const categoryOptions: { category: CaseMathCategory; label: string }[] = [
  { category: "profitability", label: "Profitabilität" },
  { category: "investment", label: "Investment (ROI)" },
  { category: "breakeven", label: "Break-even" },
  { category: "market-sizing", label: "Market Sizing" },
];

const CaseMathConfig: React.FC<CaseMathConfigProps> = ({
  duration,
  onDurationChange,
  difficulty,
  onDifficultyChange,
  selectedCategories,
  onCategoriesChange,
  onStart,
}) => {
  const handleCategoryToggle = (category: CaseMathCategory) => {
    if (selectedCategories.includes(category)) {
      if (selectedCategories.length > 1) {
        onCategoriesChange(selectedCategories.filter(c => c !== category));
      }
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const selectAllCategories = () => {
    onCategoriesChange(categoryOptions.map(c => c.category));
  };

  const allSelected = selectedCategories.length === categoryOptions.length;

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

      {/* Category Selection */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Target className="h-4 w-4" />
          <span className="text-sm font-medium">Aufgabenkategorien</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={selectAllCategories}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              allSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Alle
          </button>
          {categoryOptions.map(({ category, label }) => (
            <button
              key={category}
              onClick={() => handleCategoryToggle(category)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                selectedCategories.includes(category)
                  ? "bg-primary/20 text-primary border border-primary/50"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-center pt-4">
        <DrillButton
          variant="active"
          size="lg"
          onClick={onStart}
          className="px-12 py-5 text-xl"
        >
          Start Case Math →
        </DrillButton>
      </div>
    </div>
  );
};

export default CaseMathConfig;
