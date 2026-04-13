import { FrameworkNode, FrameworkBulletPoint, FrameworkBuilderState } from "@/types/frameworkBuilder";

export function createEmptyBullet(): FrameworkBulletPoint {
  return { id: crypto.randomUUID(), text: "" };
}

export function createEmptyNode(): FrameworkNode {
  return {
    id: crypto.randomUUID(),
    title: "",
    bulletPoints: [createEmptyBullet()],
    children: [],
  };
}

export function serializeFramework(state: FrameworkBuilderState): string {
  let result = "";

  state.nodes.forEach((node, i) => {
    const nodeTitle = node.title.trim() || "(kein Titel)";
    result += `[Ast ${i + 1}] ${nodeTitle}\n`;

    const bullets = node.bulletPoints.filter((bp) => bp.text.trim());
    bullets.forEach((bp) => {
      result += `  - ${bp.text.trim()}\n`;
    });

    node.children.forEach((child, j) => {
      const childTitle = child.title.trim() || "(kein Titel)";
      result += `  [Unterast ${i + 1}.${j + 1}] ${childTitle}\n`;

      const childBullets = child.bulletPoints.filter((bp) => bp.text.trim());
      childBullets.forEach((bp) => {
        result += `    - ${bp.text.trim()}\n`;
      });
    });

    result += "\n";
  });

  return result.trim();
}

export function isFrameworkValid(state: FrameworkBuilderState): boolean {
  return state.nodes.some((n) => n.title.trim().length > 0);
}
