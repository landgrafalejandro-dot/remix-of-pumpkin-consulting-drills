import { FrameworkBranch, FrameworkBulletPoint, FrameworkBuilderState } from "@/types/frameworkBuilder";

export function createEmptyBullet(): FrameworkBulletPoint {
  return { id: crypto.randomUUID(), text: "" };
}

export function createEmptyBranch(): FrameworkBranch {
  return {
    id: crypto.randomUUID(),
    title: "",
    bulletPoints: [createEmptyBullet()],
  };
}

export function serializeFramework(state: FrameworkBuilderState): string {
  const title = state.frameworkTitle.trim() || "(kein Name)";
  let result = `FRAMEWORK: ${title}\n`;

  state.branches.forEach((branch, index) => {
    const branchTitle = branch.title.trim() || "(kein Titel)";
    result += `\n[Priorität ${index + 1}] ${branchTitle}\n`;

    const nonEmptyBullets = branch.bulletPoints.filter((bp) => bp.text.trim());
    nonEmptyBullets.forEach((bp) => {
      result += `  - ${bp.text.trim()}\n`;
    });
  });

  return result.trim();
}

export function isFrameworkValid(state: FrameworkBuilderState): boolean {
  return state.branches.some((b) => b.title.trim().length > 0);
}
