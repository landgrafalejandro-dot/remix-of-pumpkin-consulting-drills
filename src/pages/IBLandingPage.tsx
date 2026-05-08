import React from "react";
import { Link } from "react-router-dom";
import { Mic, Layers, ArrowLeft } from "lucide-react";
import NavHeader from "@/components/NavHeader";
import ModuleCard, { ModuleCardProps } from "@/components/ModuleCard";
import { useUserEmail } from "@/hooks/useUserEmail";

const modules: Omit<ModuleCardProps, "emailParam">[] = [
  {
    title: "IB Mock Interview",
    description: "30-Min-Sprach-Interview für Investment-Banking-Bewerber mit kritischer KI-Bewertung.",
    icon: <Mic className="h-16 w-16 text-primary" />,
    status: "beta",
    href: "/IB-bot",
    drillType: "ib_bot",
  },
  {
    title: "Anki IB Übung",
    description: "Spaced-Repetition-Karteikarten für IB-Fachwissen — kommt bald.",
    icon: <Layers className="h-16 w-16 text-primary" strokeWidth={1.5} />,
    status: "coming_soon",
  },
];

const IBLandingPage: React.FC = () => {
  const userEmail = useUserEmail();

  const buildLink = (path: string) =>
    userEmail ? `${path}?email=${encodeURIComponent(userEmail)}` : path;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavHeader showStats={false} />

      {/* Hero */}
      <section className="flex flex-col items-center px-4 pt-12 pb-8">
        <Link
          to={buildLink("/")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
        </Link>
        <h1 className="mb-3 text-center text-h1 text-foreground">
          Investment Banking
        </h1>
        <p className="max-w-xl text-center text-body text-secondary-foreground">
          Mock Interviews und Übungen für Investment-Banking-Bewerbungen.
        </p>
      </section>

      {/* Module Grid */}
      <main className="flex flex-1 flex-col items-center px-4 pb-16">
        <div className="w-full max-w-[900px]">
          <div className="grid w-full gap-section-gap sm:grid-cols-2">
            {modules.map((module, i) => (
              <ModuleCard
                key={i}
                {...module}
                emailParam={userEmail}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default IBLandingPage;
