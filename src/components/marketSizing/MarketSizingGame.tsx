import React, { useState, useEffect, useMemo, useCallback } from "react";
import { MarketSizingCase } from "@/types/marketSizing";
import { FrameworkNode } from "@/types/frameworkBuilder";
import { createEmptyNode, serializeFramework, isFrameworkValid } from "@/lib/frameworkSerializer";
import {
  getLeaves,
  computeProduct,
  serializeMarketSizing,
} from "@/lib/marketSizingHelpers";
import { DrillButton } from "@/components/ui/drill-button";
import { X, Send, Info, ArrowLeft, ArrowRight } from "lucide-react";
import StepperHeader, { STEP_LABELS } from "./steps/StepperHeader";
import StructureStep from "./steps/StructureStep";
import AssumptionsStep from "./steps/AssumptionsStep";
import CalculationStep from "./steps/CalculationStep";
import ResultStep from "./steps/ResultStep";

interface MarketSizingGameProps {
  currentCase: MarketSizingCase | null;
  onSubmit: (answerText: string, estimateValue: number | null, estimateUnit: string) => void;
  onEnd: () => void;
  isEvaluating: boolean;
  onOpenIntro?: () => void;
}

const MarketSizingGame: React.FC<MarketSizingGameProps> = ({
  currentCase,
  onSubmit,
  onEnd,
  isEvaluating,
  onOpenIntro,
}) => {
  // Step state
  const [currentStep, setCurrentStep] = useState(0);

  // Data state
  const [nodes, setNodes] = useState<FrameworkNode[]>([createEmptyNode()]);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [assumptions, setAssumptions] = useState<Record<string, string>>({});
  const [numbers, setNumbers] = useState<Record<string, string>>({});
  const [finalEstimate, setFinalEstimate] = useState("");
  const [estimateUnit, setEstimateUnit] = useState("");
  const [sanityCheck, setSanityCheck] = useState("");

  // Reset when a new case loads
  useEffect(() => {
    if (currentCase) {
      setCurrentStep(0);
      setNodes([createEmptyNode()]);
      setLastAddedId(null);
      setAssumptions({});
      setNumbers({});
      setFinalEstimate("");
      setEstimateUnit(currentCase.unit_hint || "");
      setSanityCheck("");
    }
  }, [currentCase?.id]);

  // Derived state
  const leaves = useMemo(() => getLeaves(nodes), [nodes]);
  const product = useMemo(() => computeProduct(leaves, numbers), [leaves, numbers]);

  // Advance guards
  const canAdvanceFromStructure = isFrameworkValid({ nodes });
  const canSubmit =
    !isEvaluating &&
    (finalEstimate.trim().length > 0 || product.parsedCount > 0);

  const goNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    const treeText = serializeFramework({ nodes });
    const serialized = serializeMarketSizing({
      treeText,
      leaves,
      assumptions,
      numbers,
      product,
      finalEstimateInput: finalEstimate,
      finalEstimateUnit: estimateUnit,
      sanityCheck,
    });
    onSubmit(
      serialized.answerText,
      serialized.finalEstimateValue,
      serialized.finalEstimateUnit
    );
  }, [
    canSubmit,
    nodes,
    leaves,
    assumptions,
    numbers,
    product,
    finalEstimate,
    estimateUnit,
    sanityCheck,
    onSubmit,
  ]);

  if (!currentCase) return null;

  const isLastStep = currentStep === STEP_LABELS.length - 1;

  return (
    <div className="flex flex-col gap-5">
      {/* Timer + Actions */}
      <div className="flex w-full items-center gap-3">
        <div className="flex-1">
          <span className="text-xs text-muted-foreground">Nimm dir die Zeit, die du brauchst.</span>
        </div>
        {onOpenIntro && (
          <button
            type="button"
            onClick={onOpenIntro}
            title="So funktioniert's"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Info className="h-4 w-4" />
          </button>
        )}
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
      <div className="rounded-[14px] border border-border bg-card p-5">
        <div className="text-meta-strong mb-3">Case-Prompt</div>
        <p className="text-[19px] font-medium text-foreground leading-[1.45]">{currentCase.prompt}</p>
        {currentCase.unit_hint && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            <span>
              Zieleinheit:{" "}
              <span className="font-medium text-primary">{currentCase.unit_hint}</span>
            </span>
          </div>
        )}
        {currentCase.allowed_methods && (
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Methode: {currentCase.allowed_methods.replace(/,/g, " / ")}</span>
          </div>
        )}
      </div>

      {/* Stepper */}
      <StepperHeader currentStep={currentStep} onJumpTo={setCurrentStep} />

      {/* Active step */}
      {currentStep === 0 && (
        <StructureStep
          nodes={nodes}
          onChange={setNodes}
          lastAddedId={lastAddedId}
          onLastAddedIdChange={setLastAddedId}
          disabled={isEvaluating}
        />
      )}
      {currentStep === 1 && (
        <AssumptionsStep
          leaves={leaves}
          assumptions={assumptions}
          onChange={setAssumptions}
          disabled={isEvaluating}
        />
      )}
      {currentStep === 2 && (
        <CalculationStep
          leaves={leaves}
          numbers={numbers}
          onChange={setNumbers}
          product={product}
          unitHint={currentCase.unit_hint || undefined}
          disabled={isEvaluating}
        />
      )}
      {currentStep === 3 && (
        <ResultStep
          product={product}
          finalEstimate={finalEstimate}
          onFinalEstimateChange={setFinalEstimate}
          unit={estimateUnit}
          onUnitChange={setEstimateUnit}
          sanityCheck={sanityCheck}
          onSanityCheckChange={setSanityCheck}
          disabled={isEvaluating}
          unitHint={currentCase.unit_hint || undefined}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <DrillButton
          variant="inactive"
          size="md"
          onClick={goBack}
          disabled={currentStep === 0 || isEvaluating}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück
        </DrillButton>

        {!isLastStep ? (
          <DrillButton
            variant="active"
            size="md"
            onClick={goNext}
            disabled={currentStep === 0 && !canAdvanceFromStructure}
            className="gap-2"
          >
            Weiter <ArrowRight className="h-4 w-4" />
          </DrillButton>
        ) : (
          <DrillButton
            variant="active"
            size="md"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="gap-2 px-6"
          >
            {isEvaluating ? (
              <>
                <span className="animate-spin">&#9203;</span> KI bewertet...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Abgeben &amp; Bewerten
              </>
            )}
          </DrillButton>
        )}
      </div>
    </div>
  );
};

export default MarketSizingGame;
