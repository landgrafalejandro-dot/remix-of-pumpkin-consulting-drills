export interface TextDrillCase {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  category?: string; // frameworks: category, charts: chart_type, creativity: industry
  context_info?: string | null;
  reference_solution?: string | null;
  chart_data?: any; // only for charts drill
  chart_title?: string | null; // only for charts drill
}

export interface TextDrillEvaluation {
  total_score: number;
  scores: Record<string, number>;
  strengths: string[];
  improvements: string[];
  red_flags?: string[];
  flagged: boolean;
  one_line_summary: string;
}

export interface TextDrillResult {
  case: TextDrillCase;
  answerText: string;
  timeSpentSec: number;
  evaluation: TextDrillEvaluation | null;
  submissionId?: string;
}

export type TextDrillPhase = "config" | "answering" | "evaluating" | "result" | "debrief";

export interface DrillConfig {
  drillType: string;
  title: string;
  subtitle: string;
  icon: string; // lucide icon name
  tableName: string;
  categoryField: string; // which field to use for filtering (category, chart_type, industry)
  categoryLabel: string; // UI label for category filter
  categories: { value: string; label: string }[];
  difficultyOptions: { value: "easy" | "medium" | "hard"; label: string; desc: string }[];
  hintText: string;
  startButtonText: string;
  rubricLabels: { key: string; label: string; max: number }[];
  placeholder: string; // textarea placeholder
  structureGuide?: string[]; // step-by-step guide shown above textarea
}
