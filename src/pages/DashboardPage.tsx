import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import pumpkinLogo from "@/assets/pumpkin-logo.jpg";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { useUserEmail } from "@/hooks/useUserEmail";

const DashboardPage: React.FC = () => {
  const userEmail = useUserEmail();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-8 pb-6">
        <Link
          to={userEmail ? `/?email=${encodeURIComponent(userEmail)}` : "/"}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Übersicht
        </Link>
        <img src={pumpkinLogo} alt="Pumpkin Logo" className="h-10 w-auto" />
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col items-center px-4 pb-16">
        <div className="w-full max-w-5xl">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Dein Fortschritt
          </h1>
          <p className="mb-8 text-muted-foreground">
            Übersicht über deine bisherigen Drill-Sessions und Performance.
          </p>

          {userEmail ? (
            <UserDashboard userEmail={userEmail} />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                Kein Nutzer erkannt. Öffne die App über deinen Kurslink, um dein
                Dashboard zu sehen.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
