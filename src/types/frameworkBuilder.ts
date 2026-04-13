export interface FrameworkBulletPoint {
  id: string;
  text: string;
}

export interface FrameworkNode {
  id: string;
  title: string;
  bulletPoints: FrameworkBulletPoint[];
  children: FrameworkNode[];
}

export interface FrameworkBuilderState {
  nodes: FrameworkNode[];
}
