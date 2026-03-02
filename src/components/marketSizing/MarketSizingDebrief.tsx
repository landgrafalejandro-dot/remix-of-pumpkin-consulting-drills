import React from "react";
import { MarketSizingResult } from "@/types/marketSizing";
import { DrillButton } from "@/components/ui/drill-button";
import { Trophy, Target, BarChart3, RotateCcw, CheckCircle, X } from "lucide-react";

interface MarketSizingDebriefProps {
  results: MarketSizingResult[];
  durationSeconds: number;
  onRestart: () => void;
}

const MarketSizingDebrief: React.FC<MarketSizingDebriefProps> = ({
  results, durationSeconds, onRestart,
}) => {
  const evaluated = results.filter((r) => r.evaluation);
  const avgScore = evaluated.length > 0
    ? Math.round(evaluated.reduce((s, r) => s + (r.evaluation?.total_score ?? 0), 0) / evaluated.length)
    : 0;

  const avgStructure = evaluated.length > 0
    ? Math.round(evaluated.reduce((s, r) => s + (r.evaluation?.scores.structure_mece ?? 0), 0) / evaluated.length)
    : 0;
  const avgAssumptions = evaluated.length > 0
    ? Math.round(evaluated.reduce((s, r) => s + (r.evaluation?.scores.assumptions ?? 0), 0) / evaluated.length)
    : 0;
  const avgMath = evaluated.length > 0
    ? Math.round(evaluated.reduce((s, r) => s + (r.evaluation?.scores.math_consistency ?? 0), 0) / evaluated.length)
    : 0;
  const avgPlausibility = evaluated.length > 0
    ? Math.round(evaluated.reduce((s, r) => s + (r.evaluation?.scores.plausibility_sanity ?? 0), 0) / evaluated.length)
    : 0;
  const avgComm = evaluated.length > 0
    ? Math.round(evaluated.reduce((s, r) => s + (r.evaluation?.scores.communication ?? 0), 0) / evaluated.length)
    : 0;

  const emoji = avgScore >= 80 ? "🏆" : avgScore >= 60 ? "🎯" : avgScore >= 40 ? "💪" : "📈";

  const getDurationLabel = (s: number) => {
    if (s <= 120) return "2 Minuten";
    if (s <= 300) return "5 Minuten";
    if (s <= 600) return "10 Minuten";
    return `${Math.floor(s / 60)} Minuten`;
  };

  return (
    <div className="flex flex-col gap-6 py-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center">
        <span className="text-4xl">{emoji}</span>
        <h2 className="mt-2 text-2xl font-bold text-foreground">Market Sizing Sprint beendet!</h2>
        <p className="text-muted-foreground">{getDurationLabel(durationSeconds)} Sprint • {results.length} Aufgabe{results.length !== 1 ? "n" : ""}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center rounded-xl border border-border bg-card/50 p-4">
          <Target className="mb-2 h-6 w-6 text-primary" />
          <span className="text-3xl font-bold text-foreground">{results.length}</span>
          <span className="text-xs text-muted-foreground">Aufgaben</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-border bg-card/50 p-4">
          <Trophy className="mb-2 h-6 w-6 text-success" />
          <span className="text-3xl font-bold text-success">{avgScore}/100</span>
          <span className="text-xs text-muted-foreground">Ø Score</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-border bg-card/50 p-4">
          <BarChart3 className="mb-2 h-6 w-6 text-primary" />
          <span className="text-3xl font-bold text-foreground">{avgStructure}/30</span>
          <span className="text-xs text-muted-foreground">Ø Struktur</span>
        </div>
      </div>

      {/* Average Breakdown */}
      <div className="rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Durchschnittliche Rubrik-Scores</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Struktur & MECE</span><span className="font-medium">{avgStructure}/30</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Annahmen</span><span className="font-medium">{avgAssumptions}/20</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Math. Konsistenz</span><span className="font-medium">{avgMath}/20</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Plausibilität</span><span className="font-medium">{avgPlausibility}/20</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Kommunikation</span><span className="font-medium">{avgComm}/10</span></div>
        </div>
      </div>

      {/* Per-task summary */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Aufgaben-Übersicht</h3>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-border/50 last:border-b-0 px-4 py-3">
              <span className="text-xs text-muted-foreground w-6">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{r.case.prompt}</p>
                <p className="text-xs text-muted-foreground">{r.case.industry_tag} • {r.case.difficulty}</p>
              </div>
              <span className={`text-sm font-bold ${
                (r.evaluation?.total_score ?? 0) >= 70 ? "text-success" : (r.evaluation?.total_score ?? 0) >= 50 ? "text-primary" : "text-destructive"
              }`}>
                {r.evaluation?.total_score ?? "–"}/100
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Restart */}
      <div className="flex justify-center pt-2">
        <DrillButton variant="active" size="lg" onClick={onRestart} className="gap-2">
          <RotateCcw className="h-4 w-4" /> Neuer Sprint
        </DrillButton>
      </div>
    </div>
  );
};

export default MarketSizingDebrief;
