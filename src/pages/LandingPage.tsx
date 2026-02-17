import React from "react";
import { Link } from "react-router-dom";
import {
  ListTree,
  Globe,
  BarChart3,
  FileText,
  Brain,
  Lightbulb,
  Lock,
  Clock,
  CheckCircle,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import NavHeader from "@/components/NavHeader";
import { useUserEmail } from "@/hooks/useUserEmail";

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
  title,
  description,
  icon,
  status,
  href,
  emailParam,
  stats,
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
      {/* Beta Badge */}
      {status === "beta" && (
        <Badge className="absolute right-4 top-4 border-primary/30 bg-primary/15 text-xs text-primary">
          Beta
        </Badge>
      )}

      {/* Coming Soon overlay */}
      {isComingSoon && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl">
          <Lock className="h-8 w-8 text-muted-foreground/50" />
        </div>
      )}

      {/* Icon with glow */}
      <div
        className={`
          flex h-16 w-16 items-center justify-center rounded-xl
          transition-all duration-300
          ${isActive
            ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
            : "bg-muted text-muted-foreground"
          }
        `}
      >
        {icon}
      </div>

      {/* Title */}
      <h3
        className={`text-h3 ${isActive ? "text-foreground" : "text-muted-foreground"}`}
      >
        {title}
      </h3>

      {/* Description */}
      <p className="text-body text-secondary-foreground">{description}</p>

      {/* Stats bar */}
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

      {/* CTA */}
      {isActive && (
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <span>Starten</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      )}

      {isComingSoon && (
        <Badge variant="secondary" className="text-xs">
          Coming Soon
        </Badge>
      )}
    </div>
  );

  if (isActive && href) {
    const linkTo = emailParam
      ? `${href}?email=${encodeURIComponent(emailParam)}`
      : href;
    return (
      <Link to={linkTo} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

const modules: Omit<ModuleCardProps, "emailParam">[] = [
  {
    title: "Mental Math",
    description:
      "Trainiere Kopfrechnen unter Zeitdruck mit Consulting-Shortcuts.",
    icon: <Brain className="h-8 w-8" />,
    status: "active",
    href: "/mental-math-drill",
    stats: { avgTime: "2.3s", accuracy: "94%", streak: "12" },
  },
  {
    title: "Case Math",
    description:
      "Löse realistische Rechenaufgaben aus echten Case-Interviews.",
    icon: <FileText className="h-8 w-8" />,
    status: "beta",
    href: "/case-math-drill",
    stats: { avgTime: "45s", accuracy: "78%", streak: "5" },
  },
  {
    title: "Frameworks",
    description:
      "Lerne die wichtigsten Case-Frameworks und strukturierte Problemlösung.",
    icon: <ListTree className="h-8 w-8" />,
    status: "coming_soon",
  },
  {
    title: "Market Sizing",
    description:
      "Schätze Marktgrößen mit logischen Top-Down und Bottom-Up Ansätzen.",
    icon: <Globe className="h-8 w-8" />,
    status: "coming_soon",
  },
  {
    title: "Diagramme",
    description: "Analysiere Charts, Graphen und Tabellen wie ein Berater.",
    icon: <BarChart3 className="h-8 w-8" />,
    status: "coming_soon",
  },
  {
    title: "Creativity",
    description:
      "Entwickle kreative Lösungen und schärfe deinen Geschäftssinn.",
    icon: <Lightbulb className="h-8 w-8" />,
    status: "coming_soon",
  },
];

const LandingPage: React.FC = () => {
  const userEmail = useUserEmail();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavHeader />

      {/* Hero */}
      <section className="flex flex-col items-center px-4 pt-12 pb-8">
        <h1 className="mb-3 text-center text-h1 text-foreground">
          Consulting Case Prep Hub
        </h1>
        <p className="max-w-xl text-center text-body text-secondary-foreground">
          Dein umfassendes Training für das Consulting-Interview. Wähle ein
          Modul und starte deine Vorbereitung.
        </p>
      </section>

      {/* Module Grid */}
      <main className="flex flex-1 flex-col items-center px-4 pb-16">
        <div className="grid w-full max-w-dashboard gap-section-gap sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module, index) => (
            <ModuleCard
              key={index}
              {...module}
              emailParam={userEmail}
            />
          ))}
        </div>

        <p className="mt-12 text-center text-label text-muted-foreground">
          Weitere Module werden bald verfügbar sein. Stay tuned!
        </p>
      </main>
    </div>
  );
};

export default LandingPage;
