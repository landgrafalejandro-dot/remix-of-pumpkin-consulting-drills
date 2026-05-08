import React from "react";
import { Briefcase, TrendingUp } from "lucide-react";
import NavHeader from "@/components/NavHeader";
import ModuleCard from "@/components/ModuleCard";
import { useUserEmail } from "@/hooks/useUserEmail";

const HomePage: React.FC = () => {
  const userEmail = useUserEmail();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavHeader showStats={false} />

      {/* Hero */}
      <section className="flex flex-col items-center px-4 pt-12 pb-8">
        <h1 className="mb-3 text-center text-h1 text-foreground">
          Wähle deinen Bereich
        </h1>
        <p className="max-w-xl text-center text-body text-secondary-foreground">
          Trainiere gezielt für Consulting Cases oder Investment Banking Interviews.
        </p>
      </section>

      {/* 2-Box Grid */}
      <main className="flex flex-1 flex-col items-center px-4 pb-16">
        <div className="w-full max-w-[900px]">
          <div className="grid w-full gap-section-gap sm:grid-cols-2">
            <ModuleCard
              title="Consulting"
              description="6 Drills für Case-Interviews: Mental Math, Frameworks, Market Sizing & mehr."
              icon={<Briefcase className="h-16 w-16 text-primary" strokeWidth={1.5} />}
              status="active"
              href="/consulting"
              emailParam={userEmail}
            />
            <ModuleCard
              title="Investment Banking"
              description="Mock Interviews & Übungen für IB-Bewerbungen."
              icon={<TrendingUp className="h-16 w-16 text-primary" strokeWidth={1.5} />}
              status="active"
              href="/ib"
              emailParam={userEmail}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
