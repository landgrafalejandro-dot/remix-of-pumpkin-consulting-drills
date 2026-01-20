export type TaskType = 
  | "all" 
  | "multiplication" 
  | "percentage" 
  | "division" 
  | "zeros" 
  | "growth";

export interface ShortcutInfo {
  name: string;
  description: string;
  steps: string[];
}

export interface Task {
  id: number;
  type: TaskType;
  question: string;
  answer: number;
  shortcut: ShortcutInfo;
  difficulty: number;
}

export interface FeedbackState {
  isCorrect: boolean;
  userAnswer: string | number;
  correctAnswer: number;
  shortcut: ShortcutInfo;
  errorHint?: string;
  reactionTime?: number;
}
