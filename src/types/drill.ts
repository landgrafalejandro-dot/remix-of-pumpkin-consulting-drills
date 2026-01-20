export type TaskType = 
  | "all" 
  | "multiplication" 
  | "percentage" 
  | "division" 
  | "zeros" 
  | "growth";

export interface Task {
  id: number;
  type: TaskType;
  question: string;
  answer: number;
  shortcut: string;
  difficulty: number;
}

export interface FeedbackState {
  isCorrect: boolean;
  userAnswer: number;
  correctAnswer: number;
  shortcut: string;
  errorHint?: string;
}
