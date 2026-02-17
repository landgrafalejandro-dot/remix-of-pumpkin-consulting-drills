import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DrillSessionRow } from "@/lib/sessionTracker";
import { TimeRange } from "./TimeFilter";

interface AccuracyChartProps {
  sessions: DrillSessionRow[];
  module: "mental_math" | "case_math";
  timeRange: TimeRange;
}

interface ChartPoint {
  label: string;
  accuracy: number;
  tasks: number;
}

const AccuracyChart: React.FC<AccuracyChartProps> = ({ sessions, module, timeRange }) => {
  const filtered = sessions.filter((s) => s.drill_type === module);

  if (filtered.length < 2) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Mindestens 2 Sessions nötig für ein Diagramm.
      </div>
    );
  }

  // Group by date or week depending on range
  const useWeeks = timeRange === "90d" || timeRange === "all";
  const buckets: Record<string, { accSum: number; taskSum: number; count: number }> = {};

  filtered.forEach((s) => {
    const d = new Date(s.created_at);
    let key: string;
    if (useWeeks) {
      // ISO week
      const jan1 = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
      key = `KW${week}`;
    } else {
      key = d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
    }
    if (!buckets[key]) buckets[key] = { accSum: 0, taskSum: 0, count: 0 };
    buckets[key].accSum += s.accuracy_percent;
    buckets[key].taskSum += s.total_count;
    buckets[key].count++;
  });

  const data: ChartPoint[] = Object.entries(buckets).map(([label, v]) => ({
    label,
    accuracy: Math.round(v.accSum / v.count),
    tasks: v.taskSum,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h4 className="mb-4 text-sm font-semibold text-foreground">
        Accuracy über Zeit – {module === "mental_math" ? "Mental Math" : "Case Math"}
      </h4>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number, name: string) =>
              name === "Accuracy" ? [`${value}%`, "Accuracy"] : [value, "Aufgaben"]
            }
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="accuracy"
            name="Accuracy"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="tasks"
            name="Aufgaben"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={{ r: 2 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AccuracyChart;
