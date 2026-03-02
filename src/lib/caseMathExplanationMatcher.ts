import { supabase } from "@/integrations/supabase/client";

export interface CaseMathExplanationTemplate {
  id: string;
  task_type: string;
  difficulty: string;
  match_rule: string;
  explanation_text: string;
  priority: number;
}

let templateCache: Record<string, CaseMathExplanationTemplate[]> = {};
let cacheLoaded = false;

/**
 * Fetch all active case math explanation templates and cache them.
 */
export const loadCaseMathExplanationTemplates = async (): Promise<void> => {
  const { data, error } = await supabase
    .from("case_math_explanation_templates")
    .select("id, task_type, difficulty, match_rule, explanation_text, priority")
    .eq("active", true)
    .order("priority", { ascending: false });

  if (error) {
    console.error("Error loading case math explanation templates:", error.message);
    return;
  }

  templateCache = {};
  for (const row of (data as CaseMathExplanationTemplate[]) ?? []) {
    const key = `${row.task_type}_${row.difficulty}`;
    (templateCache[key] ??= []).push(row);
  }
  cacheLoaded = true;
  console.log(`Loaded ${data?.length ?? 0} case math explanation templates`);
};

const matchesRule = (rule: string, questionText: string): boolean => {
  const trimmed = rule.trim();

  if (trimmed.startsWith("contains:")) {
    const needle = trimmed.slice("contains:".length).trim();
    return questionText.toLowerCase().includes(needle.toLowerCase());
  }

  if (trimmed.startsWith("regex:")) {
    const pattern = trimmed.slice("regex:".length).trim();
    try {
      return new RegExp(pattern, "i").test(questionText);
    } catch {
      return false;
    }
  }

  return false;
};

/**
 * Get the best matching explanation for a case math task.
 * taskType should be the DB task_type: profitability, investment_roi, break_even
 */
export const getCaseMathExplanation = (
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

export const isCaseMathTemplateCacheLoaded = (): boolean => cacheLoaded;

export const clearCaseMathTemplateCache = (): void => {
  templateCache = {};
  cacheLoaded = false;
};
