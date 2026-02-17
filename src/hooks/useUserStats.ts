import { useEffect, useState } from "react";
import { fetchDrillSessions, DrillSessionRow } from "@/lib/sessionTracker";

interface UserStats {
  streak: number;
  points: number;
  level: number;
  totalSolved: number;
  loading: boolean;
}

/** Calculate consecutive days with at least one session, ending today or yesterday. */
const calcStreak = (sessions: DrillSessionRow[]): number => {
  if (sessions.length === 0) return 0;

  const uniqueDays = new Set(
    sessions.map((s) => s.created_at.slice(0, 10)) // YYYY-MM-DD
  );

  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (uniqueDays.has(key)) {
      streak++;
    } else if (i === 0) {
      // today not yet practiced — allow gap for today only
      continue;
    } else {
      break;
    }
  }
  return streak;
};

/** Points = sum of correct answers × 10. */
const calcPoints = (sessions: DrillSessionRow[]): number =>
  sessions.reduce((sum, s) => sum + s.correct_count * 10, 0);

/** Level thresholds. */
const calcLevel = (points: number): number => {
  if (points >= 5000) return 10;
  if (points >= 3000) return 8;
  if (points >= 2000) return 7;
  if (points >= 1500) return 6;
  if (points >= 1000) return 5;
  if (points >= 600) return 4;
  if (points >= 300) return 3;
  if (points >= 100) return 2;
  return 1;
};

export const useUserStats = (userEmail: string | null): UserStats => {
  const [stats, setStats] = useState<UserStats>({
    streak: 0,
    points: 0,
    level: 1,
    totalSolved: 0,
    loading: true,
  });

  useEffect(() => {
    if (!userEmail) {
      setStats({ streak: 0, points: 0, level: 1, totalSolved: 0, loading: false });
      return;
    }

    let cancelled = false;

    fetchDrillSessions(userEmail).then((sessions) => {
      if (cancelled) return;
      const points = calcPoints(sessions);
      const totalSolved = sessions.reduce((sum, s) => sum + s.total_count, 0);
      setStats({
        streak: calcStreak(sessions),
        points,
        level: calcLevel(points),
        totalSolved,
        loading: false,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  return stats;
};
