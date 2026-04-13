export interface FrameworkBulletPoint {
  id: string;
  text: string;
}

export interface FrameworkBranch {
  id: string;
  title: string;
  bulletPoints: FrameworkBulletPoint[];
}

export interface FrameworkBuilderState {
  frameworkTitle: string;
  branches: FrameworkBranch[];
}
