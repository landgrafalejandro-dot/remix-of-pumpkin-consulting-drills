import React, { useState, useEffect, useCallback } from "react";
import { TextDrillCase, DrillConfig } from "@/types/textDrill";
import { FrameworkNode } from "@/types/frameworkBuilder";
import { createEmptyNode, serializeFramework, isFrameworkValid } from "@/lib/frameworkSerializer";
import FrameworkNodeCard from "./FrameworkNodeCard";
import { ChildrenConnector, ChildColumn } from "./FrameworkTreeConnectors";
import SprintTimer from "@/components/sprint/SprintTimer";
import { DrillButton } from "@/components/ui/drill-button";
import { X, Send, Info, Plus } from "lucide-react";

interface FrameworkBuilderProps {
  config: DrillConfig;
  currentCase: TextDrillCase | null;
  timeRemaining: number;
  totalDuration: number;
  onSubmit: (answerText: string) => void;
  onEnd: () => void;
  isEvaluating: boolean;
  onOpenIntro?: () => void;
}

const MAX_TOP_LEVEL = 6;
const MAX_CHILDREN = 4;
const MAX_PRIORITIES = 2;

const NODE_BORDER_DEFAULT = "border-t-white/10";
const NODE_BORDER_PRIORITY = "border-t-[#ff9900]";

/* ─── Main FrameworkBuilder ─── */

const FrameworkBuilder: React.FC<FrameworkBuilderProps> = ({
  config,
  currentCase,
  timeRemaining,
  totalDuration,
  onSubmit,
  onEnd,
  isEvaluating,
  onOpenIntro,
}) => {
  const [nodes, setNodes] = useState<FrameworkNode[]>([createEmptyNode()]);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  // Reset on new case
  useEffect(() => {
    if (currentCase) {
      setNodes([createEmptyNode()]);
      setLastAddedId(null);
    }
  }, [currentCase?.id]);

  /* ── State helpers ── */

  const updateNode = useCallback((nodeId: string, updated: FrameworkNode) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? updated : n)));
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    setNodes((prev) => {
      const filtered = prev.filter((n) => n.id !== nodeId);
      return filtered.length === 0 ? [createEmptyNode()] : filtered;
    });
  }, []);

  const addNode = useCallback(() => {
    if (nodes.length >= MAX_TOP_LEVEL) return;
    const n = createEmptyNode();
    setNodes((prev) => [...prev, n]);
    setLastAddedId(n.id);
  }, [nodes.length]);

  const togglePriority = useCallback((nodeId: string) => {
    setNodes((prev) => {
      const target = prev.find((n) => n.id === nodeId);
      if (!target) return prev;
      if (target.isPriority) {
        return prev.map((n) => (n.id === nodeId ? { ...n, isPriority: false } : n));
      }
      const currentCount = prev.filter((n) => n.isPriority).length;
      if (currentCount >= MAX_PRIORITIES) return prev;
      return prev.map((n) => (n.id === nodeId ? { ...n, isPriority: true } : n));
    });
  }, []);

  const priorityCount = nodes.filter((n) => n.isPriority).length;

  const updateChildNode = useCallback((parentId: string, childId: string, updated: FrameworkNode) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== parentId) return n;
        return { ...n, children: n.children.map((c) => (c.id === childId ? updated : c)) };
      })
    );
  }, []);

  const addChildNode = useCallback((parentId: string) => {
    const child = createEmptyNode();
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== parentId || n.children.length >= MAX_CHILDREN) return n;
        return { ...n, children: [...n.children, child] };
      })
    );
    setLastAddedId(child.id);
  }, []);

  const removeChildNode = useCallback((parentId: string, childId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== parentId) return n;
        return { ...n, children: n.children.filter((c) => c.id !== childId) };
      })
    );
  }, []);

  /* ── Submit ── */

  const handleSubmit = () => {
    const state = { nodes };
    if (!isFrameworkValid(state)) return;
    onSubmit(serializeFramework(state));
  };

  if (!currentCase) return null;

  const canSubmit = isFrameworkValid({ nodes }) && !isEvaluating;

  return (
    <div className="flex flex-col gap-5">
      {/* Timer + Actions */}
      <div className="flex w-full items-center gap-3">
        <div className="flex-1">
          {config.sprintMode !== false ? (
            <SprintTimer timeRemaining={timeRemaining} totalDuration={totalDuration} />
          ) : (
            <span className="text-xs text-muted-foreground">Nimm dir die Zeit, die du brauchst.</span>
          )}
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
        {currentCase.context_info && (
          <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{currentCase.context_info}</span>
          </div>
        )}
      </div>

      <label className="text-sm font-medium text-foreground">Dein Framework</label>

      {/* ── Horizontal Tree (wraps to multi-row when too wide) ── */}
      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <div className="flex flex-wrap items-start justify-center gap-x-4 gap-y-6">
          {nodes.map((node, i) => {
            const color = node.isPriority ? NODE_BORDER_PRIORITY : NODE_BORDER_DEFAULT;
            return (
              <div key={node.id} className="flex flex-col items-center">
                {/* Parent node card */}
                <FrameworkNodeCard
                  node={node}
                  colorClass={color}
                  onUpdate={(updated) => updateNode(node.id, updated)}
                  onRemove={() => removeNode(node.id)}
                  disabled={isEvaluating}
                  autoFocusTitle={node.id === lastAddedId}
                  showPriorityToggle
                  canSetPriority={priorityCount < MAX_PRIORITIES}
                  onTogglePriority={() => togglePriority(node.id)}
                />

                {/* Add child button */}
                {node.children.length < MAX_CHILDREN && (
                  <button
                    type="button"
                    onClick={() => addChildNode(node.id)}
                    disabled={isEvaluating}
                    className="mt-2 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-muted-foreground/60 transition-colors hover:bg-muted hover:text-primary disabled:opacity-30"
                  >
                    <Plus className="h-3 w-3" /> Unterast
                  </button>
                )}

                {/* Children with connector lines */}
                {node.children.length > 0 && (
                  <ChildrenConnector childCount={node.children.length}>
                    {node.children.map((child) => (
                      <ChildColumn key={child.id}>
                        <FrameworkNodeCard
                          node={child}
                          colorClass={color}
                          onUpdate={(updated) => updateChildNode(node.id, child.id, updated)}
                          onRemove={() => removeChildNode(node.id, child.id)}
                          disabled={isEvaluating}
                          autoFocusTitle={child.id === lastAddedId}
                        />
                      </ChildColumn>
                    ))}
                  </ChildrenConnector>
                )}
              </div>
            );
          })}

          {/* Add top-level node button */}
          {nodes.length < MAX_TOP_LEVEL && (
            <button
              type="button"
              onClick={addNode}
              disabled={isEvaluating}
              className="flex h-[80px] min-w-[80px] flex-col items-center justify-center gap-1 self-start rounded-lg border-2 border-dashed border-border text-muted-foreground/50 transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-30"
            >
              <Plus className="h-5 w-5" />
              <span className="text-[10px]">Ast</span>
            </button>
          )}
        </div>
      </div>

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
