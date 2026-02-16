import React, { useEffect, useState } from "react";
import { fetchDrillSessions, DrillSessionRow } from "@/lib/sessionTracker";
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
import { TrendingUp, Target, Clock, BarChart3 } from "lucide-react";

interface UserDashboardProps {
  userEmail: string;
}

interface ChartPoint {
  date: string;
  mental_math?: number;
  case_math?: number;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ userEmail }) => {
  const [sessions, setSessions] = useState<DrillSessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrillSessions(userEmail).then((data) => {
      setSessions(data);
      setLoading(false);
    });
  }, [userEmail]);

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Lade deine Statistiken…
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <BarChart3 className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Noch keine Sessions
        </h3>
        <p className="text-sm text-muted-foreground">
          Starte einen Drill, um deinen Fortschritt zu tracken!
        </p>
      </div>
    );
  }

  // Compute summary stats
  const mentalMath = sessions.filter((s) => s.drill_type === "mental_math");
  const caseMath = sessions.filter((s) => s.drill_type === "case_math");

  const avgAccuracy = (rows: DrillSessionRow[]) =>
    rows.length > 0
      ? Math.round(rows.reduce((sum, r) => sum + r.accuracy_percent, 0) / rows.length)
      : 0;

  const totalTasks = sessions.reduce((sum, s) => sum + s.total_count, 0);
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correct_count, 0);
  const totalMinutes = Math.round(
    sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 60
  );

  // Build chart data: accuracy over time, grouped by date
  const dateMap: Record<string, { mental_math: number[]; case_math: number[] }> = {};
  sessions.forEach((s) => {
    const date = new Date(s.created_at).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
    });
    if (!dateMap[date]) dateMap[date] = { mental_math: [], case_math: [] };
    if (s.drill_type === "mental_math") {
      dateMap[date].mental_math.push(s.accuracy_percent);
    } else {
      dateMap[date].case_math.push(s.accuracy_percent);
    }
  });

  const chartData: ChartPoint[] = Object.entries(dateMap).map(([date, vals]) => {
    const point: ChartPoint = { date };
    if (vals.mental_math.length > 0) {
      point.mental_math = Math.round(
        vals.mental_math.reduce((a, b) => a + b, 0) / vals.mental_math.length
      );
    }
    if (vals.case_math.length > 0) {
      point.case_math = Math.round(
        vals.case_math.reduce((a, b) => a + b, 0) / vals.case_math.length
      );
    }
    return point;
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Sessions"
          value={sessions.length.toString()}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Ø Accuracy"
          value={`${avgAccuracy(sessions)}%`}
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Aufgaben"
          value={`${totalCorrect}/${totalTasks}`}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Trainiert"
          value={`${totalMinutes} Min`}
        />
      </div>

      {/* Drill-specific stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        {mentalMath.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="mb-1 text-sm font-semibold text-foreground">Mental Math</h4>
            <p className="text-2xl font-bold text-primary">{avgAccuracy(mentalMath)}%</p>
            <p className="text-xs text-muted-foreground">
              {mentalMath.length} Sessions · Ø Accuracy
            </p>
          </div>
        )}
        {caseMath.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="mb-1 text-sm font-semibold text-foreground">Case Math</h4>
            <p className="text-2xl font-bold text-primary">{avgAccuracy(caseMath)}%</p>
            <p className="text-xs text-muted-foreground">
              {caseMath.length} Sessions · Ø Accuracy
            </p>
          </div>
        )}
      </div>

      {/* Accuracy Chart */}
      {chartData.length > 1 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="mb-4 text-sm font-semibold text-foreground">
            Accuracy über Zeit
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="mental_math"
                name="Mental Math"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="case_math"
                name="Case Math"
                stroke="hsl(var(--accent-foreground))"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4 text-center">
    <div className="mb-2 text-primary">{icon}</div>
    <p className="text-xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export default UserDashboard;
