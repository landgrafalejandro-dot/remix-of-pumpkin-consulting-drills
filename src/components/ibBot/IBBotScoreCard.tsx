import { Star } from "lucide-react";

interface IBBotScoreCardProps {
  contentScore: number;
  structureScore: number;
  deliveryScore: number;
  rationale: string;
}

const Pillar = ({ label, score }: { label: string; score: number }) => (
  <div className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.08] bg-[#101013] px-6 py-5">
    <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{label}</div>
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-5 w-5 ${n <= score ? "fill-primary text-primary" : "fill-transparent text-white/15"}`}
        />
      ))}
    </div>
    <div className="text-2xl font-semibold text-foreground">{score}/5</div>
  </div>
);

const IBBotScoreCard = ({ contentScore, structureScore, deliveryScore, rationale }: IBBotScoreCardProps) => (
  <div className="flex flex-col gap-5">
    <div className="grid grid-cols-3 gap-3">
      <Pillar label="Inhalt" score={contentScore} />
      <Pillar label="Struktur" score={structureScore} />
      <Pillar label="Delivery" score={deliveryScore} />
    </div>
    {rationale && (
      <div className="rounded-xl border border-white/[0.06] bg-[#0d0d10] px-5 py-4 text-sm leading-relaxed text-foreground/80">
        {rationale}
      </div>
    )}
  </div>
);

export default IBBotScoreCard;
