export type IBTopic =
  | "m_and_a"
  | "accounting"
  | "valuation"
  | "dcf"
  | "lbo"
  | "markets";

export type QuestionType = "wiedergabe" | "anwendung" | "verstaendnis";
export type JudgeVerdict = "correct" | "unvollstaendig" | "falsch" | "n/a";
export type EndReason = "time_limit" | "user_ended" | "abandoned";

export const IB_TOPIC_LABELS: Record<IBTopic, string> = {
  m_and_a: "M&A",
  accounting: "Accounting",
  valuation: "Valuation",
  dcf: "DCF",
  lbo: "LBO",
  markets: "Markets & News",
};

export const IB_TOPIC_ORDER: IBTopic[] = [
  "m_and_a",
  "accounting",
  "valuation",
  "dcf",
  "lbo",
  "markets",
];

export interface SessionState {
  session_id: string;
  current_archetype: string | null;
  current_stage: QuestionType | null;
  current_difficulty: number;
  max_difficulty: number;
  turn_index: number;
  time_remaining_sec: number;
  started_at: string;
}

export interface ChatTurn {
  id: string;
  role: "user" | "bot";
  text: string;
  audio_url?: string | null;
  created_at: string;
}

export interface StartSessionResponse {
  session_id: string;
  intro_text: string;
  intro_audio_url: string | null;
  session_state: SessionState;
}

export interface IBTurnResponse {
  bot_response_text: string;
  bot_audio_url: string | null;
  session_state: SessionState;
  session_ended_reason?: EndReason;
  judge_verdict: JudgeVerdict;
}

export interface ResourceLink {
  topic: string;
  label: string;
  url: string;
}

export interface FinalFeedback {
  content_score: number;
  structure_score: number;
  delivery_score: number;
  rationale: string;
  strengths: string[];
  improvements: string[];
  resource_links: ResourceLink[];
  passed_topics: string[];
  failed_topics: string[];
}

export interface FinalizeResponse {
  feedback: FinalFeedback;
  past_sessions_summary: Array<{
    started_at: string;
    avg_score: number;
  }>;
}

export interface IBBotConfigState {
  topics: IBTopic[];
  rating: number;
  company: string;
}
