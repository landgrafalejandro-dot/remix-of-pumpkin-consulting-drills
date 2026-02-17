import React from "react";
import NavHeader from "@/components/NavHeader";
import { useUserEmail } from "@/hooks/useUserEmail";
import { useUserStats } from "@/hooks/useUserStats";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { BarChart3, Clock, Flame, Target, Brain, FileText } from "lucide-react";

const StatsPage: React.FC = () => {
  const userEmail = useUserEmail();
  const { streak, points, level } = useUserStats(userEmail);
  const { activities } = useRecentActivity(userEmail, 50);

  const totalHours = activities.reduce((sum, a) => sum + a.durationSeconds, 0) / 3600;
  const avgAccuracy = activities.length > 0
    ? Math.round(activities.reduce((sum, a) => sum + a.accuracyPercent, 0) / activities.length)
    : 0;

  const mentalMathSessions = activities.filter(a => a.drillType === "mental_math");
  const caseMathSessions = activities.filter(a => a.drillType === "case_math");
  const mentalMathAccuracy = mentalMathSessions.length > 0
    ? Math.round(mentalMathSessions.reduce((s, a) => s + a.accuracyPercent, 0) / mentalMathSessions.length)
    : 0;
  const caseMathAccuracy = caseMathSessions.length > 0
    ? Math.round(caseMathSessions.reduce((s, a) => s + a.accuracyPercent, 0) / caseMathSessions.length)
    : 0;

  // Last 30 days heatmap
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const count = activities.filter(a => a.createdAt.slice(0, 10) === dateStr).length;
    return { dateStr, count };
  });
  const maxDayCount = Math.max(...last30Days.map(d => d.count), 1);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavHeader />
      <main className="flex flex-1 flex-col items-center px-4 pb-16">
        <div className="w-full max-w-dashboard">
          <h1 className="mb-2 text-h2 text-foreground">📊 Deine Statistiken</h1>
          <p className="mb-8 text-body text-secondary-foreground">Dein gesamter Fortschritt auf einen Blick.</p>

          {!userEmail ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
              Kein Nutzer erkannt. Öffne die App über deinen Kurslink.
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { value: points.toLocaleString("de-DE"), label: "Punkte gesamt", icon: <Target className="h-5 w-5 text-primary" /> },
                  { value: `${totalHours.toFixed(1)}h`, label: "Training", icon: <Clock className="h-5 w-5 text-primary" /> },
                  { value: `${streak}`, label: "Tage Streak", icon: <Flame className="h-5 w-5 text-primary" /> },
                  { value: `${avgAccuracy}%`, label: "Genauigkeit (Ø)", icon: <BarChart3 className="h-5 w-5 text-primary" /> },
                ].map((kpi, i) => (
                  <div key={i} className="flex flex-col items-center rounded-2xl border border-border bg-card p-card-padding">
                    {kpi.icon}
                    <span className="mt-2 font-mono text-3xl font-bold text-foreground">{kpi.value}</span>
                    <span className="mt-1 text-label text-muted-foreground">{kpi.label}</span>
                  </div>
                ))}
              </div>

              {/* 30-day Heatmap */}
              <div className="mt-section-gap rounded-2xl border border-border bg-card p-card-padding">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Aktivität der letzten 30 Tage</h3>
                <div className="flex flex-wrap gap-1">
                  {last30Days.map((d, i) => (
                    <div
                      key={i}
                      title={`${d.dateStr}: ${d.count} Sessions`}
                      className="h-4 w-4 rounded-sm transition-colors"
                      style={{
                        backgroundColor: d.count === 0
                          ? "hsl(var(--muted))"
                          : `hsl(43 96% 56% / ${0.2 + (d.count / maxDayCount) * 0.8})`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Progress per module */}
              <div className="mt-section-gap rounded-2xl border border-border bg-card p-card-padding">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Fortschritt pro Modul</h3>
                <div className="space-y-4">
                  {[
                    { label: "Mental Math", icon: <Brain className="h-4 w-4 text-primary" />, pct: mentalMathAccuracy },
                    { label: "Case Math", icon: <FileText className="h-4 w-4 text-primary" />, pct: caseMathAccuracy },
                    { label: "Frameworks", icon: <BarChart3 className="h-4 w-4 text-muted-foreground" />, pct: 0 },
                    { label: "Market Sizing", icon: <Target className="h-4 w-4 text-muted-foreground" />, pct: 0 },
                  ].map((mod, i) => (
                    <div key={i}>
                      <div className="mb-1 flex items-center gap-2 text-sm">
                        {mod.icon}
                        <span className="text-foreground">{mod.label}</span>
                        <span className="ml-auto text-muted-foreground">{mod.pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${mod.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StatsPage;
