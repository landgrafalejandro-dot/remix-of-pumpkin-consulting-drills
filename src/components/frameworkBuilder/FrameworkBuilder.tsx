import React, { useState, useEffect, useRef } from "react";
import { TextDrillCase, DrillConfig } from "@/types/textDrill";
import { FrameworkBranch } from "@/types/frameworkBuilder";
import { createEmptyBranch, serializeFramework, isFrameworkValid } from "@/lib/frameworkSerializer";
import FrameworkBranchCard from "./FrameworkBranchCard";
import SprintTimer from "@/components/sprint/SprintTimer";
import { DrillButton } from "@/components/ui/drill-button";
import { AudioRecorder } from "@/components/ui/AudioRecorder";
import { X, Send, Info, ChevronDown, ChevronUp, Award, Plus } from "lucide-react";

interface FrameworkBuilderProps {
  config: DrillConfig;
  currentCase: TextDrillCase | null;
  timeRemaining: number;
  totalDuration: number;
  onSubmit: (answerText: string) => void;
  onEnd: () => void;
  isEvaluating: boolean;
}

const MAX_BRANCHES = 8;

const FrameworkBuilder: React.FC<FrameworkBuilderProps> = ({
  config,
  currentCase,
  timeRemaining,
  totalDuration,
  onSubmit,
  onEnd,
  isEvaluating,
}) => {
  const [frameworkTitle, setFrameworkTitle] = useState("");
  const [branches, setBranches] = useState<FrameworkBranch[]>([createEmptyBranch()]);
  const [rubrikOpen, setRubrikOpen] = useState(true);
  const [lastAddedBranchId, setLastAddedBranchId] = useState<string | null>(null);
  const hasSeenRubrik = useRef(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Reset state when case changes
  useEffect(() => {
    if (currentCase) {
      setFrameworkTitle("");
      const initial = createEmptyBranch();
      setBranches([initial]);
      setLastAddedBranchId(null);
      titleRef.current?.focus();
    }
  }, [currentCase?.id]);

  // Collapse rubric after first case
  useEffect(() => {
    if (currentCase && hasSeenRubrik.current) {
      setRubrikOpen(false);
    }
    if (currentCase) hasSeenRubrik.current = true;
  }, [currentCase?.id]);

  const handleSubmit = () => {
    const state = { frameworkTitle, branches };
    if (!isFrameworkValid(state)) return;
    onSubmit(serializeFramework(state));
  };

  const updateBranch = (branchId: string, updated: FrameworkBranch) => {
    setBranches((prev) => prev.map((b) => (b.id === branchId ? updated : b)));
  };

  const removeBranch = (branchId: string) => {
    setBranches((prev) => {
      const filtered = prev.filter((b) => b.id !== branchId);
      return filtered.length === 0 ? [createEmptyBranch()] : filtered;
    });
  };

  const addBranch = () => {
    if (branches.length >= MAX_BRANCHES) return;
    const newBranch = createEmptyBranch();
    setBranches((prev) => [...prev, newBranch]);
    setLastAddedBranchId(newBranch.id);
  };

  const moveBranch = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= branches.length) return;
    setBranches((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleTranscript = (text: string) => {
    // Add transcript lines as bullet points to the last branch
    const lines = text
      .split(/[\n.;]/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    setBranches((prev) => {
      const updated = [...prev];
      const lastBranch = updated[updated.length - 1];
      if (!lastBranch) return prev;

      // If the last branch has a single empty bullet, replace it
      const hasOnlyEmpty =
        lastBranch.bulletPoints.length === 1 && lastBranch.bulletPoints[0].text === "";

      const newBullets = lines.map((line) => ({
        id: crypto.randomUUID(),
        text: line,
      }));

      updated[updated.length - 1] = {
        ...lastBranch,
        bulletPoints: hasOnlyEmpty
          ? newBullets
          : [...lastBranch.bulletPoints, ...newBullets],
      };

      return updated;
    });
  };

  if (!currentCase) return null;

  const canSubmit = isFrameworkValid({ frameworkTitle, branches }) && !isEvaluating;

  return (
    <div className="flex flex-col gap-5">
      {/* Timer + End */}
      <div className="flex w-full items-center gap-4">
        <div className="flex-1">
          {config.sprintMode !== false ? (
            <SprintTimer timeRemaining={timeRemaining} totalDuration={totalDuration} />
          ) : (
            <span className="text-xs text-muted-foreground">
              Nimm dir die Zeit, die du brauchst.
            </span>
          )}
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
        {currentCase.context_info && (
          <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{currentCase.context_info}</span>
          </div>
        )}
      </div>

      {/* Rubric */}
      {config.rubricLabels.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <button
            onClick={() => setRubrikOpen((o) => !o)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Bewertungskriterien
            </span>
            {rubrikOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {rubrikOpen && (
            <div className="border-t border-border px-4 pb-4 pt-3">
              <div className="flex flex-wrap gap-3">
                {config.rubricLabels.map(({ key, label, max }) => (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-xs"
                  >
                    <span className="font-medium text-foreground">{label}</span>
                    <span className="text-muted-foreground">({max} Pkt)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Structure Guide */}
      {config.structureGuide && config.structureGuide.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            So baust du dein Framework:
          </p>
          <ol className="space-y-1">
            {config.structureGuide.map((step, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">{i + 1}.</span> {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Framework Title */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Dein Framework</label>
          <AudioRecorder onTranscript={handleTranscript} disabled={isEvaluating} />
        </div>
        <input
          ref={titleRef}
          value={frameworkTitle}
          onChange={(e) => setFrameworkTitle(e.target.value)}
          placeholder="Framework benennen (z.B. Profitability Tree, 3C, Porter's 5 Forces)"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={isEvaluating}
        />
      </div>

      {/* Priority hint */}
      <p className="text-xs text-muted-foreground">
        Reihenfolge = Priorität — der wichtigste Ast steht oben.
      </p>

      {/* Branch Cards */}
      <div className="space-y-3">
        {branches.map((branch, i) => (
          <FrameworkBranchCard
            key={branch.id}
            branch={branch}
            index={i}
            totalBranches={branches.length}
            onUpdate={(updated) => updateBranch(branch.id, updated)}
            onRemove={() => removeBranch(branch.id)}
            onMoveUp={() => moveBranch(i, i - 1)}
            onMoveDown={() => moveBranch(i, i + 1)}
            disabled={isEvaluating}
            autoFocusTitle={branch.id === lastAddedBranchId}
          />
        ))}
      </div>

      {/* Add Branch Button */}
      {branches.length < MAX_BRANCHES && (
        <button
          type="button"
          onClick={addBranch}
          disabled={isEvaluating}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Ast hinzufügen
        </button>
      )}

      {/* Submit */}
      <div className="flex justify-center pt-2">
        <DrillButton
          variant="active"
          size="lg"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="gap-2 px-8"
        >
          {isEvaluating ? (
            <>
              <span className="animate-spin">&#9203;</span> KI bewertet...
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

export default FrameworkBuilder;
