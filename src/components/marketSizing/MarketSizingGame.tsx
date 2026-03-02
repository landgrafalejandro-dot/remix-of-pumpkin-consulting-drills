import React, { useState, useRef, useEffect } from "react";
import { MarketSizingCase } from "@/types/marketSizing";
import SprintTimer from "@/components/sprint/SprintTimer";
import { DrillButton } from "@/components/ui/drill-button";
import { X, Send, Info } from "lucide-react";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (currentCase) {
      setAnswerText("");
      setEstimateValue("");
      setEstimateUnit(currentCase.unit_hint || "");
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

      {/* Answer Textarea */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Deine Lösung (Struktur, Annahmen, Rechenschritte)
        </label>
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
