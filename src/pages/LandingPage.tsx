import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  ListTree, 
  Globe, 
  BarChart3, 
  FileText, 
  Brain, 
  Lightbulb 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import pumpkinLogo from "@/assets/pumpkin-logo.jpg";
import { useUserEmail } from "@/hooks/useUserEmail";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  href?: string;
  emailParam?: string | null;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ 
  title, 
  description, 
  icon, 
  isActive, 
  href,
  emailParam,
}) => {
  const cardContent = (
    <div
      className={`
        group relative flex flex-col items-center gap-4 rounded-2xl border p-8 text-center
        transition-all duration-300
        ${isActive 
          ? "border-primary/30 bg-card hover:border-primary hover:shadow-lg hover:shadow-primary/10 cursor-pointer hover:scale-[1.02]" 
          : "border-border bg-card/50 cursor-not-allowed opacity-70"
        }
      `}
    >
      {/* Coming Soon Badge for inactive cards */}
      {!isActive && (
        <Badge 
          variant="secondary" 
          className="absolute right-4 top-4 text-xs"
        >
          Coming Soon
        </Badge>
      )}

      {/* Icon */}
      <div
        className={`
          flex h-16 w-16 items-center justify-center rounded-xl
          transition-colors duration-300
          ${isActive 
            ? "bg-primary/10 text-primary group-hover:bg-primary/20" 
            : "bg-muted text-muted-foreground"
          }
        `}
      >
        {icon}
      </div>

      {/* Title */}
      <h3
        className={`
          text-xl font-semibold
          ${isActive ? "text-foreground" : "text-muted-foreground"}
        `}
      >
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground whitespace-pre-line">
        {description}
      </p>

      {/* Active indicator */}
      {isActive && (
        <div className="mt-2 flex items-center gap-2 text-sm font-medium text-primary">
          <span>Starten</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      )}
    </div>
  );

  if (isActive && href) {
    const linkTo = emailParam ? `${href}?email=${encodeURIComponent(emailParam)}` : href;
    return (
      <Link to={linkTo} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

const modules = [
  {
    title: "Mental Math",
    description: "Trainiere Kopfrechnen unter Zeitdruck mit Consulting-Shortcuts.",
    icon: <Brain className="h-8 w-8" />,
    isActive: true,
    href: "/mental-math-drill",
  },
  {
    title: "Case Math (Textaufgaben)",
    description: "Löse realistische Rechenaufgaben aus echten Case-Interviews.\nBeta Version",
    icon: <FileText className="h-8 w-8" />,
    isActive: true,
    href: "/case-math-drill",
  },
  {
    title: "Frameworks & Strukturierung",
    description: "Lerne die wichtigsten Case-Frameworks und strukturierte Problemlösung.",
    icon: <ListTree className="h-8 w-8" />,
    isActive: false,
  },
  {
    title: "Market Sizing",
    description: "Schätze Marktgrößen mit logischen Top-Down und Bottom-Up Ansätzen.",
    icon: <Globe className="h-8 w-8" />,
    isActive: false,
  },
  {
    title: "Diagramme auswerten",
    description: "Analysiere Charts, Graphen und Tabellen wie ein Berater.",
    icon: <BarChart3 className="h-8 w-8" />,
    isActive: false,
  },
  {
    title: "Creativity & Business Sense",
    description: "Entwickle kreative Lösungen und schärfe deinen Geschäftssinn.",
    icon: <Lightbulb className="h-8 w-8" />,
    isActive: false,
  },
];

const LandingPage: React.FC = () => {
  const userEmail = useUserEmail();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex flex-col items-center px-4 pt-16 pb-12">
        <div className="mb-6">
          <img 
            src={pumpkinLogo} 
            alt="Pumpkin Logo" 
            className="h-20 w-auto"
          />
        </div>
        <h1 className="mb-3 text-center text-4xl font-bold text-foreground md:text-5xl">
          Consulting Case Prep Hub
        </h1>
        <p className="max-w-xl text-center text-lg text-muted-foreground">
          Dein umfassendes Training für das Consulting-Interview. 
          Wähle ein Modul und starte deine Vorbereitung.
        </p>
      </header>

      {/* Dashboard Link */}
      {userEmail && (
        <div className="flex justify-center px-4 pb-6">
          <Link
            to={`/dashboard?email=${encodeURIComponent(userEmail)}`}
            className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/20 hover:shadow-lg hover:shadow-primary/10"
          >
            <BarChart3 className="h-5 w-5" />
            Mein Dashboard
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      )}

      {/* Module Grid */}
      <main className="flex flex-1 flex-col items-center px-4 pb-16">
        <div className="grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module, index) => (
            <ModuleCard
              key={index}
              title={module.title}
              description={module.description}
              icon={module.icon}
              isActive={module.isActive}
              href={module.href}
              emailParam={userEmail}
            />
          ))}
        </div>

        {/* Footer hint */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Weitere Module werden bald verfügbar sein. Stay tuned!
        </p>
      </main>
    </div>
  );
};

export default LandingPage;
