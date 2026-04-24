import React from "react";
import { Link } from "react-router-dom";
import {
  ListTree, Globe, BarChart3, FileText, Brain, Lightbulb,
  Lock, Clock, CheckCircle, Flame, ArrowRight, Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RevealCardContainer } from "@/components/ui/animated-reveal-card";
import NavHeader from "@/components/NavHeader";
import { useUserEmail } from "@/hooks/useUserEmail";
import { useUserStats } from "@/hooks/useUserStats";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { useModuleStats } from "@/hooks/useModuleStats";

type ModuleStatus = "active" | "beta" | "coming_soon";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: ModuleStatus;
  href?: string;
  emailParam?: string | null;
  stats?: { avgTime: string; accuracy: string; solved: string };
  drillType?: string;
}

/** Inner content used as the default (base) card face. */
const ModuleCardBase: React.FC<
  Pick<ModuleCardProps, "title" | "description" | "icon" | "status" | "stats">
> = ({ title, description, icon, status, stats }) => {
  const isActive = status === "active" || status === "beta";
  const isComingSoon = status === "coming_soon";

  return (
    <div
      className={`relative flex h-full flex-col rounded-[inherit] p-5 ${
        isActive ? "bg-[#101013]" : "bg-[#101013]/50 opacity-50 grayscale"
      }`}
    >
      {status === "beta" && (
        <span className="text-meta absolute right-4 top-4 text-primary">Beta</span>
      )}
      {isComingSoon && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Lock className="h-8 w-8 text-white/30" />
        </div>
      )}

      {/* Icon sub-card */}
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[10px] border border-white/5 bg-[#16161a] text-white">
        {icon}
      </div>

      <h3 className="mb-1.5 text-[18px] font-semibold leading-tight tracking-tight text-white">
        {title}
      </h3>
      <p className="mb-5 flex-1 text-[13px] leading-[1.45] text-white/55">
        {description}
      </p>

      {isActive && stats && (
        <div className="mb-3 flex items-center gap-3 text-[10px] text-white/50">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-3 w-3 text-white/40" />
            {stats.accuracy}
          </span>
          <span className="h-3 w-px bg-white/10" />
          <span className="flex items-center gap-1.5">
            <Target className="h-3 w-3 text-white/40" />
            {stats.solved}
          </span>
        </div>
      )}

      {/* Footer with divider */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3.5">
        <span className="text-meta flex items-center gap-1.5 text-white/50">
          <Clock className="h-3 w-3" />
          {stats?.avgTime ?? (isComingSoon ? "Bald" : "—")}
        </span>
        {isActive && (
          <span className="flex items-center gap-1 text-xs text-white/50">
            Starten <ArrowRight className="h-3 w-3" />
          </span>
        )}
        {isComingSoon && (
          <Badge variant="secondary" className="h-5 rounded-md bg-white/5 text-[10px] font-normal text-white/40">
            Coming Soon
          </Badge>
        )}
      </div>
    </div>
  );
};

/** Pumpkin-ghost overlay face shown on hover. Same content + prominent CTA. */
const ModuleCardOverlay: React.FC<
  Pick<ModuleCardProps, "title" | "description" | "icon" | "stats">
> = ({ title, description, icon, stats }) => (
  <div
    className="relative flex h-full flex-col rounded-[inherit] p-5"
    style={{
      background:
        "linear-gradient(180deg, rgba(255,153,0,0.14) 0%, rgba(255,153,0,0.04) 100%)",
    }}
  >
    {/* Icon sub-card with pumpkin tint */}
    <div
      className="mb-5 flex h-12 w-12 items-center justify-center rounded-[10px] border text-[#ff9900]"
      style={{
        backgroundColor: "rgba(255,153,0,0.15)",
        borderColor: "rgba(255,153,0,0.35)",
      }}
    >
      {icon}
    </div>

    <h3 className="mb-1.5 text-[18px] font-semibold leading-tight tracking-tight text-white">
      {title}
    </h3>
    <p className="mb-5 flex-1 text-[13px] leading-[1.45] text-white/75">
      {description}
    </p>

    {stats && (
      <div className="mb-3 flex items-center gap-3 text-[10px] text-white/65">
        <span className="flex items-center gap-1.5">
          <CheckCircle className="h-3 w-3" />
          {stats.accuracy}
        </span>
        <span className="h-3 w-px bg-white/20" />
        <span className="flex items-center gap-1.5">
          <Target className="h-3 w-3" />
          {stats.solved}
        </span>
      </div>
    )}

    {/* CTA */}
    <div className="mt-auto flex items-center justify-between gap-3">
      <span className="text-meta flex items-center gap-1.5 text-white/60">
        <Clock className="h-3 w-3" />
        {stats?.avgTime ?? "—"}
      </span>
      <span
        className="flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-[13px] font-semibold"
        style={{ backgroundColor: "#ff9900", color: "#0a0a0c" }}
      >
        Jetzt starten <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </div>
  </div>
);

const ModuleCard: React.FC<ModuleCardProps> = ({
  title, description, icon, status, href, emailParam, stats,
}) => {
  const isActive = status === "active" || status === "beta";

  const card = (
    <RevealCardContainer
      disabled={!isActive}
      accent="rgba(255,153,0,0.25)"
      textOnAccent="#ffffff"
      mutedOnAccent="rgba(255,255,255,0.65)"
      className={`min-h-[22rem] transition-transform duration-200 ${
        isActive ? "cursor-pointer hover:-translate-y-0.5" : "cursor-not-allowed"
      }`}
      base={<ModuleCardBase title={title} description={description} icon={icon} status={status} stats={stats} />}
      overlay={<ModuleCardOverlay title={title} description={description} icon={icon} stats={stats} />}
    />
  );

  if (isActive && href) {
    const linkTo = emailParam ? `${href}?email=${encodeURIComponent(emailParam)}` : href;
    return <Link to={linkTo} className="block">{card}</Link>;
  }
  return card;
};

const modules: Omit<ModuleCardProps, "emailParam">[] = [
  { title: "Mental Math", description: "Trainiere Kopfrechnen unter Zeitdruck mit Consulting-Shortcuts.", icon: <Brain className="h-6 w-6" />, status: "active", href: "/mental-math-drill", drillType: "mental_math" },
  { title: "Case Math", description: "Löse realistische Rechenaufgaben aus echten Case-Interviews.", icon: <FileText className="h-6 w-6" />, status: "active", href: "/case-math-drill", drillType: "case_math" },
  { title: "Frameworks", description: "Lerne die wichtigsten Case-Frameworks und strukturierte Problemlösung.", icon: <ListTree className="h-6 w-6" />, status: "active", href: "/frameworks-drill", drillType: "frameworks" },
  { title: "Market Sizing", description: "Schätze Marktgrößen mit Struktur, Annahmen & KI-Bewertung.", icon: <Globe className="h-6 w-6" />, status: "active", href: "/market-sizing-drill", drillType: "market_sizing" },
  { title: "Diagramme", description: "Analysiere Charts, Graphen und Tabellen wie ein Berater.", icon: <BarChart3 className="h-6 w-6" />, status: "active", href: "/chart-drill", drillType: "charts" },
  { title: "Creativity", description: "Entwickle kreative Lösungen und schärfe deinen Geschäftssinn.", icon: <Lightbulb className="h-6 w-6" />, status: "active", href: "/creativity-drill", drillType: "creativity" },
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
  return `${m} MIN SESSION`;
};

const LandingPage: React.FC = () => {
  const userEmail = useUserEmail();
  const { streak, totalSolved } = useUserStats(userEmail);
  const { activities } = useRecentActivity(userEmail, 5);
  const moduleStats = useModuleStats(userEmail);

  const buildLink = (path: string) =>
    userEmail ? `${path}?email=${encodeURIComponent(userEmail)}` : path;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavHeader showStats={false} />

      {/* Hero */}
      <section className="flex flex-col items-center px-4 pt-12 pb-8">
        <h1 className="mb-2 text-center text-[26px] font-semibold tracking-tight text-white">
          Consulting Case Prep Hub
        </h1>
        <p className="max-w-xl text-center text-[14px] text-white/55">
          Dein persönliches Training für das Consulting-Interview. Wähle ein Modul und starte deine Vorbereitung.
        </p>

        {/* Inline Stats */}
        {userEmail && (
          <div className="mt-6 flex items-center gap-6 rounded-xl border border-white/6 bg-[#1c1c22] px-6 py-2.5">
            <div className="flex items-center gap-2 text-sm">
              <Flame className="h-4 w-4 text-primary" />
              <span className="font-medium text-white">{streak}-Tage-Streak</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-medium text-white">{totalSolved} Gelöste Aufgaben</span>
            </div>
          </div>
        )}

        {/* CTAs */}
        {userEmail && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={buildLink("/mental-math-drill")}
              className="flex items-center gap-2 rounded-[10px] bg-[#ff9900] px-5 py-2.5 text-sm font-semibold text-[#0a0a0c] transition-colors hover:bg-[#ffb74d]"
            >
              Weitermachen: Mental Math <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={buildLink("/dashboard")}
              className="flex items-center gap-2 rounded-[10px] border border-white/12 bg-transparent px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-white/25 hover:text-white"
            >
              <BarChart3 className="h-4 w-4" /> Mein Fortschritt
            </Link>
          </div>
        )}
      </section>

      {/* Module Grid */}
      <main className="flex flex-col items-center px-4 pb-16">
        <div className="w-full max-w-dashboard">
          <div className="grid w-full gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, i) => (
              <ModuleCard
                key={i}
                {...module}
                emailParam={userEmail}
                stats={module.drillType ? moduleStats[module.drillType] : undefined}
              />
            ))}
          </div>

          {/* Recent Activity */}
          {userEmail && activities.length > 0 && (
            <section className="mt-12">
              <h2 className="text-meta mb-4 text-white/60">Letzte Aktivität</h2>
              <div className="overflow-hidden rounded-[14px] border border-white/6 bg-[#0d0d10]">
                {activities.map((a, i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-white/5 px-5 py-3.5 last:border-b-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/5 bg-[#16161a]">
                      {a.drillType === "mental_math" ? (
                        <Brain className="h-4 w-4 text-white/70" />
                      ) : a.drillType === "market_sizing" ? (
                        <Globe className="h-4 w-4 text-white/70" />
                      ) : (
                        <FileText className="h-4 w-4 text-white/70" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-white">
                        {a.drillType === "mental_math" ? "Mental Math" : a.drillType === "market_sizing" ? "Market Sizing" : "Case Math"}
                      </p>
                      <p className="text-meta text-white/45">{durationLabel(a.durationSeconds)}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[13px]">
                      <span className="font-medium text-success">{a.correctCount}/{a.totalCount}</span>
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                    </div>
                    <span className="text-meta text-white/45">{timeAgo(a.createdAt)}</span>
                  </div>
                ))}
                <Link
                  to={buildLink("/dashboard")}
                  className="block border-t border-white/5 px-5 py-3 text-center text-sm text-primary transition-colors hover:bg-white/5"
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
