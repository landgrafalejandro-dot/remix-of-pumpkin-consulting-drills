import React, { useMemo } from "react";
import { ArrowRight, Info } from "lucide-react";
import ConfigRow from "@/components/drillConfig/ConfigRow";
import Chip from "@/components/drillConfig/Chip";
import Divider from "@/components/drillConfig/Divider";
import { IB_TOPIC_LABELS, IB_TOPIC_ORDER, type IBTopic, type IBBotConfigState } from "@/types/ibBot";

interface IBBotConfigProps {
  value: IBBotConfigState;
  onChange: (next: IBBotConfigState) => void;
  onStart: () => void;
  starting: boolean;
}

function mapRating(rating: number): { starting: number; max: number } {
  if (rating <= 8) return { starting: 1, max: 2 };
  if (rating <= 12) return { starting: 2, max: 3 };
  if (rating <= 20) return { starting: 3, max: 5 };
  return { starting: 4, max: 5 };
}

const IBBotConfig: React.FC<IBBotConfigProps> = ({ value, onChange, onStart, starting }) => {
  const { topics, rating, company } = value;

  const slPreview = useMemo(() => mapRating(rating), [rating]);

  const toggleTopic = (topic: IBTopic) => {
    const next = topics.includes(topic)
      ? topics.filter((t) => t !== topic)
      : [...topics, topic];
    onChange({ ...value, topics: next });
  };

  const canStart = topics.length > 0 && rating >= 1 && rating <= 25 && !starting;

  const summary = `SL ${slPreview.starting}-${slPreview.max} · 30 MIN · ${topics.length} ${topics.length === 1 ? "THEMA" : "THEMEN"}`;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d10] p-8">
      <ConfigRow label="Schwerpunktthemen" caption="Wähle ein oder mehrere Themen. Der Bot priorisiert passende Fragen.">
        <div className="flex flex-wrap gap-2">
          {IB_TOPIC_ORDER.map((topic) => (
            <Chip key={topic} selected={topics.includes(topic)} onClick={() => toggleTopic(topic)}>
              {IB_TOPIC_LABELS[topic]}
            </Chip>
          ))}
        </div>
      </ConfigRow>
      <Divider />

      <ConfigRow label="Ziel-Rating" caption="Dein Vorbereitungslevel (1–25). Bestimmt den Start-Schwierigkeitsgrad.">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={25}
              step={1}
              value={rating}
              onChange={(e) => onChange({ ...value, rating: Number(e.target.value) })}
              className="h-1 w-full max-w-[320px] cursor-pointer appearance-none rounded-full bg-white/10 accent-primary"
            />
            <input
              type="number"
              min={1}
              max={25}
              value={rating}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isNaN(n)) onChange({ ...value, rating: Math.max(1, Math.min(25, n)) });
              }}
              className="w-16 rounded-[8px] border border-white/10 bg-[#101013] px-2 py-1.5 text-center text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground/80">
            Start bei SL {slPreview.starting} · Maximum SL {slPreview.max}
          </div>
        </div>
      </ConfigRow>
      <Divider />

      <ConfigRow label="Unternehmen" caption="Optional. Filtert Fragen auf deinen Wunschgeber, falls vorhanden.">
        <input
          type="text"
          value={company}
          onChange={(e) => onChange({ ...value, company: e.target.value })}
          placeholder="z.B. Goldman Sachs, JPMorgan (optional)"
          className="w-full max-w-[360px] rounded-[10px] border border-white/10 bg-[#101013] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none"
        />
      </ConfigRow>
      <Divider />

      <div className="mt-4 flex items-start gap-3 rounded-[10px] border border-white/[0.06] bg-[#101013] px-4 py-3.5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <div className="text-[13px] leading-[1.5] text-foreground/70">
          30-Minuten-Mock-Interview per Sprach- oder Texteingabe. Der Bot prüft deine Antworten kritisch
          und steigert automatisch die Schwierigkeit. Am Ende erhältst du ein detailliertes Feedback.
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground/60">
          {summary}
        </div>
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="flex items-center gap-2 rounded-[10px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {starting ? "Wird gestartet…" : "Interview starten"} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default IBBotConfig;
