import { useEffect, useState } from "react";
import { fetchDrillSessions, DrillSessionRow } from "@/lib/sessionTracker";

export interface RecentActivity {
  drillType: string;
  correctCount: number;
  totalCount: number;
  accuracyPercent: number;
  durationSeconds: number;
  createdAt: string;
}

export const useRecentActivity = (userEmail: string | null, limit = 5): { activities: RecentActivity[]; loading: boolean } => {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) {
      setActivities([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetchDrillSessions(userEmail).then((sessions) => {
      if (cancelled) return;
      const sorted = [...sessions].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setActivities(
        sorted.slice(0, limit).map((s) => ({
          drillType: s.drill_type,
          correctCount: s.correct_count,
          totalCount: s.total_count,
          accuracyPercent: s.accuracy_percent,
          durationSeconds: s.duration_seconds,
          createdAt: s.created_at,
        }))
      );
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [userEmail, limit]);

  return { activities, loading };
};
