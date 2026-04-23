import React, { useEffect } from "react";
import {
  ProductResult,
  formatGermanNumber,
  shortFormat,
  parseGermanNumber,
} from "@/lib/marketSizingHelpers";
import { Target, ShieldCheck } from "lucide-react";

interface ResultStepProps {
  product: ProductResult;
  finalEstimate: string;
  onFinalEstimateChange: (value: string) => void;
  unit: string;
  onUnitChange: (value: string) => void;
  sanityCheck: string;
  onSanityCheckChange: (value: string) => void;
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
    // Only run when product's parsed count changes to "has values"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.parsedCount]);

  const parsedFinal = parseGermanNumber(finalEstimate);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">4. Ergebnis &amp; Sanity Check</h2>
        <p className="text-xs text-muted-foreground">
          Trag deine finale Schätzung ein und prüf kurz, ob die Größenordnung plausibel ist.
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
            {unitHint && <span className="ml-2 text-sm font-normal text-muted-foreground">{unitHint}</span>}
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
            Verstanden als: <span className="font-medium text-foreground">{formatGermanNumber(parsedFinal)}</span>
            {unit ? ` ${unit}` : ""}
          </p>
        )}
      </div>

      {/* Sanity check */}
      <div className="rounded-xl border border-border bg-card p-4">
        <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" /> Sanity Check
        </label>
        <textarea
          value={sanityCheck}
          onChange={(e) => onSanityCheckChange(e.target.value)}
          placeholder="Ist die Größenordnung plausibel? Vergleich oder Gegencheck – 1-2 Sätze."
          rows={2}
          className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default ResultStep;
