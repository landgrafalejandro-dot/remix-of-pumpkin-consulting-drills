import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { MarketSizingCase } from "@/types/marketSizing";
import { FrameworkNode } from "@/types/frameworkBuilder";
import { createEmptyNode, serializeFramework, isFrameworkValid } from "@/lib/frameworkSerializer";
import FrameworkNodeCard from "@/components/frameworkBuilder/FrameworkNodeCard";
import SprintTimer from "@/components/sprint/SprintTimer";
import { DrillButton } from "@/components/ui/drill-button";
import { AudioRecorder } from "@/components/ui/AudioRecorder";
import { X, Send, Info, Plus } from "lucide-react";

interface MarketSizingGameProps {
  currentCase: MarketSizingCase | null;
  timeRemaining: number;
  totalDuration: number;
  onSubmit: (answerText: string, estimateValue: number | null, estimateUnit: string) => void;
  onEnd: () => void;
  isEvaluating: boolean;
  onOpenIntro?: () => void;
}

const MAX_TOP_LEVEL = 6;
const MAX_CHILDREN = 4;
const MAX_DEPTH = 3;

function updateNodeInTree(
  nodes: FrameworkNode[],
  targetId: string,
  updater: (n: FrameworkNode) => FrameworkNode
): FrameworkNode[] {
  return nodes.map((n) => {
    if (n.id === targetId) return updater(n);
    if (n.children.length > 0) {
      return { ...n, children: updateNodeInTree(n.children, targetId, updater) };
    }
    return n;
  });
}

function removeNodeFromTree(nodes: FrameworkNode[], targetId: string): FrameworkNode[] {
  return nodes
    .filter((n) => n.id !== targetId)
    .map((n) =>
      n.children.length > 0 ? { ...n, children: removeNodeFromTree(n.children, targetId) } : n
    );
}

const NODE_COLORS = [
  "border-t-amber-500",
  "border-t-blue-500",
  "border-t-emerald-500",
  "border-t-violet-500",
  "border-t-rose-500",
  "border-t-cyan-500",
];

/* ─── Tree connector lines ─── */

const ChildrenConnector: React.FC<{ children: React.ReactNode; childCount: number }> = ({
  children,
  childCount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current || !barRef.current || childCount <= 1) return;
    const container = containerRef.current;
    const cols = container.querySelectorAll<HTMLElement>("[data-child-col]");
    if (cols.length < 2) return;
    const first = cols[0];
    const last = cols[cols.length - 1];
    const rect = container.getBoundingClientRect();
    const firstCenter = first.getBoundingClientRect().left + first.getBoundingClientRect().width / 2 - rect.left;
    const lastCenter = last.getBoundingClientRect().left + last.getBoundingClientRect().width / 2 - rect.left;
    barRef.current.style.left = `${firstCenter}px`;
    barRef.current.style.width = `${lastCenter - firstCenter}px`;
  });

  return (
    <div className="flex flex-col items-center">
      <div className="w-px h-5 bg-border" />
      <div ref={containerRef} className="relative flex gap-3 pt-5">
        {childCount > 1 && (
          <div ref={barRef} className="absolute top-0 h-px bg-border" style={{ left: 0, width: 0 }} />
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

/* ─── Recursive Tree Branch ─── */

interface TreeBranchProps {
  node: FrameworkNode;
  colorClass: string;
  depth: number;
  isEvaluating: boolean;
  lastAddedId: string | null;
  onUpdate: (id: string, updated: FrameworkNode) => void;
  onRemove: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

const TreeBranch: React.FC<TreeBranchProps> = ({
  node,
  colorClass,
  depth,
  isEvaluating,
  lastAddedId,
  onUpdate,
  onRemove,
  onAddChild,
}) => {
  const canAddChild = node.children.length < MAX_CHILDREN && depth < MAX_DEPTH;

  return (
    <div className="flex flex-col items-center">
      <FrameworkNodeCard
        node={node}
        colorClass={colorClass}
        onUpdate={(updated) => onUpdate(node.id, updated)}
        onRemove={() => onRemove(node.id)}
        disabled={isEvaluating}
        autoFocusTitle={node.id === lastAddedId}
      />
      {canAddChild && (
        <button
          type="button"
          onClick={() => onAddChild(node.id)}
          disabled={isEvaluating}
          className="mt-2 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-muted-foreground/60 transition-colors hover:bg-muted hover:text-primary disabled:opacity-30"
        >
          <Plus className="h-3 w-3" /> Unterast
        </button>
      )}
      {node.children.length > 0 && (
        <ChildrenConnector childCount={node.children.length}>
          {node.children.map((child) => (
            <ChildColumn key={child.id}>
              <TreeBranch
                node={child}
                colorClass={colorClass}
                depth={depth + 1}
                isEvaluating={isEvaluating}
                lastAddedId={lastAddedId}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onAddChild={onAddChild}
              />
            </ChildColumn>
          ))}
        </ChildrenConnector>
      )}
    </div>
  );
};

/* ─── Main Component ─── */

const MarketSizingGame: React.FC<MarketSizingGameProps> = ({
  currentCase, timeRemaining, totalDuration, onSubmit, onEnd, isEvaluating, onOpenIntro,
}) => {
  // Tree state
  const [nodes, setNodes] = useState<FrameworkNode[]>([createEmptyNode()]);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  // Text fields
  const [methodText, setMethodText] = useState("");
  const [estimateValue, setEstimateValue] = useState("");
  const [estimateUnit, setEstimateUnit] = useState("");

  // Reset on new case
  useEffect(() => {
    if (currentCase) {
      setNodes([createEmptyNode()]);
      setLastAddedId(null);
      setMethodText("");
      setEstimateValue("");
      setEstimateUnit(currentCase.unit_hint || "");
    }
  }, [currentCase?.id]);

  /* ── Tree helpers (recursive, work at any depth) ── */

  const updateNode = useCallback((nodeId: string, updated: FrameworkNode) => {
    setNodes((prev) => updateNodeInTree(prev, nodeId, () => updated));
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    setNodes((prev) => {
      const result = removeNodeFromTree(prev, nodeId);
      return result.length === 0 ? [createEmptyNode()] : result;
    });
  }, []);

  const addNode = useCallback(() => {
    if (nodes.length >= MAX_TOP_LEVEL) return;
    const n = createEmptyNode();
    setNodes((prev) => [...prev, n]);
    setLastAddedId(n.id);
  }, [nodes.length]);

  const addChildNode = useCallback((parentId: string) => {
    const child = createEmptyNode();
    setNodes((prev) =>
      updateNodeInTree(prev, parentId, (parent) => {
        if (parent.children.length >= MAX_CHILDREN) return parent;
        return { ...parent, children: [...parent.children, child] };
      })
    );
    setLastAddedId(child.id);
  }, []);

  /* ── Submit ── */

  const handleSubmit = () => {
    const treeText = serializeFramework({ nodes });
    const method = methodText.trim();
    const estVal = estimateValue.trim();
    const estUnit = estimateUnit.trim();

    let combined = `STRUKTUR:\n${treeText}`;
    if (method) combined += `\n\nMETHODE:\n${method}`;
    if (estVal) combined += `\n\nFINALE SCHÄTZUNG: ${estVal} ${estUnit}`;

    const numValue = estimateValue ? parseFloat(estimateValue.replace(",", ".")) : null;
    onSubmit(combined, numValue, estUnit);
  };

  if (!currentCase) return null;

  const hasContent = isFrameworkValid({ nodes }) || methodText.trim().length > 0;
  const canSubmit = hasContent && !isEvaluating;

  return (
    <div className="flex flex-col gap-5">
      {/* Timer + Actions */}
      <div className="flex w-full items-center gap-3">
        <div className="flex-1">
          <SprintTimer timeRemaining={timeRemaining} totalDuration={totalDuration} />
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
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <p className="text-lg font-medium text-foreground leading-relaxed">{currentCase.prompt}</p>
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

      {/* ── Issue Tree ── */}
      <label className="text-sm font-medium text-foreground">Deine Struktur</label>
      <div className="overflow-x-auto rounded-xl border border-border bg-muted/20 p-4">
        <div className="flex items-start justify-center gap-6 min-w-max">
          {nodes.map((node, i) => (
            <TreeBranch
              key={node.id}
              node={node}
              colorClass={NODE_COLORS[i % NODE_COLORS.length]}
              depth={1}
              isEvaluating={isEvaluating}
              lastAddedId={lastAddedId}
              onUpdate={updateNode}
              onRemove={removeNode}
              onAddChild={addChildNode}
            />
          ))}
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

      {/* ── Method & Explanation ── */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Methode & Erklärung</label>
          <AudioRecorder
            onTranscript={(text) => setMethodText((prev) => prev ? prev + " " + text : text)}
            disabled={isEvaluating}
          />
        </div>
        <textarea
          value={methodText}
          onChange={(e) => setMethodText(e.target.value)}
          placeholder="z.B. Top-down von Bevölkerung DE, Zielgruppe eingegrenzt nach Alter und Nutzungsverhalten..."
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
          rows={3}
          disabled={isEvaluating}
        />
      </div>

      {/* ── Final Estimate ── */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <label className="mb-3 block text-sm font-semibold text-foreground">
          Finale Schätzung (Pflichtfeld)
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

export default MarketSizingGame;
