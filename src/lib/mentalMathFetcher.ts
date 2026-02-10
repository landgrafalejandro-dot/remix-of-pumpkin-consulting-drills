import { supabase } from "@/integrations/supabase/client";
import { Task, ShortcutInfo } from "@/types/drill";
import { normalizeInput } from "@/lib/taskGenerator";
import { loadExplanationTemplates, getTemplateExplanation, clearTemplateCache } from "@/lib/explanationMatcher";

/**
 * DB-only fetcher for Mental Math drill tasks.
 * Uses rand_key-based random selection with anti-repetition.
 */

// Session tracking
let seenIds: string[] = [];
let taskCounter = 20000;

// Task cache per filter combination
let cachedTasks: { id: string; task: string; task_type: string; difficulty: string }[] = [];
let cacheFilterKey = "";

// Explanation cache: key = "task_type_difficulty"
let explanationCache: Record<string, string> = {};

/**
 * Map DB task_type values to frontend TaskType.
 */
const DB_TO_FRONTEND_TYPE: Record<string, string> = {
  multiplication: "multiplication",
  division: "division",
  percentage: "percentage",
  zero_management: "zeros",
};

/**
 * Map frontend TaskType to DB task_type.
 */
const FRONTEND_TO_DB_TYPE: Record<string, string> = {
  multiplication: "multiplication",
  division: "division",
  percentage: "percentage",
  zeros: "zero_management",
};

/**
 * Parse a task string and compute the numeric answer.
 * Supports formats:
 *   - "A x B" or "A × B" (multiplication)
 *   - "A ÷ B" (division)
 *   - "P% von X" (percentage)
 *   - "a/b von X" (fraction)
 *   - "A + B", "A - B" (add/sub for zero management)
 *   - "A + P%" (growth)
 */
export const parseTaskAnswer = (taskStr: string): number | null => {
  const s = taskStr.trim();

  // Fraction: "a/b von X"
  const fractionMatch = s.match(/^(\d+)\/(\d+)\s+von\s+(.+)$/i);
  if (fractionMatch) {
    const num = parseInt(fractionMatch[1]);
    const den = parseInt(fractionMatch[2]);
    const base = normalizeInput(fractionMatch[3]);
    if (base === null || den === 0) return null;
    return (num / den) * base;
  }

  // Percentage: "P% von X"
  const pctMatch = s.match(/^([\d.,]+)%\s+von\s+(.+)$/i);
  if (pctMatch) {
    const pct = normalizeInput(pctMatch[1]);
    const base = normalizeInput(pctMatch[2]);
    if (pct === null || base === null) return null;
    return (pct / 100) * base;
  }

  // Growth: "X + P%"
  const growthMatch = s.match(/^(.+?)\s*\+\s*([\d.,]+)%$/);
  if (growthMatch) {
    const base = normalizeInput(growthMatch[1]);
    const pct = normalizeInput(growthMatch[2]);
    if (base === null || pct === null) return null;
    return base * (1 + pct / 100);
  }

  // Division: "A ÷ B"
  const divMatch = s.match(/^(.+?)\s*÷\s*(.+)$/);
  if (divMatch) {
    const a = normalizeInput(divMatch[1]);
    const b = normalizeInput(divMatch[2]);
    if (a === null || b === null || b === 0) return null;
    return a / b;
  }

  // Multiplication: "A x B" or "A × B"
  const mulMatch = s.match(/^(.+?)\s*[x×]\s*(.+)$/i);
  if (mulMatch) {
    const a = normalizeInput(mulMatch[1]);
    const b = normalizeInput(mulMatch[2]);
    if (a === null || b === null) return null;
    return a * b;
  }

  // Addition: "A + B" (no %)
  const addMatch = s.match(/^(.+?)\s*\+\s*(.+)$/);
  if (addMatch) {
    const a = normalizeInput(addMatch[1]);
    const b = normalizeInput(addMatch[2]);
    if (a === null || b === null) return null;
    return a + b;
  }

  // Subtraction: "A - B"
  const subMatch = s.match(/^(.+?)\s*-\s*(.+)$/);
  if (subMatch) {
    const a = normalizeInput(subMatch[1]);
    const b = normalizeInput(subMatch[2]);
    if (a === null || b === null) return null;
    return a - b;
  }

  return null;
};

/**
 * Pre-fetch tasks from DB for given filters.
 * Caches all matching tasks for the session.
 */
export const fetchMentalMathTasks = async (
  taskTypes: string[],
  difficulty: "easy" | "medium" | "hard" | "all"
): Promise<void> => {
  const dbTypes = taskTypes.map((t) => FRONTEND_TO_DB_TYPE[t] || t);
  const key = `${dbTypes.sort().join(",")}_${difficulty}`;

  if (cacheFilterKey === key && cachedTasks.length > 0) return;

  // Fetch tasks, generic explanations, and templates in parallel
  let taskQuery = supabase
    .from("drill_tasks")
    .select("id, task, task_type, difficulty")
    .eq("category", "mental_math")
    .eq("active", true)
    .in("task_type", dbTypes);

  if (difficulty !== "all") {
    taskQuery = taskQuery.eq("difficulty", difficulty);
  }

  const [taskResult, explanationResult] = await Promise.all([
    taskQuery,
    supabase.from("mental_math_explanations").select("task_type, difficulty, explanation_text"),
    loadExplanationTemplates(),
  ]);

  if (taskResult.error) {
    console.error("Error fetching mental math tasks:", taskResult.error.message);
    cachedTasks = [];
    return;
  }

  cachedTasks = taskResult.data ?? [];
  cacheFilterKey = key;

  // Cache generic explanations as fallback
  if (explanationResult.data) {
    for (const row of explanationResult.data) {
      explanationCache[`${row.task_type}_${row.difficulty}`] = row.explanation_text;
    }
  }

  console.log(`Loaded ${cachedTasks.length} mental math tasks from DB`);
};

/**
 * Get the next task with anti-repetition logic.
 * Excludes recently seen IDs, relaxing progressively.
 */
export const getNextMentalMathTask = (): Task | null => {
  if (cachedTasks.length === 0) return null;

  // Try excluding last N, relax progressively
  const exclusionLevels = [20, 10, 5, 0];

  for (const excludeCount of exclusionLevels) {
    const excludeSet = new Set(seenIds.slice(-excludeCount));
    const available = cachedTasks.filter((t) => !excludeSet.has(t.id));

    if (available.length > 0) {
      // Pick random from available using rand_key-inspired approach
      const pick = available[Math.floor(Math.random() * available.length)];
      seenIds.push(pick.id);

      // Keep seenIds bounded
      if (seenIds.length > 100) {
        seenIds = seenIds.slice(-50);
      }

      const answer = parseTaskAnswer(pick.task);
      if (answer === null) {
        console.warn("Could not parse task:", pick.task);
        // Remove unparseable task from cache and retry
        cachedTasks = cachedTasks.filter((t) => t.id !== pick.id);
        return getNextMentalMathTask();
      }

      const frontendType = DB_TO_FRONTEND_TYPE[pick.task_type] || pick.task_type;

      // Try template-based explanation first, fall back to generic
      const templateExplanation = getTemplateExplanation(pick.task, pick.task_type, pick.difficulty);
      const explanationKey = `${pick.task_type}_${pick.difficulty}`;
      const genericExplanation = explanationCache[explanationKey] || null;
      const explanation = templateExplanation || genericExplanation;

      const steps: string[] = [];
      if (explanation) {
        steps.push(`💡 **Tipp:** ${explanation}`);
      }
      steps.push(`Rechne: **${pick.task}**`);
      steps.push(`Ergebnis: **${formatAnswer(answer)}**`);

      const shortcut: ShortcutInfo = {
        name: "Lösung",
        description: explanation || `Rechne: ${pick.task}`,
        steps,
      };

      return {
        id: ++taskCounter,
        type: frontendType as any,
        question: pick.task,
        answer,
        shortcut,
        difficulty: pick.difficulty === "easy" ? 1 : pick.difficulty === "medium" ? 2 : 3,
      };
    }
  }

  return null;
};

/**
 * Format an answer number for display.
 */
const formatAnswer = (num: number): string => {
  // Round to max 2 decimal places
  const rounded = Math.round(num * 100) / 100;

  if (Math.abs(rounded) >= 1_000_000_000) {
    const val = rounded / 1_000_000_000;
    return `${val.toLocaleString("de-DE")} Mrd`;
  }
  if (Math.abs(rounded) >= 1_000_000) {
    const val = rounded / 1_000_000;
    return `${val.toLocaleString("de-DE")} Mio`;
  }
  if (Math.abs(rounded) >= 10_000) {
    const val = rounded / 1_000;
    return `${val.toLocaleString("de-DE")}k`;
  }
  return rounded.toLocaleString("de-DE");
};

/**
 * Reset session tracking (call when starting a new sprint).
 */
export const resetMentalMathSession = () => {
  seenIds = [];
};

/**
 * Clear everything (cache + session).
 */
export const clearMentalMathCache = () => {
  cachedTasks = [];
  cacheFilterKey = "";
  seenIds = [];
  explanationCache = {};
  clearTemplateCache();
};

/**
 * Get count of available tasks for the current filter.
 */
export const getMentalMathTaskCount = (): number => {
  return cachedTasks.length;
};
