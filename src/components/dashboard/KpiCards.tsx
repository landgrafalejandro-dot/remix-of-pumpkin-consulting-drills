import React from "react";
import { Target, Clock, BarChart3, TrendingUp } from "lucide-react";

interface KpiCardsProps {
  sessions: number;
  totalMinutes: number;
  totalTasks: number;
  accuracyPercent: number;
  variant?: "summary" | "module";
}

const KpiCards: React.FC<KpiCardsProps> = ({
  sessions,
  totalMinutes,
  totalTasks,
  accuracyPercent,
  variant = "module",
}) => {
  const isSummary = variant === "summary";

  const cards = [
    { icon: <Target className="h-5 w-5" />, label: "Sessions", value: sessions.toString() },
    { icon: <Clock className="h-5 w-5" />, label: "Trainiert", value: `${totalMinutes} Min` },
    { icon: <BarChart3 className="h-5 w-5" />, label: "Aufgaben", value: totalTasks.toString() },
    { icon: <TrendingUp className="h-5 w-5" />, label: "Ø Accuracy", value: `${accuracyPercent}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`flex flex-col items-center rounded-xl border text-center ${
            isSummary
              ? "border-primary/40 bg-primary/10 p-5"
              : "border-border bg-card p-4"
          }`}
        >
          <div className={`mb-2 ${isSummary ? "text-primary" : "text-muted-foreground"}`}>{c.icon}</div>
          <p className={`font-bold text-foreground ${isSummary ? "text-2xl" : "text-xl"}`}>{c.value}</p>
          <p className={`text-muted-foreground ${isSummary ? "text-sm font-medium" : "text-xs"}`}>{c.label}</p>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
