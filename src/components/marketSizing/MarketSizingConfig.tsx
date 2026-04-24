import React from "react";
import { DrillButton } from "@/components/ui/drill-button";
import { Zap, Tag } from "lucide-react";

interface MarketSizingConfigProps {
  difficulty: "easy" | "medium" | "hard";
  onDifficultyChange: (d: "easy" | "medium" | "hard") => void;
  industryTag: string;
  onIndustryTagChange: (t: string) => void;
  onStart: () => void;
}

const difficultyOptions = [
  { value: "easy" as const, label: "Einfach", desc: "1 Segment, Top-down" },
  { value: "medium" as const, label: "Mittel", desc: "2 Segmente, MECE" },
  { value: "hard" as const, label: "Schwer", desc: "Multi-Segment, Sensitivität" },
];

const industries = [
  "all", "mobility", "energy", "retail", "consumer", "saas", "fintech",
  "healthcare", "logistics", "telecom", "education", "real_estate", "travel", "manufacturing",
];

const industryLabels: Record<string, string> = {
  all: "Alle Themen",
  mobility: "Mobility",
  energy: "Energy",
  retail: "Retail",
  consumer: "Consumer",
  saas: "SaaS",
  fintech: "Fintech",
  healthcare: "Healthcare",
  logistics: "Logistics",
  telecom: "Telecom",
  education: "Education",
  real_estate: "Real Estate",
  travel: "Travel",
  manufacturing: "Manufacturing",
};

const MarketSizingConfig: React.FC<MarketSizingConfigProps> = ({
  difficulty, onDifficultyChange,
  industryTag, onIndustryTagChange, onStart,
}) => {
  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Difficulty */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">Schwierigkeit</span>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {difficultyOptions.map(({ value, label, desc }) => (
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

      {/* Industry */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Tag className="h-4 w-4" />
          <span className="text-sm font-medium">Industrie / Thema</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => onIndustryTagChange(ind)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                industryTag === ind
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {industryLabels[ind] || ind}
            </button>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="mx-auto max-w-md rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
        🧠 Market Sizing = Struktur + Annahmen + Plausibilität. Die KI bewertet deine Antwort nach fester Rubrik.
      </div>

      {/* Start */}
      <div className="flex justify-center pt-4">
        <DrillButton variant="active" size="lg" onClick={onStart} className="px-12 py-5 text-xl">
          Start Market Sizing →
        </DrillButton>
      </div>
    </div>
  );
};

export default MarketSizingConfig;
