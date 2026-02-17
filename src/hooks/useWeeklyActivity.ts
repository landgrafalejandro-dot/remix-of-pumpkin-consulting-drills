import { useEffect, useState } from "react";
import { fetchDrillSessions } from "@/lib/sessionTracker";

export interface DayActivity {
  day: string; // Mon, Tue, etc.
  date: string;
  count: number;
}

const DAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

export const useWeeklyActivity = (userEmail: string | null): DayActivity[] => {
  const [data, setData] = useState<DayActivity[]>([]);

  useEffect(() => {
    if (!userEmail) {
      setData([]);
      return;
    }

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    fetchDrillSessions(userEmail, weekAgo).then((sessions) => {
      const days: DayActivity[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const count = sessions.filter((s) => s.created_at.slice(0, 10) === dateStr).length;
        days.push({ day: DAY_LABELS[d.getDay()], date: dateStr, count });
      }
      setData(days);
    });
  }, [userEmail]);

  return data;
};
