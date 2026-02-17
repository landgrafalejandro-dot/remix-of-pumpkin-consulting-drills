import React from "react";
import { Target, Clock, BarChart3, TrendingUp } from "lucide-react";

interface KpiCardsProps {
  sessions: number;
  totalMinutes: number;
  totalTasks: number;
  accuracyPercent: number;
}

const KpiCards: React.FC<KpiCardsProps> = ({
  sessions,
  totalMinutes,
  totalTasks,
  accuracyPercent,
}) => {
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
          className="flex flex-col items-center rounded-xl border border-border bg-card p-4 text-center"
        >
          <div className="mb-2 text-primary">{c.icon}</div>
          <p className="text-xl font-bold text-foreground">{c.value}</p>
          <p className="text-xs text-muted-foreground">{c.label}</p>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
