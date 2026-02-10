import { supabase } from "@/integrations/supabase/client";

export interface ExplanationTemplate {
  id: string;
  task_type: string;
  difficulty: string;
  match_rule: string;
  explanation_text: string;
  priority: number;
}

// In-memory cache keyed by "task_type_difficulty"
let templateCache: Record<string, ExplanationTemplate[]> = {};
let cacheLoaded = false;

/**
 * Fetch all active templates and cache them grouped by task_type + difficulty.
 */
export const loadExplanationTemplates = async (): Promise<void> => {
  const { data, error } = await supabase
    .from("mental_math_explanation_templates")
    .select("id, task_type, difficulty, match_rule, explanation_text, priority")
    .eq("active", true)
    .order("priority", { ascending: false });

  if (error) {
    console.error("Error loading explanation templates:", error.message);
    return;
  }

  templateCache = {};
  for (const row of (data as ExplanationTemplate[]) ?? []) {
    const key = `${row.task_type}_${row.difficulty}`;
    (templateCache[key] ??= []).push(row);
  }
  cacheLoaded = true;
  console.log(`Loaded ${data?.length ?? 0} explanation templates`);
};

/**
 * Check if a match_rule matches the question text.
 * Supports:
 *   "contains: <text>"
 *   "regex: <pattern>"
 */
const matchesRule = (rule: string, questionText: string): boolean => {
  const trimmed = rule.trim();

  if (trimmed.startsWith("contains:")) {
    const needle = trimmed.slice("contains:".length).trim();
    return questionText.includes(needle);
  }

  if (trimmed.startsWith("regex:")) {
    const pattern = trimmed.slice("regex:".length).trim();
    try {
      return new RegExp(pattern).test(questionText);
    } catch {
      console.warn("Invalid regex in match_rule:", pattern);
      return false;
    }
  }

  return false;
};

/**
 * Get the best matching explanation for a specific question.
 * Returns the explanation_text of the first matching template (sorted by priority DESC),
 * or null if no template matches.
 */
export const getTemplateExplanation = (
  questionText: string,
  taskType: string,
  difficulty: string
): string | null => {
  const key = `${taskType}_${difficulty}`;
  const templates = templateCache[key];
  if (!templates || templates.length === 0) return null;

  for (const tmpl of templates) {
    if (matchesRule(tmpl.match_rule, questionText)) {
      return tmpl.explanation_text;
    }
  }

  return null;
};

/**
 * Check if templates have been loaded.
 */
export const isTemplateCacheLoaded = (): boolean => cacheLoaded;

/**
 * Clear template cache (e.g. on filter change).
 */
export const clearTemplateCache = (): void => {
  templateCache = {};
  cacheLoaded = false;
};
