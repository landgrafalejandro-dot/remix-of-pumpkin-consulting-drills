import { supabase } from "@/integrations/supabase/client";

/**
 * Save a drill session result to the database.
 */
export const saveDrillSession = async (params: {
  userEmail: string;
  drillType: "mental_math" | "case_math";
  correctCount: number;
  totalCount: number;
  accuracyPercent: number;
  durationSeconds: number;
}): Promise<void> => {
  const { error } = await supabase.from("drill_sessions").insert({
    user_email: params.userEmail,
    drill_type: params.drillType,
    correct_count: params.correctCount,
    total_count: params.totalCount,
    accuracy_percent: params.accuracyPercent,
    duration_seconds: params.durationSeconds,
  });

  if (error) {
    console.error("Error saving drill session:", error.message);
  }
};

export interface DrillSessionRow {
  id: string;
  drill_type: string;
  correct_count: number;
  total_count: number;
  accuracy_percent: number;
  duration_seconds: number;
  created_at: string;
}

/**
 * Fetch all drill sessions for a given user email.
 */
export const fetchDrillSessions = async (
  userEmail: string
): Promise<DrillSessionRow[]> => {
  const { data, error } = await supabase
    .from("drill_sessions")
    .select("*")
    .eq("user_email", userEmail)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching drill sessions:", error.message);
    return [];
  }

  return (data ?? []) as DrillSessionRow[];
};
