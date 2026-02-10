import { supabase } from "@/integrations/supabase/client";
import { Task, ShortcutInfo } from "@/types/drill";
import { normalizeInput } from "@/lib/taskGenerator";

let taskCounter = 10000; // Offset to avoid ID collision with generated tasks
let dbTaskCache: { task: string; id: string }[] = [];
let cacheKey = "";
let usedIds: Set<string> = new Set();

/**
 * Parse a multiplication task string like "5 x 20" or "0,5 Mio x 100"
 * and compute the numeric answer.
 */
export const parseMultiplicationTask = (taskStr: string): number | null => {
  // Split on " x " (with spaces)
  const parts = taskStr.split(/\s*x\s*/i);
  if (parts.length !== 2) return null;

  const left = normalizeInput(parts[0]);
  const right = normalizeInput(parts[1]);

  if (left === null || right === null) return null;
  return left * right;
};

/**
 * Fetch random multiplication tasks from the DB for the given difficulty.
 * Caches results to minimize DB calls during a sprint session.
 */
export const fetchDbMultiplicationTasks = async (
  difficulty: "easy" | "medium" | "hard"
): Promise<void> => {
  const key = `multiplication_${difficulty}`;
  if (cacheKey === key && dbTaskCache.length > 0) return;

  const { data, error } = await supabase
    .from("drill_tasks")
    .select("id, task")
    .eq("category", "mental_math")
    .eq("difficulty", difficulty)
    .eq("task_type", "multiplication")
    .eq("active", true);

  if (error) {
    console.error("Error fetching DB tasks:", error.message);
    dbTaskCache = [];
    return;
  }

  dbTaskCache = data ?? [];
  cacheKey = key;
  usedIds.clear();
};

/**
 * Get a random task from the cached DB tasks, avoiding repeats.
 * Returns null if no tasks available.
 */
export const getRandomDbTask = (): Task | null => {
  if (dbTaskCache.length === 0) return null;

  // Filter out already used tasks
  const available = dbTaskCache.filter((t) => !usedIds.has(t.id));

  // If all used, reset
  if (available.length === 0) {
    usedIds.clear();
    return getRandomDbTask();
  }

  const pick = available[Math.floor(Math.random() * available.length)];
  usedIds.add(pick.id);

  const answer = parseMultiplicationTask(pick.task);
  if (answer === null) {
    console.warn("Could not parse task:", pick.task);
    // Skip this task and try another
    return getRandomDbTask();
  }

  const shortcut: ShortcutInfo = {
    name: "Nullen zählen",
    description: "Multipliziere die signifikanten Ziffern, dann hänge alle Nullen an.",
    steps: [
      `Rechne: **${pick.task}**`,
      `Ergebnis: **${answer.toLocaleString("de-DE")}**`,
    ],
  };

  return {
    id: ++taskCounter,
    type: "multiplication",
    question: pick.task,
    answer,
    shortcut,
    difficulty: 1,
  };
};

/**
 * Reset the used-task tracking (call when starting a new sprint).
 */
export const resetDbTaskHistory = () => {
  usedIds.clear();
};

/**
 * Clear the entire cache (forces re-fetch on next call).
 */
export const clearDbTaskCache = () => {
  dbTaskCache = [];
  cacheKey = "";
  usedIds.clear();
};
