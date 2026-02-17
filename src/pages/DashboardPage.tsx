import React from "react";
import NavHeader from "@/components/NavHeader";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { useUserEmail } from "@/hooks/useUserEmail";

const DashboardPage: React.FC = () => {
  const userEmail = useUserEmail();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavHeader />

      {/* Content */}
      <main className="flex flex-1 flex-col items-center px-4 pb-16">
        <div className="w-full max-w-dashboard">
          <h1 className="mb-2 text-h2 text-foreground">
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
