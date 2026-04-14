import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { TextDrillCase, DrillConfig } from "@/types/textDrill";
import { FrameworkNode } from "@/types/frameworkBuilder";
import { createEmptyNode, serializeFramework, isFrameworkValid } from "@/lib/frameworkSerializer";
import FrameworkNodeCard from "./FrameworkNodeCard";
import SprintTimer from "@/components/sprint/SprintTimer";
import { DrillButton } from "@/components/ui/drill-button";
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

const MAX_TOP_LEVEL = 6;
const MAX_CHILDREN = 4;

const NODE_COLORS = [
  "border-t-amber-500",
  "border-t-blue-500",
  "border-t-emerald-500",
  "border-t-violet-500",
  "border-t-rose-500",
  "border-t-cyan-500",
];

/* ─── Tree connector lines between parent and children ─── */

const ChildrenConnector: React.FC<{ children: React.ReactNode; childCount: number }> = ({
  children,
  childCount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current || !barRef.current || childCount <= 1) return;

    const container = containerRef.current;
    const childColumns = container.querySelectorAll<HTMLElement>("[data-child-col]");
    if (childColumns.length < 2) return;

    const first = childColumns[0];
    const last = childColumns[childColumns.length - 1];
    const containerRect = container.getBoundingClientRect();

    const firstCenter = first.getBoundingClientRect().left + first.getBoundingClientRect().width / 2 - containerRect.left;
    const lastCenter = last.getBoundingClientRect().left + last.getBoundingClientRect().width / 2 - containerRect.left;

    barRef.current.style.left = `${firstCenter}px`;
    barRef.current.style.width = `${lastCenter - firstCenter}px`;
  });

  return (
    <div className="flex flex-col items-center">
      {/* Vertical stem from parent */}
      <div className="w-px h-5 bg-border" />

      {/* Children row with horizontal connector */}
      <div ref={containerRef} className="relative flex gap-3 pt-5">
        {/* Horizontal bar */}
        {childCount > 1 && (
          <div
            ref={barRef}
            className="absolute top-0 h-px bg-border"
            style={{ left: 0, width: 0 }}
          />
        )}
        {children}
      </div>
    </div>
  );
};

const ChildColumn: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div data-child-col className="flex flex-col items-center">
    <div className="w-px h-5 bg-border" />
    {children}
  </div>
);

/* ─── Main FrameworkBuilder ─── */

const FrameworkBuilder: React.FC<FrameworkBuilderProps> = ({
  config,
  currentCase,
  timeRemaining,
  totalDuration,
  onSubmit,
  onEnd,
  isEvaluating,
}) => {
  const [nodes, setNodes] = useState<FrameworkNode[]>([createEmptyNode()]);
  const [rubrikOpen, setRubrikOpen] = useState(true);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const hasSeenRubrik = useRef(false);

  // Reset on new case
  useEffect(() => {
    if (currentCase) {
      setNodes([createEmptyNode()]);
      setLastAddedId(null);
    }
  }, [currentCase?.id]);

  // Collapse rubric after first case
  useEffect(() => {
    if (currentCase && hasSeenRubrik.current) setRubrikOpen(false);
    if (currentCase) hasSeenRubrik.current = true;
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
      {/* Timer + End */}
      <div className="flex w-full items-center gap-4">
        <div className="flex-1">
          {config.sprintMode !== false ? (
            <SprintTimer timeRemaining={timeRemaining} totalDuration={totalDuration} />
          ) : (
            <span className="text-xs text-muted-foreground">Nimm dir die Zeit, die du brauchst.</span>
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
        <p className="text-lg font-medium text-foreground leading-relaxed">{currentCase.prompt}</p>
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
              <Award className="h-4 w-4" /> Bewertungskriterien
            </span>
            {rubrikOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {rubrikOpen && (
            <div className="border-t border-border px-4 pb-4 pt-3">
              <div className="flex flex-wrap gap-3">
                {config.rubricLabels.map(({ key, label, max }) => (
                  <div key={key} className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-xs">
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
          <p className="mb-2 text-xs font-medium text-muted-foreground">So baust du dein Framework:</p>
          <ol className="space-y-1">
            {config.structureGuide.map((step, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">{i + 1}.</span> {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      <label className="text-sm font-medium text-foreground">Dein Framework</label>

      {/* ── Horizontal Tree ── */}
      <div className="overflow-x-auto rounded-xl border border-border bg-muted/20 p-4">
        <div className="flex items-start justify-center gap-6 min-w-max">
          {nodes.map((node, i) => {
            const color = NODE_COLORS[i % NODE_COLORS.length];
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
