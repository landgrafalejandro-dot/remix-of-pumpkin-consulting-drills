import React, { useState, useRef, useEffect } from "react";
import { MarketSizingCase } from "@/types/marketSizing";
import SprintTimer from "@/components/sprint/SprintTimer";
import { DrillButton } from "@/components/ui/drill-button";
import { AudioRecorder } from "@/components/ui/AudioRecorder";
import { X, Send, Info, ChevronDown, ChevronUp, Award } from "lucide-react";

interface MarketSizingGameProps {
  currentCase: MarketSizingCase | null;
  timeRemaining: number;
  totalDuration: number;
  onSubmit: (answerText: string, estimateValue: number | null, estimateUnit: string) => void;
  onEnd: () => void;
  isEvaluating: boolean;
}

const MarketSizingGame: React.FC<MarketSizingGameProps> = ({
  currentCase, timeRemaining, totalDuration, onSubmit, onEnd, isEvaluating,
}) => {
  const [answerText, setAnswerText] = useState("");
  const [estimateValue, setEstimateValue] = useState("");
  const [estimateUnit, setEstimateUnit] = useState("");
  const [rubrikOpen, setRubrikOpen] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasSeenRubrik = useRef(false);

  useEffect(() => {
    if (currentCase) {
      setAnswerText("");
      setEstimateValue("");
      setEstimateUnit(currentCase.unit_hint || "");
      if (hasSeenRubrik.current) setRubrikOpen(false);
      hasSeenRubrik.current = true;
      textareaRef.current?.focus();
    }
  }, [currentCase?.id]);

  const handleSubmit = () => {
    if (!answerText.trim()) return;
    const numValue = estimateValue ? parseFloat(estimateValue.replace(",", ".")) : null;
    onSubmit(answerText, numValue, estimateUnit);
  };

  if (!currentCase) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* Timer + End */}
      <div className="flex w-full items-center gap-4">
        <div className="flex-1">
          <SprintTimer timeRemaining={timeRemaining} totalDuration={totalDuration} />
        </div>
        <DrillButton
          variant="inactive"
          size="sm"
          onClick={onEnd}
          className="text-muted-foreground hover:text-destructive hover:border-destructive"
        >
          <X className="h-4 w-4 mr-1" /> Beenden
        </DrillButton>
      </div>

      {/* Case Prompt */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <p className="text-lg font-medium text-foreground leading-relaxed">
          {currentCase.prompt}
        </p>
        {currentCase.unit_hint && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            <span>Zieleinheit: <span className="font-medium text-primary">{currentCase.unit_hint}</span></span>
          </div>
        )}
        {currentCase.allowed_methods && (
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Methode: {currentCase.allowed_methods.replace(/,/g, " / ")}</span>
          </div>
        )}
      </div>

      {/* Rubric */}
      <div className="rounded-xl border border-border bg-card">
        <button
          onClick={() => setRubrikOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Bewertungskriterien
          </span>
          {rubrikOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {rubrikOpen && (
          <div className="border-t border-border px-4 pb-4 pt-3">
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Struktur & MECE", pts: 30 },
                { label: "Annahmen", pts: 20 },
                { label: "Math. Konsistenz", pts: 20 },
                { label: "Plausibilität", pts: 20 },
                { label: "Kommunikation", pts: 10 },
              ].map(({ label, pts }) => (
                <div key={label} className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-xs">
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="text-muted-foreground">({pts} Pkt)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Structure Guide */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">So strukturierst du deine Schätzung:</p>
        <ol className="space-y-1">
          {[
            "Methode wählen — Top-down, Bottom-up oder Mix",
            "Ausgangsgröße festlegen — z.B. Bevölkerung, Haushalte, Unternehmen",
            "Schritt für Schritt einengen — Zielgruppe × Nutzungsrate × Preis × Frequenz",
            "Sanity Check — Ergebnis mit bekannten Vergleichswerten prüfen",
          ].map((step, i) => (
            <li key={i} className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70">{i + 1}.</span>{" "}{step}
            </li>
          ))}
        </ol>
      </div>

      {/* Answer Textarea */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Deine Lösung (Struktur, Annahmen, Rechenschritte)
          </label>
          <AudioRecorder
            onTranscript={(text) => setAnswerText((prev) => prev ? prev + "\n" + text : text)}
            disabled={isEvaluating}
          />
        </div>
        <textarea
          ref={textareaRef}
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder={"1) Methode: Top-down\n2) Basis: 83 Mio Einwohner in DE\n3) Zielgruppe: ...\n4) Nutzung pro Person/Jahr: ...\n5) Preis: ...\n6) Ergebnis: ...\n7) Sanity Check: ..."}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[200px] resize-y"
          disabled={isEvaluating}
        />
      </div>

      {/* Final Estimate */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <label className="mb-3 block text-sm font-semibold text-foreground">
          📊 Finale Schätzung (Pflichtfeld)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={estimateValue}
            onChange={(e) => setEstimateValue(e.target.value)}
            placeholder="z.B. 12000000000 oder 12 Mrd"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isEvaluating}
          />
          <input
            type="text"
            value={estimateUnit}
            onChange={(e) => setEstimateUnit(e.target.value)}
            placeholder="€ / Jahr"
            className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isEvaluating}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-center pt-2">
        <DrillButton
          variant="active"
          size="lg"
          onClick={handleSubmit}
          disabled={!answerText.trim() || isEvaluating}
          className="gap-2 px-8"
        >
          {isEvaluating ? (
            <>
              <span className="animate-spin">⏳</span> KI bewertet...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Abgeben & Bewerten
            </>
          )}
        </DrillButton>
      </div>
    </div>
  );
};

export default MarketSizingGame;
