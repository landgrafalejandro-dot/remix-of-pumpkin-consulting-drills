import React from "react";
import { Link } from "react-router-dom";
import {
  ListTree, Globe, BarChart3, FileText, Brain, Lightbulb,
  Lock, Clock, CheckCircle, Flame, ArrowRight, Target, Zap,
  Trophy, Bell,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import NavHeader from "@/components/NavHeader";
import { useUserEmail } from "@/hooks/useUserEmail";
import { useUserStats } from "@/hooks/useUserStats";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { useWeeklyActivity } from "@/hooks/useWeeklyActivity";

type ModuleStatus = "active" | "beta" | "coming_soon";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: ModuleStatus;
  href?: string;
  emailParam?: string | null;
  stats?: { avgTime: string; accuracy: string; streak: string };
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title, description, icon, status, href, emailParam, stats,
}) => {
  const isActive = status === "active" || status === "beta";
  const isComingSoon = status === "coming_soon";

  const cardContent = (
    <div
      className={`
        group relative flex flex-col items-center gap-section-gap rounded-2xl border p-card-padding text-center
        transition-all duration-300
        ${isActive
          ? "border-primary/20 bg-gradient-to-b from-accent to-card shadow-active hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_50px_rgba(245,158,11,0.15)] cursor-pointer"
          : "border-border bg-card/50 cursor-not-allowed opacity-50 grayscale"
        }
      `}
    >
      {status === "beta" && (
        <Badge className="absolute right-4 top-4 border-primary/30 bg-primary/15 text-xs text-primary">Beta</Badge>
      )}
      {isComingSoon && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl">
          <Lock className="h-8 w-8 text-muted-foreground/50" />
        </div>
      )}
      <div className={`flex h-16 w-16 items-center justify-center rounded-xl transition-all duration-300 ${
        isActive
          ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
          : "bg-muted text-muted-foreground"
      }`}>
        {icon}
      </div>
      <h3 className={`text-h3 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{title}</h3>
      <p className="text-body text-secondary-foreground">{description}</p>
      {isActive && stats && (
        <div className="flex w-full items-center justify-center gap-4 rounded-xl border border-border bg-secondary px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-label">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-secondary-foreground">Ø {stats.avgTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-label">
            <CheckCircle className="h-3.5 w-3.5 text-success" />
            <span className="text-secondary-foreground">{stats.accuracy}</span>
          </div>
          <div className="flex items-center gap-1.5 text-label">
            <Flame className="h-3.5 w-3.5 text-primary" />
            <span className="text-secondary-foreground">{stats.streak}</span>
          </div>
        </div>
      )}
      {isActive && (
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <span>Starten</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      )}
      {isComingSoon && (
        <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
      )}
    </div>
  );

  if (isActive && href) {
    const linkTo = emailParam ? `${href}?email=${encodeURIComponent(emailParam)}` : href;
    return <Link to={linkTo} className="block">{cardContent}</Link>;
  }
  return cardContent;
};

const modules: Omit<ModuleCardProps, "emailParam">[] = [
  { title: "Mental Math", description: "Trainiere Kopfrechnen unter Zeitdruck mit Consulting-Shortcuts.", icon: <Brain className="h-8 w-8" />, status: "active", href: "/mental-math-drill", stats: { avgTime: "2.3s", accuracy: "94%", streak: "12" } },
  { title: "Case Math", description: "Löse realistische Rechenaufgaben aus echten Case-Interviews.", icon: <FileText className="h-8 w-8" />, status: "beta", href: "/case-math-drill", stats: { avgTime: "45s", accuracy: "78%", streak: "5" } },
  { title: "Frameworks", description: "Lerne die wichtigsten Case-Frameworks und strukturierte Problemlösung.", icon: <ListTree className="h-8 w-8" />, status: "coming_soon" },
  { title: "Market Sizing", description: "Schätze Marktgrößen mit logischen Top-Down und Bottom-Up Ansätzen.", icon: <Globe className="h-8 w-8" />, status: "coming_soon" },
  { title: "Diagramme", description: "Analysiere Charts, Graphen und Tabellen wie ein Berater.", icon: <BarChart3 className="h-8 w-8" />, status: "coming_soon" },
  { title: "Creativity", description: "Entwickle kreative Lösungen und schärfe deinen Geschäftssinn.", icon: <Lightbulb className="h-8 w-8" />, status: "coming_soon" },
];

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Gerade eben";
  if (hours < 24) return `Vor ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Gestern";
  return `Vor ${days} Tagen`;
};

const durationLabel = (s: number): string => {
  const m = Math.round(s / 60);
  return `${m} Min Sprint`;
};

const LandingPage: React.FC = () => {
  const userEmail = useUserEmail();
  const { streak, points, level } = useUserStats(userEmail);
  const { activities } = useRecentActivity(userEmail, 5);
  const weeklyData = useWeeklyActivity(userEmail);
  const maxWeekly = Math.max(...weeklyData.map((d) => d.count), 1);

  const buildLink = (path: string) =>
    userEmail ? `${path}?email=${encodeURIComponent(userEmail)}` : path;

  // Milestones
  const nextLevelPoints = [0, 100, 300, 600, 1000, 1500, 2000, 3000, 5000][level] || 5000;
  const levelProgress = Math.min(100, Math.round((points / nextLevelPoints) * 100));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavHeader showStats={false} />

      {/* Hero */}
      <section className="flex flex-col items-center px-4 pt-12 pb-8">
        <h1 className="mb-3 text-center text-h1 text-foreground">
          Consulting Case Prep Hub
        </h1>
        <p className="max-w-xl text-center text-body text-secondary-foreground">
          Dein persönliches Training für das Consulting-Interview. Wähle ein Modul und starte deine Vorbereitung.
        </p>

        {/* Inline Stats */}
        {userEmail && (
          <div className="mt-6 flex items-center gap-6 rounded-xl border border-border bg-secondary px-6 py-2.5">
            <div className="flex items-center gap-2 text-sm">
              <Flame className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{streak}-Tage-Streak</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{points.toLocaleString("de-DE")} Punkte</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">Lv. {level}</span>
            </div>
          </div>
        )}

        {/* CTAs */}
        {userEmail && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={buildLink("/mental-math-drill")}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
            >
              Weitermachen: Mental Math <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={buildLink("/dashboard")}
              className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <BarChart3 className="h-4 w-4" /> Mein Fortschritt
            </Link>
          </div>
        )}
      </section>

      {/* Module Grid */}
      <main className="flex flex-col items-center px-4 pb-16">
        <div className="w-full max-w-dashboard">
          <div className="grid w-full gap-section-gap sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, i) => (
              <ModuleCard key={i} {...module} emailParam={userEmail} />
            ))}
          </div>

          {/* Progress Overview */}
          {userEmail && (
            <section className="mt-16">
              <h2 className="mb-6 text-h2 text-foreground">Dein Fortschritt</h2>
              <div className="grid gap-section-gap md:grid-cols-2">
                {/* Gesamt */}
                <div className="rounded-2xl border border-border bg-card p-card-padding">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <BarChart3 className="h-4 w-4 text-primary" /> Gesamt
                  </h3>
                  <div className="mb-2 font-mono text-stats text-foreground">{points.toLocaleString("de-DE")}</div>
                  <p className="text-sm text-muted-foreground">Punkte · Level {level}</p>
                  <Link to={buildLink("/stats")} className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    Mehr Stats <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* Wochenübersicht */}
                <div className="rounded-2xl border border-border bg-card p-card-padding">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <BarChart3 className="h-4 w-4 text-primary" /> Wochenübersicht
                  </h3>
                  <div className="flex items-end gap-2 h-24">
                    {weeklyData.map((d, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t bg-primary/80 transition-all duration-500"
                          style={{ height: `${Math.max(4, (d.count / maxWeekly) * 80)}px` }}
                        />
                        <span className="text-label text-muted-foreground">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div className="mt-section-gap rounded-2xl border border-border bg-card p-card-padding">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Target className="h-4 w-4 text-primary" /> Nächste Meilensteine
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-secondary-foreground">{points}/{nextLevelPoints} → Level {level + 1}</span>
                      <span className="text-muted-foreground">{levelProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${levelProgress}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-secondary-foreground">{streak}/7 Streak → "Wochensieger"</span>
                      <span className="text-muted-foreground">{Math.min(100, Math.round((streak / 7) * 100))}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-warning transition-all duration-700" style={{ width: `${Math.min(100, (streak / 7) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Recent Activity */}
          {userEmail && activities.length > 0 && (
            <section className="mt-section-gap">
              <h2 className="mb-6 text-h2 text-foreground">Letzte Aktivität</h2>
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                {activities.map((a, i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-border/50 px-6 py-4 last:border-b-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      {a.drillType === "mental_math" ? (
                        <Brain className="h-4 w-4 text-primary" />
                      ) : (
                        <FileText className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {a.drillType === "mental_math" ? "Mental Math" : "Case Math"}
                      </p>
                      <p className="text-label text-muted-foreground">{durationLabel(a.durationSeconds)}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="font-medium text-success">{a.correctCount}/{a.totalCount}</span>
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                    </div>
                    <span className="text-label text-muted-foreground">{timeAgo(a.createdAt)}</span>
                  </div>
                ))}
                <Link
                  to={buildLink("/dashboard")}
                  className="block border-t border-border/50 px-6 py-3 text-center text-sm text-primary hover:bg-accent/50 transition-colors"
                >
                  Alle Aktivitäten anzeigen
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
