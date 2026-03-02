import React, { useEffect, useState } from "react";
import {
  fetchDrillSessions,
  fetchDrillAttempts,
  DrillSessionRow,
  DrillAttemptRow,
} from "@/lib/sessionTracker";
import { BarChart3 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TimeFilter, { TimeRange, getDateSince } from "./TimeFilter";
import KpiCards from "./KpiCards";
import TaskTypeBreakdown from "./TaskTypeBreakdown";
import AccuracyChart from "./AccuracyChart";

interface UserDashboardProps {
  userEmail: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ userEmail }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [sessions, setSessions] = useState<DrillSessionRow[]>([]);
  const [attempts, setAttempts] = useState<DrillAttemptRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const since = getDateSince(timeRange);
    Promise.all([
      fetchDrillSessions(userEmail, since),
      fetchDrillAttempts(userEmail, since),
    ]).then(([s, a]) => {
      setSessions(s);
      setAttempts(a);
      setLoading(false);
    });
  }, [userEmail, timeRange]);

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Lade deine Statistiken…
      </div>
    );
  }

  // General KPIs
  const totalSessions = sessions.length;
  const totalTasks = sessions.reduce((sum, s) => sum + s.total_count, 0);
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correct_count, 0);
  const totalMinutes = Math.round(
    sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 60
  );
  const overallAccuracy =
    totalTasks > 0 ? Math.round((totalCorrect / totalTasks) * 100) : 0;

  const hasNoData = totalSessions === 0 && attempts.length === 0;

  if (hasNoData) {
    return (
      <div className="space-y-4">
        <TimeFilter value={timeRange} onChange={setTimeRange} />
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <BarChart3 className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Noch keine Sessions
          </h3>
          <p className="text-sm text-muted-foreground">
            Starte einen Drill, um deinen Fortschritt zu tracken!
          </p>
        </div>
      </div>
    );
  }

  // Module-specific helpers
  const moduleSessions = (m: string) => sessions.filter((s) => s.drill_type === m);
  const moduleAttempts = (m: string) => attempts.filter((a) => a.drill_type === m);

  const moduleKpi = (m: string) => {
    const ms = moduleSessions(m);
    const tasks = ms.reduce((sum, s) => sum + s.total_count, 0);
    const correct = ms.reduce((sum, s) => sum + s.correct_count, 0);
    return {
      sessions: ms.length,
      totalMinutes: Math.round(ms.reduce((sum, s) => sum + s.duration_seconds, 0) / 60),
      totalTasks: tasks,
      accuracyPercent: tasks > 0 ? Math.round((correct / tasks) * 100) : 0,
    };
  };

  return (
    <div className="space-y-6">
      {/* Time Filter */}
      <TimeFilter value={timeRange} onChange={setTimeRange} />

      {/* General KPIs */}
      <KpiCards
        sessions={totalSessions}
        totalMinutes={totalMinutes}
        totalTasks={totalTasks}
        accuracyPercent={overallAccuracy}
        variant="summary"
      />

      {/* Module Tabs */}
      <Tabs defaultValue="mental_math" className="space-y-4">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="mental_math">Mental Math</TabsTrigger>
          <TabsTrigger value="case_math">Case Math</TabsTrigger>
          <TabsTrigger value="market_sizing">Market Sizing</TabsTrigger>
        </TabsList>

        {(["mental_math", "case_math", "market_sizing"] as const).map((mod) => {
          const kpi = moduleKpi(mod);
          const modAttempts = moduleAttempts(mod);

          return (
            <TabsContent key={mod} value={mod} className="space-y-4">
              {/* Module KPIs */}
              <KpiCards {...kpi} />

              {/* Task Type Breakdown */}
              <TaskTypeBreakdown attempts={modAttempts} module={mod} />

              {/* Chart */}
              <AccuracyChart sessions={sessions} module={mod} timeRange={timeRange} />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default UserDashboard;
