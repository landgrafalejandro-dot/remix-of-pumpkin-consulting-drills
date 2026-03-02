export interface MarketSizingCase {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  industry_tag: string;
  region: string;
  prompt: string;
  target_metric: string;
  unit_hint: string | null;
  allowed_methods: string;
  reference_structure: string | null;
  expected_order_of_magnitude_min: number | null;
  expected_order_of_magnitude_max: number | null;
  key_assumptions_examples: string | null;
}

export interface MarketSizingEvaluation {
  total_score: number;
  scores: {
    structure_mece: number;
    assumptions: number;
    math_consistency: number;
    plausibility_sanity: number;
    communication: number;
  };
  strengths: string[];
  improvements: string[];
  red_flags?: string[];
  flagged: boolean;
  one_line_summary: string;
}

export interface MarketSizingResult {
  case: MarketSizingCase;
  answerText: string;
  finalEstimateValue: number | null;
  finalEstimateUnit: string;
  timeSpentSec: number;
  evaluation: MarketSizingEvaluation | null;
  submissionId?: string;
}

export type MarketSizingPhase = "config" | "answering" | "evaluating" | "result" | "debrief";
