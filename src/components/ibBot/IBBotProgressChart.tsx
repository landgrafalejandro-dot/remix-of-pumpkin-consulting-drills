import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface IBBotProgressChartProps {
  pastSessions: Array<{ started_at: string; avg_score: number }>;
  currentAvg: number;
}

const IBBotProgressChart = ({ pastSessions, currentAvg }: IBBotProgressChartProps) => {
  const data = [
    ...pastSessions.map((s) => ({
      name: new Date(s.started_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
      avg: s.avg_score,
    })),
    { name: "Heute", avg: Math.round(currentAvg * 10) / 10 },
  ];

  if (data.length < 2) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#0d0d10] px-5 py-6 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-2">
          Fortschritt
        </div>
        <div className="text-sm text-foreground/70">
          Dies ist deine erste Session. Absolviere weitere, um deinen Fortschritt zu sehen.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d0d10] px-5 py-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-3">
        Fortschritt (Durchschnitt der drei Säulen)
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <YAxis domain={[1, 5]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#101013",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
              fontSize: "12px",
            }}
          />
          <Line type="monotone" dataKey="avg" stroke="#ff9900" strokeWidth={2} dot={{ r: 4, fill: "#ff9900" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IBBotProgressChart;
