import React, { useState } from "react";
import { DrillAttemptRow } from "@/lib/sessionTracker";
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, ChevronRight } from "lucide-react";
import AccuracyRing from "./AccuracyRing";

const MENTAL_MATH_TYPES: Record<string, string> = {
  multiplication: "Multiplikation",
  percentage: "Prozentrechnung",
  division: "Division",
  zeros: "Nullen-Management",
  zero_management: "Nullen-Management",
  growth: "Wachstum",
};

const CASE_MATH_TYPES: Record<string, string> = {
  profitability: "Profitabilität",
  investment: "Investment (ROI)",
  investment_roi: "Investment (ROI)",
  breakeven: "Break-even",
  break_even: "Break-even",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Einfach",
  medium: "Mittel",
  hard: "Schwer",
};

type SortKey = "count" | "accuracy";
type SortDir = "asc" | "desc";

interface TaskTypeBreakdownProps {
  attempts: DrillAttemptRow[];
  module: "mental_math" | "case_math";
}

interface DifficultyData {
  difficulty: string;
  count: number;
  correct: number;
  accuracy: number;
}

interface RowData {
  key: string;
  label: string;
  count: number;
  correct: number;
  accuracy: number;
  difficulties: DifficultyData[];
}

const TaskTypeBreakdown: React.FC<TaskTypeBreakdownProps> = ({ attempts, module }) => {
  const [sortKey, setSortKey] = useState<SortKey>("count");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const typeMap = module === "mental_math" ? MENTAL_MATH_TYPES : CASE_MATH_TYPES;

  // Group by task_type, then by difficulty
  const grouped: Record<string, Record<string, { count: number; correct: number }>> = {};
  attempts.forEach((a) => {
    const key = a.task_type;
    const diff = (a as any).difficulty || "medium";
    if (!grouped[key]) grouped[key] = {};
    if (!grouped[key][diff]) grouped[key][diff] = { count: 0, correct: 0 };
    grouped[key][diff].count++;
    if (a.is_correct) grouped[key][diff].correct++;
  });

  const rows: RowData[] = Object.entries(grouped).map(([key, diffs]) => {
    const totalCount = Object.values(diffs).reduce((s, d) => s + d.count, 0);
    const totalCorrect = Object.values(diffs).reduce((s, d) => s + d.correct, 0);

    const difficulties: DifficultyData[] = Object.entries(diffs)
      .map(([diff, v]) => ({
        difficulty: diff,
        count: v.count,
        correct: v.correct,
        accuracy: v.count > 0 ? Math.round((v.correct / v.count) * 100) : 0,
      }))
      .sort((a, b) => {
        const order = { easy: 0, medium: 1, hard: 2 };
        return (order[a.difficulty as keyof typeof order] ?? 1) - (order[b.difficulty as keyof typeof order] ?? 1);
      });

    return {
      key,
      label: typeMap[key] || key,
      count: totalCount,
      correct: totalCorrect,
      accuracy: totalCount > 0 ? Math.round((totalCorrect / totalCount) * 100) : 0,
      difficulties,
    };
  });

  rows.sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    return mul * (a[sortKey] - b[sortKey]);
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const toggleExpand = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Noch keine Aufgaben-Daten in diesem Zeitraum.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 border-b border-border">
        <h4 className="text-sm font-semibold text-foreground">Performance nach Aufgabentyp</h4>
      </div>

      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-3 border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <span>Kategorie</span>
        <span
          className="cursor-pointer select-none flex items-center gap-1 justify-end w-32"
          onClick={() => toggleSort("count")}
        >
          Beantwortet <SortIcon col="count" />
        </span>
        <span
          className="cursor-pointer select-none flex items-center gap-1 justify-end w-20"
          onClick={() => toggleSort("accuracy")}
        >
          Accuracy <SortIcon col="accuracy" />
        </span>
      </div>

      {/* Rows */}
      <div>
        {rows.map((r) => {
          const isExpanded = expandedRows.has(r.key);
          const hasMultipleDiffs = r.difficulties.length > 1;

          return (
            <div key={r.key}>
              {/* Main row */}
              <div
                className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-5 border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors ${hasMultipleDiffs ? "cursor-pointer" : ""}`}
                onClick={() => hasMultipleDiffs && toggleExpand(r.key)}
              >
                <div className="flex items-center gap-2">
                  {hasMultipleDiffs && (
                    isExpanded
                      ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-base font-medium text-foreground">{r.label}</span>
                </div>
                <div className="w-32 text-right">
                  {r.count > 0 ? (
                    <span className="text-base text-muted-foreground">{r.count}</span>
                  ) : (
                    <span className="text-base text-muted-foreground/50">–</span>
                  )}
                </div>
                <div className="w-20 flex justify-end">
                  <AccuracyRing percentage={r.accuracy} disabled={r.count === 0} />
                </div>
              </div>

              {/* Difficulty sub-rows */}
              {isExpanded && r.difficulties.map((d) => (
                <div
                  key={`${r.key}-${d.difficulty}`}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-3 border-b border-border/30 bg-muted/20"
                >
                  <div className="pl-10">
                    <span className="text-sm text-muted-foreground">
                      {DIFFICULTY_LABELS[d.difficulty] || d.difficulty}
                    </span>
                  </div>
                  <div className="w-32 text-right">
                    <span className="text-sm text-muted-foreground">{d.count}</span>
                  </div>
                  <div className="w-20 flex justify-end">
                    <AccuracyRing percentage={d.accuracy} disabled={d.count === 0} size={40} />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskTypeBreakdown;
