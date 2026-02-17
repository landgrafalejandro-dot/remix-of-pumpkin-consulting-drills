import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, Flame, Target } from "lucide-react";
import { useUserEmail } from "@/hooks/useUserEmail";
import { useUserStats } from "@/hooks/useUserStats";

interface NavHeaderProps {
  showStats?: boolean;
}

const NavHeader: React.FC<NavHeaderProps> = ({ showStats = true }) => {
  const userEmail = useUserEmail();
  const { streak, totalSolved } = useUserStats(userEmail);

  const buildLink = (path: string) =>
    userEmail ? `${path}?email=${encodeURIComponent(userEmail)}` : path;

  return (
    <header className="w-full border-b border-border px-6 pt-6 pb-4">
      <div className="mx-auto flex max-w-dashboard items-center justify-between">
        {/* Logo */}
        <Link to={buildLink("/")} className="flex items-center gap-3">
          <span className="font-logo text-logo text-foreground">pumpkin.</span>
        </Link>

        {/* Nav Links */}
        {userEmail && (
          <nav className="flex items-center gap-1">
            <Link
              to={buildLink("/dashboard")}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </nav>
        )}
      </div>

      {/* User Stats Bar */}
      {showStats && userEmail && (
        <div className="mx-auto mt-4 flex max-w-dashboard items-center justify-center">
          <div className="flex items-center gap-6 rounded-xl border border-border bg-secondary px-6 py-2.5">
            <div className="flex items-center gap-2 text-sm">
              <Flame className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{streak}-Tage-Streak</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{totalSolved} Gelöste Aufgaben</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavHeader;
