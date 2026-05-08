import React, { useEffect } from "react";
import {
  ProductResult,
  formatGermanNumber,
  shortFormat,
  parseGermanNumber,
} from "@/lib/marketSizingHelpers";
import { Target, ShieldCheck, Scale } from "lucide-react";
import { SanityCheckStructured } from "@/types/marketSizing";

interface ResultStepProps {
  product: ProductResult;
  finalEstimate: string;
  onFinalEstimateChange: (value: string) => void;
  unit: string;
  onUnitChange: (value: string) => void;
  sanityCheck: SanityCheckStructured;
  onSanityCheckChange: (value: SanityCheckStructured) => void;
  disabled: boolean;
  unitHint?: string;
}

const ResultStep: React.FC<ResultStepProps> = ({
  product,
  finalEstimate,
  onFinalEstimateChange,
  unit,
  onUnitChange,
  sanityCheck,
  onSanityCheckChange,
  disabled,
  unitHint,
}) => {
  // Auto-fill final estimate from computed product the first time the user
  // lands here, as long as they haven't typed anything and the product has a value.
  useEffect(() => {
    if (!finalEstimate && product.parsedCount > 0) {
      onFinalEstimateChange(formatGermanNumber(product.value, 0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.parsedCount]);

  const parsedFinal = parseGermanNumber(finalEstimate);
  const parsedComparison = parseGermanNumber(sanityCheck.comparisonValue);

  const update = (patch: Partial<SanityCheckStructured>) =>
    onSanityCheckChange({ ...sanityCheck, ...patch });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">5. Ergebnis &amp; Sanity Check</h2>
        <p className="text-xs text-muted-foreground">
          Trag deine finale Schätzung ein und prüf strukturiert, ob die Größenordnung plausibel ist.
        </p>
      </div>

      {/* Computed product reminder */}
      {product.parsedCount > 0 && (
        <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Aus deiner Rechnung ({product.parsedCount}/{product.totalCount} Werte eingegeben):
          </p>
          <p className="mt-0.5 text-lg font-semibold text-foreground">
            {shortFormat(product.value)}
            {unitHint && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {unitHint}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Final estimate input */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
          <Target className="h-3.5 w-3.5 text-primary" /> Finale Schätzung
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={finalEstimate}
            onChange={(e) => onFinalEstimateChange(e.target.value)}
            placeholder="z.B. 75 Mio oder 75.000.000"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={disabled}
          />
          <input
            type="text"
            value={unit}
            onChange={(e) => onUnitChange(e.target.value)}
            placeholder="Einheit"
            className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={disabled}
          />
        </div>
        {parsedFinal != null && (
          <p className="mt-2 text-xs text-muted-foreground">
            Verstanden als:{" "}
            <span className="font-medium text-foreground">
              {formatGermanNumber(parsedFinal)}
            </span>
            {unit ? ` ${unit}` : ""}
          </p>
        )}
      </div>

      {/* Structured Sanity Check */}
      <div className="rounded-xl border border-border bg-card p-4">
        <label className="mb-3 flex items-center gap-2 text-xs font-semibold text-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" /> Sanity Check
        </label>

        {/* Magnitude check */}
        <div className="mb-3">
          <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
            Größenordnung-Check
          </label>
          <textarea
            value={sanityCheck.magnitudeCheck}
            onChange={(e) => update({ magnitudeCheck: e.target.value })}
            placeholder="z.B. „Liegt im Bereich 50-100M, was plausibel ist da Deutschland 80M Einwohner hat."
            rows={2}
            className="w-full resize-y rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={disabled}
          />
        </div>

        {/* Comparison reference + value */}
        <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Scale className="h-3 w-3" /> Vergleichswert (optional)
            </label>
            <input
              type="text"
              value={sanityCheck.comparisonRef}
              onChange={(e) => update({ comparisonRef: e.target.value })}
              placeholder="z.B. „Statistisches Bundesamt", „eigene Erfahrung"
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
              Zahl
            </label>
            <input
              type="text"
              value={sanityCheck.comparisonValue}
              onChange={(e) => update({ comparisonValue: e.target.value })}
              placeholder="z.B. 83 Mio"
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={disabled}
            />
          </div>
        </div>
        {parsedComparison != null && (
          <p className="-mt-2 mb-3 text-[10px] text-muted-foreground">
            Verstanden als:{" "}
            <span className="font-medium text-foreground">
              {formatGermanNumber(parsedComparison)}
            </span>
          </p>
        )}

        {/* Reasoning */}
        <div>
          <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
            Plausibilitäts-Begründung (1-2 Sätze)
          </label>
          <textarea
            value={sanityCheck.reasoning}
            onChange={(e) => update({ reasoning: e.target.value })}
            placeholder="Warum ist deine Schätzung plausibel? Welche Verzerrungen könnten drinstecken?"
            rows={2}
            className="w-full resize-y rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default ResultStep;
