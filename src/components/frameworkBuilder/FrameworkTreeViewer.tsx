import React from "react";
import { FrameworkNode } from "@/types/frameworkBuilder";
import { ChildrenConnector, ChildColumn } from "./FrameworkTreeConnectors";
import { Star } from "lucide-react";

interface FrameworkTreeViewerProps {
  nodes: FrameworkNode[];
}

const NODE_COLORS = [
  "border-t-amber-500",
  "border-t-blue-500",
  "border-t-emerald-500",
  "border-t-violet-500",
  "border-t-rose-500",
  "border-t-cyan-500",
];

const NodeView: React.FC<{
  node: FrameworkNode;
  colorClass: string;
  showPriorityStar?: boolean;
}> = ({ node, colorClass, showPriorityStar }) => (
  <div
    className={`min-w-[140px] max-w-[200px] rounded-lg border border-border bg-card ${colorClass} border-t-[3px]`}
  >
    <div className="flex items-start gap-1.5 px-3 pt-2.5 pb-1">
      {showPriorityStar && node.isPriority && (
        <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-amber-500 text-amber-500" />
      )}
      <p className="text-sm font-semibold leading-snug text-foreground break-words">
        {node.title || "–"}
      </p>
    </div>
    {node.bulletPoints.some((bp) => bp.text.trim()) && (
      <ul className="px-3 pb-2 pt-1 space-y-0.5">
        {node.bulletPoints
          .filter((bp) => bp.text.trim())
          .map((bp) => (
            <li
              key={bp.id}
              className="flex items-start gap-1.5 text-xs leading-snug text-muted-foreground"
            >
              <span className="pt-0.5 shrink-0 text-muted-foreground/40 text-[10px]">•</span>
              <span className="break-words">{bp.text}</span>
            </li>
          ))}
      </ul>
    )}
  </div>
);

const FrameworkTreeViewer: React.FC<FrameworkTreeViewerProps> = ({ nodes }) => {
  if (!nodes || nodes.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex flex-wrap items-start justify-center gap-x-4 gap-y-6">
        {nodes.map((node, i) => {
          const color = NODE_COLORS[i % NODE_COLORS.length];
          return (
            <div key={node.id} className="flex flex-col items-center">
              <NodeView node={node} colorClass={color} showPriorityStar />
              {node.children.length > 0 && (
                <ChildrenConnector childCount={node.children.length}>
                  {node.children.map((child) => (
                    <ChildColumn key={child.id}>
                      <NodeView node={child} colorClass={color} />
                    </ChildColumn>
                  ))}
                </ChildrenConnector>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FrameworkTreeViewer;
