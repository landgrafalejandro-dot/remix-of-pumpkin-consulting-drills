import { useEffect, useState } from "react";
import { fetchDrillSessions, fetchDrillAttempts } from "@/lib/sessionTracker";

export interface ModuleStats {
  avgTime: string;
  accuracy: string;
  solved: string;
}

export const useModuleStats = (
  userEmail: string | null
): Record<string, ModuleStats | undefined> => {
  const [stats, setStats] = useState<Record<string, ModuleStats | undefined>>({});

  useEffect(() => {
    if (!userEmail) {
      setStats({});
      return;
    }

    let cancelled = false;

    Promise.all([
      fetchDrillSessions(userEmail),
      fetchDrillAttempts(userEmail),
    ]).then(([sessions, attempts]) => {
      if (cancelled) return;

      const result: Record<string, ModuleStats> = {};

      for (const mod of ["mental_math", "case_math", "market_sizing"] as const) {
        const modSessions = sessions.filter((s) => s.drill_type === mod);
        const modAttempts = attempts.filter((a) => a.drill_type === mod);

        if (modSessions.length === 0) continue;

        const totalTasks = modSessions.reduce((s, x) => s + x.total_count, 0);
        const totalCorrect = modSessions.reduce((s, x) => s + x.correct_count, 0);
        const accuracy = totalTasks > 0 ? Math.round((totalCorrect / totalTasks) * 100) : 0;

        // Average response time from attempts
        const timesMs = modAttempts.filter((a) => a.response_time_ms > 0).map((a) => a.response_time_ms);
        const avgMs = timesMs.length > 0 ? timesMs.reduce((s, t) => s + t, 0) / timesMs.length : 0;
        const avgTime = avgMs >= 60000
          ? `${Math.round(avgMs / 60000)}m`
          : avgMs >= 1000
            ? `${(avgMs / 1000).toFixed(1)}s`
            : `${Math.round(avgMs)}ms`;

        result[mod] = {
          avgTime: timesMs.length > 0 ? avgTime : "–",
          accuracy: `${accuracy}%`,
          solved: `${totalTasks}`,
        };
      }

      setStats(result);
    });

    return () => { cancelled = true; };
  }, [userEmail]);

  return stats;
};
