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

const VALID_DIFFICULTIES = ["easy", "medium", "hard"];
const VALID_CASE_CATEGORIES = ["profitability", "investment_roi", "break_even", "market_sizing"];
const VALID_MENTAL_TYPES = ["multiplication", "percentage", "division", "zero_management"];

export function validateCaseMathRow(row: Record<string, string>, idx: number): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!row.difficulty || !VALID_DIFFICULTIES.includes(row.difficulty)) {
    errors.push({ row: idx, field: "difficulty", message: `Ungültiger Wert: "${row.difficulty}". Erlaubt: ${VALID_DIFFICULTIES.join(", ")}` });
  }
  if (!row.category || !VALID_CASE_CATEGORIES.includes(row.category)) {
    errors.push({ row: idx, field: "category", message: `Ungültiger Wert: "${row.category}". Erlaubt: ${VALID_CASE_CATEGORIES.join(", ")}` });
  }
  if (!row.question?.trim()) {
    errors.push({ row: idx, field: "question", message: "Pflichtfeld fehlt" });
  }
  if (!row.answer_value || isNaN(Number(row.answer_value))) {
    errors.push({ row: idx, field: "answer_value", message: "Muss numerisch sein" });
  }
  return errors;
}

export function validateMentalMathRow(row: Record<string, string>, idx: number): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!row.difficulty || !VALID_DIFFICULTIES.includes(row.difficulty)) {
    errors.push({ row: idx, field: "difficulty", message: `Ungültiger Wert: "${row.difficulty}". Erlaubt: ${VALID_DIFFICULTIES.join(", ")}` });
  }
  if (!row.task_type || !VALID_MENTAL_TYPES.includes(row.task_type)) {
    errors.push({ row: idx, field: "task_type", message: `Ungültiger Wert: "${row.task_type}". Erlaubt: ${VALID_MENTAL_TYPES.join(", ")}` });
  }
  if (!row.question?.trim()) {
    errors.push({ row: idx, field: "question", message: "Pflichtfeld fehlt" });
  }
  if (!row.answer_value || isNaN(Number(row.answer_value))) {
    errors.push({ row: idx, field: "answer_value", message: "Muss numerisch sein" });
  }
  return errors;
}

export const CASE_MATH_CSV_TEMPLATE = `module,difficulty,category,question,answer_value,answer_unit,answer_display,tolerance,tags,explanation,active
case_math,easy,profitability,"Ein Unternehmen hat 100k EUR Umsatz und 60k EUR Kosten. Wie hoch ist der Gewinn?",40000,EUR,€40k,0,gewinn,Umsatz minus Kosten,true`;

export const MENTAL_MATH_CSV_TEMPLATE = `module,difficulty,task_type,question,answer_value,answer_display,tolerance,number_format,time_limit_sec,tags,explanation,active
mental_math,easy,multiplication,"25 × 16",400,400,0,integers,10,multiplication,25×16=400,true`;
