/**
 * Robust CSV parser supporting quoted strings and UTF-8.
 */
export function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          result.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/^\ufeff/, ""));
  const rows = lines.slice(1).map((line) => {
    const values = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });

  return { headers, rows };
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const VALID_CATEGORIES = ["case_math", "mental_math"];
const VALID_DIFFICULTIES = ["easy", "medium", "hard"];
const VALID_TASK_TYPES = [
  "profitability", "investment_roi", "break_even", "market_sizing",
  "multiplication", "percentage", "division", "zero_management",
];

export function validateDrillTaskRow(row: Record<string, string>, idx: number): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!row.category || !VALID_CATEGORIES.includes(row.category)) {
    errors.push({ row: idx, field: "category", message: `Ungültiger Wert: "${row.category}". Erlaubt: ${VALID_CATEGORIES.join(", ")}` });
  }
  if (!row.difficulty || !VALID_DIFFICULTIES.includes(row.difficulty)) {
    errors.push({ row: idx, field: "difficulty", message: `Ungültiger Wert: "${row.difficulty}". Erlaubt: ${VALID_DIFFICULTIES.join(", ")}` });
  }
  if (row.task_type && !VALID_TASK_TYPES.includes(row.task_type)) {
    errors.push({ row: idx, field: "task_type", message: `Ungültiger Wert: "${row.task_type}". Erlaubt: ${VALID_TASK_TYPES.join(", ")}` });
  }
  if (!row.task?.trim()) {
    errors.push({ row: idx, field: "task", message: "Pflichtfeld fehlt" });
  }
  return errors;
}

export const DRILL_TASKS_CSV_TEMPLATE = `category,difficulty,task_type,task
case_math,easy,profitability,"Ein Unternehmen hat 100k EUR Umsatz und 60k EUR Kosten. Wie hoch ist der Gewinn?"
mental_math,medium,multiplication,"25 × 16"`;
