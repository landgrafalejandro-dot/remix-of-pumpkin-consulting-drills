import React from "react";
import { DrillButton } from "@/components/ui/drill-button";
import { FeedbackState } from "@/types/drill";
import { Check, X, Lightbulb } from "lucide-react";

interface FeedbackDisplayProps {
  feedback: FeedbackState | null;
  onNext: () => void;
}

const formatNumberDE = (num: number): string => {
  if (num >= 1_000_000_000) {
    const val = num / 1_000_000_000;
    return val % 1 === 0 ? `${val} Mrd` : `${val.toFixed(1).replace('.', ',')} Mrd`;
  }
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    return val % 1 === 0 ? `${val} Mio` : `${val.toFixed(1).replace('.', ',')} Mio`;
  }
  return num.toLocaleString('de-DE', { maximumFractionDigits: 2 });
};

// Parse markdown-style bold text to React elements
const parseStepText = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={index} className="font-bold text-primary">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
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
        {/* Result Header */}
        <div className="mb-5 flex items-center gap-3">
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

        {/* Error Hint */}
        {feedback.errorHint && !feedback.isCorrect && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-destructive/20 p-3">
            <span className="text-lg">⚠️</span>
            <p className="text-sm font-medium text-destructive">
              {feedback.errorHint}
            </p>
          </div>
        )}

        {/* Shortcut Section */}
        <div className="rounded-xl bg-card/60 border border-border/50 overflow-hidden">
          {/* Shortcut Header */}
          <div className="bg-primary/10 px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-primary">
                {feedback.shortcut.name}
              </p>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {feedback.shortcut.description}
            </p>
          </div>
          
          {/* Steps */}
          <div className="p-4 space-y-2">
            {feedback.shortcut.steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-3 ${
                  index === feedback.shortcut.steps.length - 1 
                    ? 'pt-2 mt-2 border-t border-border/30' 
                    : ''
                }`}
              >
                <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                  index === feedback.shortcut.steps.length - 1
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index === feedback.shortcut.steps.length - 1 ? '✓' : index + 1}
                </span>
                <p className={`text-sm leading-relaxed ${
                  index === feedback.shortcut.steps.length - 1
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                }`}>
                  {parseStepText(step)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
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
