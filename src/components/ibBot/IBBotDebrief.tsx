import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, ExternalLink, RotateCcw } from "lucide-react";
import IBBotScoreCard from "./IBBotScoreCard";
import IBBotProgressChart from "./IBBotProgressChart";
import { IB_TOPIC_LABELS, type FinalizeResponse, type IBTopic } from "@/types/ibBot";

interface IBBotDebriefProps {
  data: FinalizeResponse;
  onRestart: () => void;
  backLink: string;
}

const labelForTopic = (topic: string): string => {
  return IB_TOPIC_LABELS[topic as IBTopic] ?? topic;
};

const IBBotDebrief: React.FC<IBBotDebriefProps> = ({ data, onRestart, backLink }) => {
  const { feedback, past_sessions_summary } = data;
  const currentAvg = (feedback.content_score + feedback.structure_score + feedback.delivery_score) / 3;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Dein Interview-Feedback</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Drei-Säulen-Bewertung deiner Performance.
        </p>
      </div>

      <IBBotScoreCard
        contentScore={feedback.content_score}
        structureScore={feedback.structure_score}
        deliveryScore={feedback.delivery_score}
        rationale={feedback.rationale}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Bestandene Themen
          </div>
          {feedback.passed_topics.length === 0 ? (
            <div className="text-xs text-muted-foreground">Keine Themen bis zur Verständnis-Stufe geführt.</div>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {feedback.passed_topics.map((t) => (
                <li key={t} className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                  {labelForTopic(t)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-red-400">
            <XCircle className="h-4 w-4" />
            Baustellen
          </div>
          {feedback.failed_topics.length === 0 ? (
            <div className="text-xs text-muted-foreground">Keine offensichtlichen Schwachstellen — stark!</div>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {feedback.failed_topics.map((t) => (
                <li key={t} className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-300">
                  {labelForTopic(t)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {feedback.strengths.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-[#0d0d10] px-5 py-4">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Stärken</div>
          <ul className="space-y-1.5 text-sm text-foreground/85">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.improvements.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-[#0d0d10] px-5 py-4">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Nächste Schritte</div>
          <ul className="space-y-1.5 text-sm text-foreground/85">
            {feedback.improvements.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">→</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.resource_links.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-[#0d0d10] px-5 py-4">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Empfohlene Ressourcen</div>
          <ul className="space-y-1.5">
            {feedback.resource_links.map((r, i) => (
              <li key={i}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{r.label}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {labelForTopic(r.topic)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <IBBotProgressChart pastSessions={past_sessions_summary} currentAvg={currentAvg} />

      <div className="mt-2 flex items-center justify-between">
        <Link
          to={backLink}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Zum Dashboard
        </Link>
        <button
          type="button"
          onClick={onRestart}
          className="flex items-center gap-2 rounded-[10px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Neues Interview
        </button>
      </div>
    </div>
  );
};

export default IBBotDebrief;
