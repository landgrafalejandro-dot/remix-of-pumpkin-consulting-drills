import React, { useRef, useEffect } from "react";
import { FrameworkBranch, FrameworkBulletPoint } from "@/types/frameworkBuilder";
import { createEmptyBullet } from "@/lib/frameworkSerializer";
import { ChevronUp, ChevronDown, Trash2, X, Plus } from "lucide-react";

interface FrameworkBranchCardProps {
  branch: FrameworkBranch;
  index: number;
  totalBranches: number;
  onUpdate: (updated: FrameworkBranch) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disabled: boolean;
  autoFocusTitle?: boolean;
}

const BRANCH_COLORS = [
  "border-l-amber-500",
  "border-l-blue-500",
  "border-l-emerald-500",
  "border-l-violet-500",
  "border-l-rose-500",
  "border-l-cyan-500",
  "border-l-orange-500",
  "border-l-pink-500",
];

const FrameworkBranchCard: React.FC<FrameworkBranchCardProps> = ({
  branch,
  index,
  totalBranches,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  disabled,
  autoFocusTitle,
}) => {
  const titleRef = useRef<HTMLInputElement>(null);
  const bulletRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const colorClass = BRANCH_COLORS[index % BRANCH_COLORS.length];

  useEffect(() => {
    if (autoFocusTitle) {
      titleRef.current?.focus();
    }
  }, [autoFocusTitle]);

  const updateTitle = (title: string) => {
    onUpdate({ ...branch, title });
  };

  const updateBullet = (bulletId: string, text: string) => {
    onUpdate({
      ...branch,
      bulletPoints: branch.bulletPoints.map((bp) =>
        bp.id === bulletId ? { ...bp, text } : bp
      ),
    });
  };

  const addBullet = (afterId?: string) => {
    const newBullet = createEmptyBullet();
    let newBullets: FrameworkBulletPoint[];

    if (afterId) {
      const idx = branch.bulletPoints.findIndex((bp) => bp.id === afterId);
      newBullets = [...branch.bulletPoints];
      newBullets.splice(idx + 1, 0, newBullet);
    } else {
      newBullets = [...branch.bulletPoints, newBullet];
    }

    onUpdate({ ...branch, bulletPoints: newBullets });

    // Focus the new bullet after render
    requestAnimationFrame(() => {
      bulletRefs.current.get(newBullet.id)?.focus();
    });
  };

  const removeBullet = (bulletId: string) => {
    if (branch.bulletPoints.length <= 1) return; // keep at least 1

    const idx = branch.bulletPoints.findIndex((bp) => bp.id === bulletId);
    const newBullets = branch.bulletPoints.filter((bp) => bp.id !== bulletId);
    onUpdate({ ...branch, bulletPoints: newBullets });

    // Focus previous bullet or title
    requestAnimationFrame(() => {
      if (idx > 0) {
        bulletRefs.current.get(newBullets[idx - 1].id)?.focus();
      } else if (newBullets.length > 0) {
        bulletRefs.current.get(newBullets[0].id)?.focus();
      } else {
        titleRef.current?.focus();
      }
    });
  };

  const handleBulletKeyDown = (e: React.KeyboardEvent, bullet: FrameworkBulletPoint) => {
    if (disabled) return;

    if (e.key === "Enter") {
      e.preventDefault();
      addBullet(bullet.id);
    }

    if (e.key === "Backspace" && bullet.text === "" && branch.bulletPoints.length > 1) {
      e.preventDefault();
      removeBullet(bullet.id);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Enter") {
      e.preventDefault();
      // Focus first bullet
      const firstBullet = branch.bulletPoints[0];
      if (firstBullet) {
        bulletRefs.current.get(firstBullet.id)?.focus();
      }
    }
  };

  return (
    <div
      className={`relative rounded-xl border border-border bg-card ${colorClass} border-l-4 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2`}
    >
      {/* Header: Priority badge + controls */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        {/* Priority badge */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {index + 1}
        </div>

        {/* Title input */}
        <input
          ref={titleRef}
          value={branch.title}
          onChange={(e) => updateTitle(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder={`Ast ${index + 1} benennen (z.B. Revenue, Costs, Market)`}
          className="flex-1 bg-transparent text-base font-semibold text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          disabled={disabled}
        />

        {/* Controls */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={disabled || index === 0}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            title="Nach oben"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={disabled || index === totalBranches - 1}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            title="Nach unten"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
            title="Ast entfernen"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bullet points */}
      <div className="px-4 pb-3">
        <div className="space-y-1">
          {branch.bulletPoints.map((bullet) => (
            <div key={bullet.id} className="flex items-center gap-2">
              <span className="shrink-0 text-muted-foreground/50 text-sm">•</span>
              <input
                ref={(el) => {
                  if (el) bulletRefs.current.set(bullet.id, el);
                  else bulletRefs.current.delete(bullet.id);
                }}
                value={bullet.text}
                onChange={(e) => updateBullet(bullet.id, e.target.value)}
                onKeyDown={(e) => handleBulletKeyDown(e, bullet)}
                placeholder="Unterpunkt eingeben..."
                className="flex-1 bg-transparent py-1 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
                disabled={disabled}
              />
              {branch.bulletPoints.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBullet(bullet.id)}
                  disabled={disabled}
                  className="shrink-0 rounded p-0.5 text-muted-foreground/30 transition-colors hover:text-destructive disabled:opacity-30"
                  title="Unterpunkt entfernen"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => addBullet()}
          disabled={disabled}
          className="mt-1 flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
        >
          <Plus className="h-3 w-3" /> Unterpunkt
        </button>
      </div>
    </div>
  );
};

export default FrameworkBranchCard;
