import React from "react";
import { DrillButton } from "@/components/ui/drill-button";
import { FeedbackState } from "@/types/drill";
import { Check, X } from "lucide-react";

interface FeedbackDisplayProps {
  feedback: FeedbackState | null;
  onNext: () => void;
}

const formatNumberDE = (num: number): string => {
  return num.toLocaleString('de-DE', { maximumFractionDigits: 2 });
};

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback, onNext }) => {
  if (!feedback) return null;

  return (
    <div className="mt-8 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={`rounded-2xl border p-6 ${
          feedback.isCorrect
            ? "border-success/30 bg-success/10"
            : "border-destructive/30 bg-destructive/10"
        }`}
      >
        <div className="mb-4 flex items-center gap-3">
          {feedback.isCorrect ? (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success">
                <Check className="h-6 w-6 text-success-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold text-success">Korrekt!</p>
                <p className="text-muted-foreground">
                  Ergebnis: {formatNumberDE(feedback.correctAnswer)}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive">
                <X className="h-6 w-6 text-destructive-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold text-destructive">Falsch</p>
                <p className="text-muted-foreground">
                  Richtig ist: <span className="font-medium text-foreground">{formatNumberDE(feedback.correctAnswer)}</span>
                </p>
              </div>
            </>
          )}
        </div>

        {feedback.errorHint && !feedback.isCorrect && (
          <p className="mb-3 text-sm text-destructive/80">
            💡 {feedback.errorHint}
          </p>
        )}

        <div className="rounded-xl bg-card/50 p-4">
          <p className="text-sm font-medium text-muted-foreground">Shortcut:</p>
          <p className="mt-1 text-foreground">{feedback.shortcut}</p>
        </div>

        <div className="mt-6 flex justify-center">
          <DrillButton variant="active" size="lg" onClick={onNext}>
            Nächste Aufgabe →
          </DrillButton>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDisplay;
