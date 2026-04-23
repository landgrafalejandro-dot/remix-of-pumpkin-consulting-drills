import React from "react";
import {
  MarketSizingLeaf,
  parseGermanNumber,
  formatGermanNumber,
  shortFormat,
  ProductResult,
} from "@/lib/marketSizingHelpers";
import { Calculator, X } from "lucide-react";

interface CalculationStepProps {
  leaves: MarketSizingLeaf[];
  numbers: Record<string, string>;
  onChange: (numbers: Record<string, string>) => void;
  product: ProductResult;
  unitHint?: string;
  disabled: boolean;
}

const CalculationStep: React.FC<CalculationStepProps> = ({
  leaves,
  numbers,
  onChange,
  product,
  unitHint,
  disabled,
}) => {
  const update = (id: string, value: string) => {
    onChange({ ...numbers, [id]: value });
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground">3. Rechnung</h2>
        <p className="text-xs text-muted-foreground">
          Gib pro Ast eine Zahl ein. Formate wie <code>83 Mio</code>, <code>0,75</code>, <code>75%</code> werden erkannt. Das Zwischenergebnis rechnet automatisch mit.
        </p>
      </div>

      {leaves.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
          Noch keine Äste vorhanden. Zurück zu Schritt 1.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {leaves.map((l, i) => {
            const raw = numbers[l.id] ?? "";
            const parsed = parseGermanNumber(raw);
            return (
              <div
                key={l.id}
                className="flex items-center gap-2 border-b border-border/50 px-3 py-2 last:border-b-0"
              >
                <div className="flex w-6 shrink-0 justify-center text-xs text-muted-foreground/60">
                  {i === 0 ? "" : <X className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{l.labelChain}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={raw}
                    onChange={(e) => update(l.id, e.target.value)}
                    placeholder={i === 0 ? "83 Mio" : "0,75"}
                    className="w-28 rounded-lg border border-border bg-background px-2.5 py-1.5 text-right text-xs font-medium text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={disabled}
                  />
                  <span
                    className={`w-24 truncate text-right text-[10px] ${
                      parsed != null ? "text-muted-foreground" : "text-muted-foreground/30"
                    }`}
                    title={parsed != null ? formatGermanNumber(parsed) : ""}
                  >
                    {parsed != null ? `= ${formatGermanNumber(parsed)}` : ""}
                  </span>
                </div>
              </div>
            );
          })}
          {/* Running total */}
          <div className="flex items-center gap-2 border-t border-primary/30 bg-primary/5 px-3 py-3">
            <Calculator className="h-3.5 w-3.5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground">
                Zwischenergebnis{" "}
                <span className="font-normal text-muted-foreground">
                  ({product.parsedCount}/{product.totalCount} Werte)
                </span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-primary">
                {product.parsedCount > 0 ? shortFormat(product.value) : "—"}
              </span>
              {unitHint && product.parsedCount > 0 && (
                <span className="ml-1 text-xs text-muted-foreground">{unitHint}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculationStep;
