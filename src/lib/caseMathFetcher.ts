import { supabase } from "@/integrations/supabase/client";
import { CaseMathTask, CaseMathCategory } from "@/types/caseMath";

/**
 * DB-only fetcher for Case Math drill tasks.
 * Uses drill_tasks table with category='case_math'.
 * Anti-repetition via sliding window of seen IDs.
 */

// Map frontend categories to DB task_type values
const FRONTEND_TO_DB: Record<CaseMathCategory, string> = {
  profitability: "profitability",
  investment: "investment_roi",
  breakeven: "break_even",
};

const DB_TO_FRONTEND: Record<string, CaseMathCategory> = {
  profitability: "profitability",
  investment_roi: "investment",
  break_even: "breakeven",
};

interface CachedTask {
  id: string;
  task: string;
  task_type: string;
  difficulty: string;
  answer_value: number;
  tolerance: number;
}

let cachedTasks: CachedTask[] = [];
let cacheKey = "";
let seenIds: string[] = [];
let taskCounter = 30000;

/**
 * Pre-fetch case math tasks from DB for given filters.
 */
export const fetchCaseMathTasks = async (
  categories: CaseMathCategory[],
  difficulty: "easy" | "medium" | "hard" | "all"
): Promise<void> => {
  const dbTypes = categories.map((c) => FRONTEND_TO_DB[c]);
  const key = `${dbTypes.sort().join(",")}_${difficulty}`;

  if (cacheKey === key && cachedTasks.length > 0) return;

  let query = supabase
    .from("drill_tasks")
    .select("*")
    .eq("category", "case_math")
    .eq("active", true)
    .in("task_type", dbTypes);

  if (difficulty !== "all") {
    query = query.eq("difficulty", difficulty);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching case math tasks:", error.message);
    cachedTasks = [];
    return;
  }

  cachedTasks = ((data as any[]) ?? [])
    .filter((d) => d.answer_value != null)
    .map((d) => ({
      id: d.id,
      task: d.task,
      task_type: d.task_type || "",
      difficulty: d.difficulty,
      answer_value: Number(d.answer_value),
      tolerance: Number(d.tolerance) || 0,
    }));

  cacheKey = key;
  console.log(`Loaded ${cachedTasks.length} case math tasks from DB`);
};

/**
 * Get the next task with anti-repetition logic.
 */
export const getNextCaseMathTask = (): CaseMathTask | null => {
  if (cachedTasks.length === 0) return null;

  const exclusionLevels = [20, 10, 5, 0];

  for (const excludeCount of exclusionLevels) {
    const excludeSet = new Set(seenIds.slice(-excludeCount));
    const available = cachedTasks.filter((t) => !excludeSet.has(t.id));

    if (available.length > 0) {
      const pick = available[Math.floor(Math.random() * available.length)];
      seenIds.push(pick.id);

      if (seenIds.length > 100) {
        seenIds = seenIds.slice(-50);
      }

      const frontendCategory = DB_TO_FRONTEND[pick.task_type] || "profitability";
      const diffNum = pick.difficulty === "easy" ? 1 : pick.difficulty === "medium" ? 2 : 3;

      return {
        id: ++taskCounter,
        category: frontendCategory,
        question: pick.task,
        highlightedQuestion: pick.task,
        answer: pick.answer_value,
        tolerance: pick.tolerance,
        shortcut: { name: "", formula: "", tip: "" },
        difficulty: diffNum,
      };
    }
  }

  return null;
};

/**
 * Check if user answer matches the correct answer (with tolerance and suffix parsing).
 */
export const checkCaseMathAnswer = (
  userInput: string,
  correctAnswer: number,
  tolerance: number
): boolean => {
  const cleaned = userInput
    .trim()
    .replace(/[€%\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  let value: number;
  const mrdMatch = cleaned.match(/^(-?[\d.]+)\s*(?:mrd)$/i);
  const mioMatch = cleaned.match(/^(-?[\d.]+)\s*(?:mio)$/i);
  const kMatch = cleaned.match(/^(-?[\d.]+)\s*k$/i);

  if (mrdMatch) value = parseFloat(mrdMatch[1]) * 1_000_000_000;
  else if (mioMatch) value = parseFloat(mioMatch[1]) * 1_000_000;
  else if (kMatch) value = parseFloat(kMatch[1]) * 1_000;
  else value = parseFloat(cleaned);

  if (isNaN(value)) return false;

  if (tolerance > 0) {
    return Math.abs(value - correctAnswer) <= tolerance;
  }

  // Exact match with small floating point tolerance
  return Math.abs(value - correctAnswer) < 0.01;
};

/**
 * Reset session tracking (call when starting a new sprint).
 */
export const resetCaseMathSession = () => {
  seenIds = [];
};

/**
 * Clear everything (cache + session).
 */
export const clearCaseMathCache = () => {
  cachedTasks = [];
  cacheKey = "";
  seenIds = [];
};

/**
 * Get count of available tasks for the current filter.
 */
export const getCaseMathTaskCount = (): number => cachedTasks.length;
