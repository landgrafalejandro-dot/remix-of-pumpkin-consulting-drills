import React, { useState } from "react";
import { DrillAttemptRow } from "@/lib/sessionTracker";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

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
  "investment_roi": "Investment (ROI)",
  breakeven: "Break-even",
  "break_even": "Break-even",
  "market-sizing": "Market Sizing",
  "market_sizing": "Market Sizing",
};

type SortKey = "label" | "count" | "accuracy" | "avgTime";
type SortDir = "asc" | "desc";

interface TaskTypeBreakdownProps {
  attempts: DrillAttemptRow[];
  module: "mental_math" | "case_math";
}

interface RowData {
  key: string;
  label: string;
  count: number;
  correct: number;
  accuracy: number;
  avgTime: number;
}

const TaskTypeBreakdown: React.FC<TaskTypeBreakdownProps> = ({ attempts, module }) => {
  const [sortKey, setSortKey] = useState<SortKey>("count");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const typeMap = module === "mental_math" ? MENTAL_MATH_TYPES : CASE_MATH_TYPES;

  // Group by task_type
  const grouped: Record<string, { count: number; correct: number; totalTime: number }> = {};
  attempts.forEach((a) => {
    const key = a.task_type;
    if (!grouped[key]) grouped[key] = { count: 0, correct: 0, totalTime: 0 };
    grouped[key].count++;
    if (a.is_correct) grouped[key].correct++;
    grouped[key].totalTime += a.response_time_ms;
  });

  const rows: RowData[] = Object.entries(grouped).map(([key, v]) => ({
    key,
    label: typeMap[key] || key,
    count: v.count,
    correct: v.correct,
    accuracy: v.count > 0 ? Math.round((v.correct / v.count) * 100) : 0,
    avgTime: v.count > 0 ? Math.round(v.totalTime / v.count / 1000 * 10) / 10 : 0,
  }));

  rows.sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    if (sortKey === "label") return mul * a.label.localeCompare(b.label);
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
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 cursor-pointer select-none" onClick={() => toggleSort("label")}>
                <span className="flex items-center gap-1">Typ <SortIcon col="label" /></span>
              </th>
              <th className="px-4 py-2 cursor-pointer select-none text-right" onClick={() => toggleSort("count")}>
                <span className="flex items-center justify-end gap-1">Anzahl <SortIcon col="count" /></span>
              </th>
              <th className="px-4 py-2 cursor-pointer select-none text-right" onClick={() => toggleSort("accuracy")}>
                <span className="flex items-center justify-end gap-1">Accuracy <SortIcon col="accuracy" /></span>
              </th>
              <th className="px-4 py-2 cursor-pointer select-none text-right" onClick={() => toggleSort("avgTime")}>
                <span className="flex items-center justify-end gap-1">Ø Zeit <SortIcon col="avgTime" /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-border/50 last:border-b-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">{r.label}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{r.count}</td>
                <td className="px-4 py-3 text-right">
                  <span className={r.accuracy >= 80 ? "text-success font-semibold" : r.accuracy >= 50 ? "text-foreground" : "text-destructive font-semibold"}>
                    {r.accuracy}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">{r.avgTime}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTypeBreakdown;
