import { Task, TaskType, ShortcutInfo } from "@/types/drill";

// ============================================
// HELPERS & CONSTANTS
// ============================================

let taskCounter = 0;
const sessionTaskHistory = new Set<string>();

const addToHistory = (key: string) => {
  sessionTaskHistory.add(key);
  if (sessionTaskHistory.size > 500) {
    const arr = Array.from(sessionTaskHistory);
    sessionTaskHistory.clear();
    arr.slice(-250).forEach(k => sessionTaskHistory.add(k));
  }
};
const isInHistory = (key: string): boolean => sessionTaskHistory.has(key);
export const resetTaskHistory = () => { sessionTaskHistory.clear(); };

const choice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const bold = (t: string | number): string => `**${t}**`;

const formatNumber = (num: number, useAbbrev = false): string => {
  if (useAbbrev) {
    if (Math.abs(num) >= 1_000_000_000) {
      const v = num / 1_000_000_000;
      return v % 1 === 0 ? `${v} Mrd` : `${v.toFixed(1).replace(".", ",")} Mrd`;
    }
    if (Math.abs(num) >= 1_000_000) {
      const v = num / 1_000_000;
      return v % 1 === 0 ? `${v} Mio` : `${v.toFixed(1).replace(".", ",")} Mio`;
    }
    if (Math.abs(num) >= 1000) {
      const v = num / 1000;
      return v % 1 === 0 ? `${v}k` : `${v.toFixed(1).replace(".", ",")}k`;
    }
  }
  return num.toLocaleString("de-DE");
};

const fmtAbbrev = (num: number): string => formatNumber(num, true);

// Pick a random display format for a number (sometimes abbreviated)
const fmtRand = (num: number): string => {
  if (num >= 1000 && Math.random() > 0.4) return fmtAbbrev(num);
  return formatNumber(num);
};

type GenResult = { question: string; answer: number; shortcut: ShortcutInfo; tolerance?: number };

const makeTask = (type: TaskType, difficulty: number, r: GenResult): Task => ({
  id: ++taskCounter,
  type,
  question: r.question,
  answer: r.answer,
  shortcut: r.shortcut,
  difficulty,
  ...(r.tolerance !== undefined ? { tolerance: r.tolerance } : {}),
});

const tryGenerate = (type: TaskType, difficulty: number, gen: () => GenResult, maxAttempts = 30): Task => {
  for (let i = 0; i < maxAttempts; i++) {
    const r = gen();
    const key = `${type}:${difficulty}:${r.question}`;
    if (!isInHistory(key)) {
      addToHistory(key);
      return makeTask(type, difficulty, r);
    }
  }
  // Fallback: accept duplicate
  const r = gen();
  return makeTask(type, difficulty, r);
};

// ============================================
// MULTIPLICATION
// ============================================

const generateMultiplicationL1 = (): GenResult => {
  const template = choice(["einmaleins", "rund", "einheit"]);

  if (template === "einmaleins") {
    const a = choice([2, 3, 4, 5, 6, 7, 8, 9]);
    const b = choice([3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 20, 25]);
    const answer = a * b;
    return {
      question: `${a} × ${b}`,
      answer,
      shortcut: { name: "Kleines Einmaleins", description: "Ergebnis direkt abrufbar.", steps: [`${bold(a)} × ${bold(b)} = ${bold(answer)}`] },
    };
  }
  if (template === "rund") {
    const a = choice([20, 30, 40, 50, 60, 80, 100, 200, 300, 500]);
    const b = choice([2, 3, 4, 5, 6, 8, 10, 20, 30, 50]);
    const answer = a * b;
    if (answer > 25_000) return generateMultiplicationL1(); // retry if too large
    return {
      question: `${formatNumber(a)} × ${b}`,
      answer,
      shortcut: {
        name: "Nullen zählen",
        description: "Kernziffern multiplizieren, Nullen anhängen.",
        steps: [`Kernziffern: ${bold(a / (10 ** (a.toString().match(/0+$/)?.[0]?.length || 0)))} × ${bold(b)}`, `Ergebnis: ${bold(fmtAbbrev(answer))}`],
      },
    };
  }
  // einheit
  const a = choice([2, 3, 4, 5, 6, 8, 10]);
  const unit = choice(["k", "Mio"]);
  const mult = unit === "k" ? 1000 : 1_000_000;
  const b = choice([2, 3, 4, 5, 6, 8, 10]);
  const answer = a * mult * b;
  return {
    question: `${a} ${unit} × ${b}`,
    answer,
    shortcut: {
      name: "Kernziffern multiplizieren",
      description: `${a} × ${b} rechnen, Einheit beibehalten.`,
      steps: [`${bold(a)} × ${bold(b)} = ${bold(a * b)}`, `Ergebnis: ${bold(fmtAbbrev(answer))}`],
    },
  };
};

const generateMultiplicationL2 = (): GenResult => {
  const template = choice(["zweistell", "dezimal_einheit", "fast_rund"]);

  if (template === "zweistell") {
    const a = choice([12, 15, 16, 18, 22, 24, 25, 32, 35, 45]);
    const b = choice([12, 14, 15, 16, 18, 22, 24, 25]);
    const answer = a * b;
    let shortcut: ShortcutInfo;
    if (b === 25 || a === 25) {
      const other = b === 25 ? a : b;
      shortcut = { name: "Viertel-Trick", description: "×25 = ×100 ÷ 4", steps: [`${bold(other)} × 100 = ${bold(other * 100)}`, `÷ 4 = ${bold(answer)}`] };
    } else if (b === 15 || a === 15) {
      const other = b === 15 ? a : b;
      shortcut = { name: "Distributivgesetz", description: "×15 = ×10 + ×5", steps: [`${bold(other)} × 10 = ${bold(other * 10)}`, `${bold(other)} × 5 = ${bold(other * 5)}`, `Summe: ${bold(answer)}`] };
    } else if (b === 12 || a === 12) {
      const other = b === 12 ? a : b;
      shortcut = { name: "Faktor-Trick", description: "×12 = ×10 + ×2", steps: [`${bold(other)} × 10 = ${bold(other * 10)}`, `${bold(other)} × 2 = ${bold(other * 2)}`, `Summe: ${bold(answer)}`] };
    } else {
      const bigger = Math.max(a, b);
      const smaller = Math.min(a, b);
      const tens = Math.floor(bigger / 10) * 10;
      const ones = bigger % 10;
      shortcut = { name: "Distributivgesetz", description: `Zerlege ${bigger} in ${tens} + ${ones}`, steps: [`${bold(smaller)} × ${tens} = ${bold(smaller * tens)}`, `${bold(smaller)} × ${ones} = ${bold(smaller * ones)}`, `Summe: ${bold(answer)}`] };
    }
    return { question: `${a} × ${b}`, answer, shortcut };
  }
  if (template === "dezimal_einheit") {
    const a = choice([1.5, 2.5, 3.5, 4.5, 0.5, 0.8, 1.2, 2.4]);
    const unit = choice(["Mio", "k"]);
    const mult = unit === "Mio" ? 1_000_000 : 1000;
    const b = choice([3, 4, 5, 6, 8, 10, 12, 15, 20]);
    const answer = a * mult * b;
    const core = a * b;
    return {
      question: `${String(a).replace(".", ",")} ${unit} × ${b}`,
      answer,
      shortcut: {
        name: "Dezimalzahl auflösen",
        description: `${String(a).replace(".", ",")} × ${b} rechnen, dann Einheit.`,
        steps: [`${bold(String(a).replace(".", ","))} × ${bold(b)} = ${bold(String(core).replace(".", ","))}`, `Ergebnis: ${bold(fmtAbbrev(answer))}`],
      },
    };
  }
  // fast_rund
  const nearRound = choice([19, 21, 29, 31, 49, 51, 99, 101]);
  const round = nearRound < 50 ? Math.round(nearRound / 10) * 10 : nearRound > 90 ? 100 : 50;
  const diff = nearRound - round;
  const b = choice([10, 15, 20, 25, 30, 40, 50]);
  const answer = nearRound * b;
  return {
    question: `${nearRound} × ${b}`,
    answer,
    shortcut: {
      name: "Ankertechnik",
      description: `${nearRound} = ${round} ${diff >= 0 ? "+" : ""}${diff}`,
      steps: [`${bold(round)} × ${bold(b)} = ${bold(round * b)}`, `${diff >= 0 ? "+" : ""}${diff} × ${bold(b)} = ${bold(diff * b)}`, `Summe: ${bold(answer)}`],
    },
  };
};

const generateMultiplicationL3 = (): GenResult => {
  const template = choice(["dreistellig", "dezimal_dezimal", "dreifach", "wachstum"]);

  if (template === "dreistellig") {
    const a = randInt(11, 49) * 10 + randInt(1, 9); // 111-499, no trailing zero
    const b = randInt(12, 89);
    const answer = a * b;
    const aH = Math.floor(a / 100) * 100;
    const aRest = a - aH;
    return {
      question: `${formatNumber(a)} × ${b}`,
      answer,
      shortcut: {
        name: "Schriftliches Multiplizieren",
        description: `Zerlege ${a} in ${aH} + ${aRest}`,
        steps: [`${bold(aH)} × ${bold(b)} = ${bold(formatNumber(aH * b))}`, `${bold(aRest)} × ${bold(b)} = ${bold(formatNumber(aRest * b))}`, `Summe: ${bold(formatNumber(answer))}`],
      },
    };
  }
  if (template === "dezimal_dezimal") {
    const a = choice([1.2, 1.5, 1.8, 2.3, 2.5, 3.5, 4.5]);
    const b = choice([0.8, 1.5, 2.5, 3.5, 4.5, 5.5]);
    const unit = choice(["Mio", "k"]);
    const mult = unit === "Mio" ? 1_000_000 : 1000;
    const answer = Math.round(a * b * mult * 100) / 100;
    const core = Math.round(a * b * 100) / 100;
    return {
      question: `${String(a).replace(".", ",")} ${unit} × ${String(b).replace(".", ",")}`,
      answer,
      shortcut: {
        name: "Faktorzerlegung",
        description: "Ganze und Dezimalteile separat rechnen.",
        steps: [
          `${bold(Math.floor(a))} × ${bold(String(b).replace(".", ","))} = ${bold(String(Math.round(Math.floor(a) * b * 100) / 100).replace(".", ","))}`,
          `${bold(String(a - Math.floor(a)).replace(".", ","))} × ${bold(String(b).replace(".", ","))} = ${bold(String(Math.round((a - Math.floor(a)) * b * 100) / 100).replace(".", ","))}`,
          `Ergebnis: ${bold(fmtAbbrev(answer))}`,
        ],
      },
    };
  }
  if (template === "dreifach") {
    const a = choice([100, 150, 200, 250, 300, 400, 500]);
    const unitA = choice(["k", ""]);
    const multA = unitA === "k" ? 1000 : 1;
    const b = choice([8, 10, 12, 15, 20, 25]);
    const c = choice([0.4, 0.5, 0.6, 0.8, 1.2, 1.5]);
    const answer = Math.round(a * multA * b * c * 100) / 100;
    const step1 = a * multA * b;
    return {
      question: `${formatNumber(a)}${unitA ? " " + unitA : ""} × ${b} × ${String(c).replace(".", ",")}`,
      answer,
      shortcut: {
        name: "Schritt-für-Schritt",
        description: "Erst die ersten zwei Faktoren, dann den dritten.",
        steps: [`${bold(formatNumber(a) + (unitA ? " " + unitA : ""))} × ${bold(b)} = ${bold(fmtAbbrev(step1))}`, `× ${bold(String(c).replace(".", ","))} = ${bold(fmtAbbrev(answer))}`],
      },
    };
  }
  // wachstum
  const factor = choice([1.08, 1.10, 1.12, 1.15, 1.18, 1.20, 1.25]);
  const pct = Math.round((factor - 1) * 100);
  const base = choice([80, 120, 150, 200, 250, 350, 450, 500]);
  const unit = choice(["Mio", "k"]);
  const mult = unit === "Mio" ? 1_000_000 : 1000;
  const answer = Math.round(factor * base * mult * 100) / 100;
  const growth = Math.round((factor - 1) * base * mult * 100) / 100;
  return {
    question: `${String(factor).replace(".", ",")} × ${base} ${unit}`,
    answer,
    shortcut: {
      name: "Wachstumsfaktor",
      description: `${String(factor).replace(".", ",")} = 1 + ${pct}%`,
      steps: [`Basis: ${bold(fmtAbbrev(base * mult))}`, `+${pct}%: ${bold(fmtAbbrev(growth))}`, `Ergebnis: ${bold(fmtAbbrev(answer))}`],
    },
  };
};

// ============================================
// PERCENTAGE
// ============================================

const generatePercentageL1 = (): GenResult => {
  const pct = choice([10, 20, 25, 50]);
  const base = choice([100, 200, 400, 500, 800, 1000, 2000, 5000]);
  const unit = choice(["", "k", "Mio"]);
  const mult = unit === "k" ? 1000 : unit === "Mio" ? 1_000_000 : 1;
  const answer = (pct / 100) * base * mult;
  const divisor = pct === 10 ? 10 : pct === 20 ? 5 : pct === 25 ? 4 : 2;
  const methodName = pct === 10 ? "Komma verschieben" : pct === 50 ? "Halbieren" : pct === 25 ? "Vierteln" : "Fünfteln";
  return {
    question: `${pct}% von ${fmtRand(base * mult)}`,
    answer,
    shortcut: {
      name: "Block-Methode",
      description: `${pct}% = ÷ ${divisor} (${methodName})`,
      steps: [`${bold(fmtAbbrev(base * mult))} ÷ ${bold(divisor)} = ${bold(fmtAbbrev(answer))}`],
    },
  };
};

const generatePercentageL2 = (): GenResult => {
  const template = choice(["zusammengesetzt", "drittel", "business"]);

  if (template === "zusammengesetzt") {
    const pct = choice([5, 15, 30, 35, 40, 60, 75]);
    const base = choice([120, 180, 240, 360, 450, 600, 800, 1200]);
    const unit = choice(["k", "Mio"]);
    const mult = unit === "k" ? 1000 : 1_000_000;
    const answer = (pct / 100) * base * mult;
    const ten = (base * mult) / 10;
    let steps: string[];
    if (pct === 5) steps = [`10% = ${bold(fmtAbbrev(ten))}`, `÷ 2 = ${bold(fmtAbbrev(answer))}`];
    else if (pct === 15) steps = [`10% = ${bold(fmtAbbrev(ten))}`, `5% = ${bold(fmtAbbrev(ten / 2))}`, `Summe: ${bold(fmtAbbrev(answer))}`];
    else if (pct === 30) steps = [`10% = ${bold(fmtAbbrev(ten))}`, `× 3 = ${bold(fmtAbbrev(answer))}`];
    else if (pct === 35) steps = [`30% = ${bold(fmtAbbrev(ten * 3))}`, `5% = ${bold(fmtAbbrev(ten / 2))}`, `Summe: ${bold(fmtAbbrev(answer))}`];
    else if (pct === 40) steps = [`10% = ${bold(fmtAbbrev(ten))}`, `× 4 = ${bold(fmtAbbrev(answer))}`];
    else if (pct === 60) steps = [`10% = ${bold(fmtAbbrev(ten))}`, `× 6 = ${bold(fmtAbbrev(answer))}`];
    else steps = [`50% = ${bold(fmtAbbrev(base * mult / 2))}`, `25% = ${bold(fmtAbbrev(base * mult / 4))}`, `Summe: ${bold(fmtAbbrev(answer))}`]; // 75%
    return {
      question: `${pct}% von ${fmtRand(base * mult)}`,
      answer,
      shortcut: { name: "Block-Zerlegung", description: `${pct}% aus 10%-Bausteinen zusammensetzen.`, steps },
    };
  }
  if (template === "drittel") {
    const pct = choice([33, 66]);
    const base = choice([90, 120, 180, 240, 300, 450, 600, 900]);
    const unit = choice(["k", "Mio"]);
    const mult = unit === "k" ? 1000 : 1_000_000;
    const third = (base * mult) / 3;
    const answer = pct === 33 ? third : third * 2;
    return {
      question: `${pct}% von ${fmtRand(base * mult)}`,
      answer,
      shortcut: {
        name: "Bruch-Trick",
        description: pct === 33 ? "33% ≈ ⅓" : "66% ≈ ⅔",
        steps: [`${bold(fmtAbbrev(base * mult))} ÷ 3 = ${bold(fmtAbbrev(third))}`, ...(pct === 66 ? [`× 2 = ${bold(fmtAbbrev(answer))}`] : [])],
      },
    };
  }
  // business
  const pct = choice([8, 12, 15, 18, 22]);
  const base = choice([500, 800, 1200, 1500, 2400]);
  const unit = choice(["k", "Mio"]);
  const mult = unit === "k" ? 1000 : 1_000_000;
  const answer = (pct / 100) * base * mult;
  const ten = (base * mult) / 10;
  const decomp: string[] = [];
  let remainder = pct;
  if (remainder >= 10) { decomp.push(`10% = ${bold(fmtAbbrev(ten))}`); remainder -= 10; }
  if (remainder >= 10) { decomp.push(`10% = ${bold(fmtAbbrev(ten))}`); remainder -= 10; }
  if (remainder >= 5) { decomp.push(`5% = ${bold(fmtAbbrev(ten / 2))}`); remainder -= 5; }
  if (remainder >= 2) { decomp.push(`${remainder}% = ${bold(fmtAbbrev((remainder / 100) * base * mult))}`); }
  decomp.push(`Summe: ${bold(fmtAbbrev(answer))}`);
  return {
    question: `${pct}% von ${fmtRand(base * mult)}`,
    answer,
    shortcut: { name: "Block-Zerlegung", description: `${pct}% in 10%/5%/1%-Bausteine zerlegen.`, steps: decomp },
  };
};

const generatePercentageL3 = (): GenResult => {
  const template = choice(["unrund", "umkehr", "veraenderung"]);

  if (template === "unrund") {
    const pctOptions: { pct: number; hint: string }[] = [
      { pct: 12.5, hint: "12,5% = ⅛" }, { pct: 37.5, hint: "37,5% = ⅜" },
      { pct: 7, hint: "7% = 10% - 3%" }, { pct: 17, hint: "17% = 10% + 5% + 2%" },
      { pct: 42, hint: "42% = 40% + 2%" }, { pct: 65, hint: "65% = 50% + 15%" },
      { pct: 83, hint: "83% = 80% + 3%" },
    ];
    const pick = choice(pctOptions);
    const base = choice([148, 234, 348, 520, 640, 780, 960]);
    const unit = choice(["k", "Mio"]);
    const mult = unit === "k" ? 1000 : 1_000_000;
    const answer = Math.round((pick.pct / 100) * base * mult * 100) / 100;
    const isFraction = pick.pct === 12.5 || pick.pct === 37.5;
    return {
      question: `${String(pick.pct).replace(".", ",")}% von ${fmtRand(base * mult)}`,
      answer,
      tolerance: Math.abs(answer) * 0.03,
      shortcut: {
        name: isFraction ? "Bruch-Trick" : "Block-Zerlegung",
        description: pick.hint,
        steps: [`Basis: ${bold(fmtAbbrev(base * mult))}`, `${pick.hint}`, `Ergebnis: ≈ ${bold(fmtAbbrev(answer))}`],
      },
    };
  }
  if (template === "umkehr") {
    // "What percentage is X of Y?"
    const pctAnswer = choice([5, 8, 10, 12, 15, 20, 25, 30, 40]);
    const total = choice([200, 400, 500, 600, 800, 1000, 1200, 1500, 2000]);
    const unit = choice(["k", "Mio"]);
    const mult = unit === "k" ? 1000 : 1_000_000;
    const part = (pctAnswer / 100) * total * mult;
    return {
      question: `Welcher Prozentsatz ist ${fmtAbbrev(part)} von ${fmtAbbrev(total * mult)}?`,
      answer: pctAnswer,
      shortcut: {
        name: "Umkehr-Prozent",
        description: "Teil ÷ Ganzes × 100",
        steps: [`${bold(fmtAbbrev(part))} ÷ ${bold(fmtAbbrev(total * mult))} = ${bold(String(pctAnswer / 100).replace(".", ","))}`, `× 100 = ${bold(pctAnswer + "%")}`],
      },
    };
  }
  // veraenderung
  const pctChange = choice([5, 8, 10, 12, 15, 20, 25, 30, 40, 50]);
  const isGrowth = Math.random() > 0.3;
  const oldVal = choice([200, 350, 500, 680, 850, 1000, 1200]) * (choice(["k", "Mio"]) === "k" ? 1000 : 1_000_000);
  const newVal = isGrowth ? Math.round(oldVal * (1 + pctChange / 100)) : Math.round(oldVal * (1 - pctChange / 100));
  const verb = isGrowth ? "stieg" : "sank";
  return {
    question: `Umsatz ${verb} von ${fmtAbbrev(oldVal)} auf ${fmtAbbrev(newVal)}. Veränderung in %?`,
    answer: isGrowth ? pctChange : -pctChange,
    tolerance: 0.5,
    shortcut: {
      name: "Veränderungsrate",
      description: "(Neu - Alt) ÷ Alt × 100",
      steps: [
        `Differenz: ${bold(fmtAbbrev(newVal - oldVal))}`,
        `÷ ${bold(fmtAbbrev(oldVal))} = ${bold(String(((newVal - oldVal) / oldVal)).replace(".", ","))}`,
        `× 100 = ${bold((isGrowth ? "+" : "") + pctChange + "%")}`,
      ],
    },
  };
};

// ============================================
// DIVISION
// ============================================

const generateDivisionL1 = (): GenResult => {
  const template = choice(["clean", "einheit"]);

  if (template === "clean") {
    const result = choice([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 50, 100]);
    const divisor = choice([2, 3, 4, 5, 6, 8, 10]);
    const dividend = result * divisor;
    const scale = choice([1, 10, 100, 1000]);
    const sDividend = dividend * scale;
    const sResult = result * scale;
    return {
      question: `${fmtRand(sDividend)} ÷ ${divisor}`,
      answer: sResult,
      shortcut: {
        name: "Kürzen",
        description: scale > 1 ? "Nullen streichen, dann Kernrechnung." : "Einfache Division.",
        steps: [
          ...(scale > 1 ? [`Kürze: ${bold(formatNumber(sDividend))} ÷ ${bold(divisor)} → ${bold(dividend)} ÷ ${bold(divisor)}`] : []),
          `= ${bold(result)}`,
          ...(scale > 1 ? [`Ergebnis: ${bold(fmtAbbrev(sResult))}`] : []),
        ],
      },
    };
  }
  // einheit
  const base = choice([2, 3, 4, 6, 8, 9, 10, 12, 15, 20]);
  const divisor = choice([2, 3, 4, 5]);
  const result = base / divisor;
  if (result !== Math.floor(result)) return generateDivisionL1(); // retry for clean result
  const unit = choice(["Mio", "Mrd", "k"]);
  const mult = unit === "k" ? 1000 : unit === "Mio" ? 1_000_000 : 1_000_000_000;
  return {
    question: `${base} ${unit} ÷ ${divisor}`,
    answer: result * mult,
    shortcut: {
      name: "Einheit beibehalten",
      description: `${base} ÷ ${divisor} rechnen, Einheit bleibt ${unit}.`,
      steps: [`${bold(base)} ÷ ${bold(divisor)} = ${bold(result)}`, `Ergebnis: ${bold(fmtAbbrev(result * mult))}`],
    },
  };
};

const generateDivisionL2 = (): GenResult => {
  const template = choice(["zweistellig", "cross_unit", "kuerzen"]);

  if (template === "zweistellig") {
    const divisor = choice([12, 15, 16, 18, 24, 25, 35, 45, 55, 75]);
    const result = choice([10, 15, 20, 25, 30, 40, 50, 60, 80, 100, 200, 500]);
    const dividend = divisor * result;
    const unit = dividend >= 10000 ? choice(["k", ""]) : "";
    const mult = unit === "k" ? 1000 : 1;
    const displayDividend = dividend * mult;
    const displayResult = result * mult;
    let trickSteps: string[];
    if (divisor === 25) {
      trickSteps = [`÷ 25 = ÷ 100 × 4`, `${bold(fmtAbbrev(displayDividend))} ÷ 100 = ${bold(fmtAbbrev(displayDividend / 100))}`, `× 4 = ${bold(fmtAbbrev(displayResult))}`];
    } else if (divisor === 15) {
      trickSteps = [`÷ 15 = ÷ 3 ÷ 5`, `${bold(fmtAbbrev(displayDividend))} ÷ 3 = ${bold(fmtAbbrev(displayDividend / 3))}`, `÷ 5 = ${bold(fmtAbbrev(displayResult))}`];
    } else {
      trickSteps = [`${bold(fmtAbbrev(displayDividend))} ÷ ${bold(divisor)} = ${bold(fmtAbbrev(displayResult))}`];
    }
    return {
      question: `${fmtRand(displayDividend)} ÷ ${divisor}`,
      answer: displayResult,
      shortcut: { name: "Faktorzerlegung", description: `Teiler ${divisor} in einfachere Faktoren zerlegen.`, steps: trickSteps },
    };
  }
  if (template === "cross_unit") {
    // Mrd ÷ k = Mio or Mio ÷ k = units
    const coreResult = choice([2, 3, 4, 5, 6, 8, 10]);
    const divisorCore = choice([2, 3, 4, 5, 6, 8]);
    const dividendCore = coreResult * divisorCore;
    const isLarge = Math.random() > 0.5;
    if (isLarge) {
      // Mrd ÷ k = Mio
      return {
        question: `${dividendCore} Mrd ÷ ${divisorCore}k`,
        answer: coreResult * 1_000_000,
        shortcut: { name: "Unit Game", description: "Mrd ÷ k = Mio", steps: [`Kernrechnung: ${bold(dividendCore)} ÷ ${bold(divisorCore)} = ${bold(coreResult)}`, `Einheit: Mrd ÷ k = Mio`, `Ergebnis: ${bold(coreResult)} Mio`] },
      };
    }
    // Mio ÷ k = Einheiten
    return {
      question: `${dividendCore} Mio ÷ ${divisorCore}k`,
      answer: coreResult * 1000,
      shortcut: { name: "Unit Game", description: "Mio ÷ k = Tausender", steps: [`Kernrechnung: ${bold(dividendCore)} ÷ ${bold(divisorCore)} = ${bold(coreResult)}`, `Einheit: Mio ÷ k = k`, `Ergebnis: ${bold(coreResult)}k`] },
    };
  }
  // kuerzen
  const gcd = choice([3, 5, 7, 9]);
  const reducedA = choice([6, 8, 10, 12, 14, 15, 16, 18, 20]);
  const reducedB = choice([2, 3, 4, 5]);
  const dividend = reducedA * gcd;
  const divisor = reducedB * gcd;
  const result = reducedA / reducedB;
  if (result !== Math.floor(result)) return generateDivisionL2(); // retry for clean
  const scale = choice([1, 10, 100, 1000]);
  return {
    question: `${fmtRand(dividend * scale)} ÷ ${divisor}`,
    answer: result * scale,
    shortcut: {
      name: "Gemeinsam kürzen",
      description: `Beide durch ${gcd} teilen.`,
      steps: [`${bold(dividend)} ÷ ${bold(gcd)} = ${bold(reducedA)}`, `${bold(divisor)} ÷ ${bold(gcd)} = ${bold(reducedB)}`, `${bold(reducedA)} ÷ ${bold(reducedB)} = ${bold(result)}`, ...(scale > 1 ? [`Ergebnis: ${bold(fmtAbbrev(result * scale))}`] : [])],
    },
  };
};

const generateDivisionL3 = (): GenResult => {
  const template = choice(["dezimal", "complex_unit", "remainder"]);

  if (template === "dezimal") {
    const decimals: { d: number; reciprocal: string; mult: number }[] = [
      { d: 0.04, reciprocal: "×25", mult: 25 },
      { d: 0.05, reciprocal: "×20", mult: 20 },
      { d: 0.08, reciprocal: "×12,5", mult: 12.5 },
      { d: 0.12, reciprocal: "×8,33", mult: 1 / 0.12 },
      { d: 0.15, reciprocal: "×6,67", mult: 1 / 0.15 },
      { d: 0.25, reciprocal: "×4", mult: 4 },
      { d: 0.35, reciprocal: "×2,86", mult: 1 / 0.35 },
    ];
    const pick = choice(decimals);
    // Generate dividend so result is clean
    const result = choice([200, 300, 400, 500, 600, 750, 800, 1000, 1200, 1500, 2000, 2500, 3000]);
    const dividend = Math.round(result * pick.d * 100) / 100;
    const answer = result;
    return {
      question: `${String(dividend).replace(".", ",")} ÷ ${String(pick.d).replace(".", ",")}`,
      answer,
      shortcut: {
        name: "Kehrwert-Multiplikation",
        description: `÷ ${String(pick.d).replace(".", ",")} = ${pick.reciprocal}`,
        steps: [`${bold(String(dividend).replace(".", ","))} ${pick.reciprocal} = ${bold(formatNumber(answer))}`],
      },
    };
  }
  if (template === "complex_unit") {
    // e.g., "3,6 Mrd ÷ 450k = 8.000"
    const result = choice([4, 5, 6, 8, 10, 12, 15, 20]);
    const divisorK = choice([150, 200, 250, 300, 400, 450, 500, 600, 750, 800]);
    const dividendMrd = (result * divisorK * 1000) / 1_000_000_000;
    const answer = result * 1000; // result in absolute
    // Format dividend nicely
    const dividendDisplay = dividendMrd >= 1
      ? `${String(dividendMrd).replace(".", ",")} Mrd`
      : `${String(dividendMrd * 1000).replace(".", ",")} Mio`;
    return {
      question: `${dividendDisplay} ÷ ${formatNumber(divisorK)}k`,
      answer,
      shortcut: {
        name: "Einheiten vereinfachen",
        description: "Erst Einheiten normalisieren, dann Kernziffern.",
        steps: [
          `${dividendDisplay} = ${bold(fmtAbbrev(dividendMrd * 1_000_000_000))}`,
          `÷ ${bold(formatNumber(divisorK))}k = ÷ ${bold(formatNumber(divisorK * 1000))}`,
          `Kernrechnung → ${bold(formatNumber(answer))}`,
        ],
      },
    };
  }
  // remainder — division with non-integer result
  const dividend = choice([100, 150, 200, 250, 300, 350, 400, 500, 700, 800]);
  const divisor = choice([3, 6, 7, 9, 11, 12, 13, 14]);
  const answer = Math.round((dividend / divisor) * 100) / 100;
  const approx = Math.round(answer * 10) / 10;
  return {
    question: `${formatNumber(dividend)} ÷ ${divisor}`,
    answer,
    tolerance: Math.abs(answer) * 0.02,
    shortcut: {
      name: "Annäherung",
      description: "Nächste teilbare Zahl finden, dann korrigieren.",
      steps: [`${bold(dividend)} ÷ ${bold(divisor)} ≈ ${bold(String(approx).replace(".", ","))}`],
    },
  };
};

// ============================================
// ZEROS (Nullen-Management)
// ============================================

const generateZerosL1 = (): GenResult => {
  const template = choice(["mult_unit", "add_sub"]);

  if (template === "mult_unit") {
    const op = choice(["×", "÷"]);
    const base = choice([2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 20]);
    const unit = choice(["k", "Mio", "Mrd"]);
    const mult = unit === "k" ? 1000 : unit === "Mio" ? 1_000_000 : 1_000_000_000;
    const factor = choice([2, 3, 4, 5]);
    if (op === "×") {
      const answer = base * mult * factor;
      return {
        question: `${base} ${unit} × ${factor}`,
        answer,
        shortcut: { name: "Kernziffern rechnen", description: `${base} × ${factor}, Einheit beibehalten.`, steps: [`${bold(base)} × ${bold(factor)} = ${bold(base * factor)}`, `Ergebnis: ${bold(fmtAbbrev(answer))}`] },
      };
    }
    if (base % factor !== 0) return generateZerosL1(); // retry for clean
    const answer = (base / factor) * mult;
    return {
      question: `${base} ${unit} ÷ ${factor}`,
      answer,
      shortcut: { name: "Kernziffern rechnen", description: `${base} ÷ ${factor}, Einheit beibehalten.`, steps: [`${bold(base)} ÷ ${bold(factor)} = ${bold(base / factor)}`, `Ergebnis: ${bold(fmtAbbrev(answer))}`] },
    };
  }
  // add_sub
  const unit = choice(["k", "Mio", "Mrd"]);
  const mult = unit === "k" ? 1000 : unit === "Mio" ? 1_000_000 : 1_000_000_000;
  const a = choice([1, 2, 3, 4, 5, 7, 8, 10]);
  const b = choice([1, 2, 3, 4, 5, 6, 7]);
  const op = choice(["+", "-"]);
  if (op === "-" && a <= b) return generateZerosL1(); // retry
  const answer = op === "+" ? (a + b) * mult : (a - b) * mult;
  return {
    question: `${a} ${unit} ${op} ${b} ${unit}`,
    answer,
    shortcut: { name: "Gleiche Einheiten", description: `Kernziffern ${op === "+" ? "addieren" : "subtrahieren"}, Einheit beibehalten.`, steps: [`${bold(a)} ${op} ${bold(b)} = ${bold(op === "+" ? a + b : a - b)}`, `Ergebnis: ${bold(fmtAbbrev(answer))}`] },
  };
};

const generateZerosL2 = (): GenResult => {
  const template = choice(["cross_tier", "dezimal_unit"]);

  if (template === "cross_tier") {
    const op = choice(["×", "÷"]);
    if (op === "×") {
      // k × k = Mio or Mio × k = Mrd
      const isSmall = Math.random() > 0.5;
      const a = choice([2, 3, 4, 5, 6, 8, 10, 12, 15, 20]);
      const b = choice([2, 3, 4, 5, 6, 8, 10, 15, 20]);
      if (isSmall) {
        // k × k = Mio
        const answer = a * 1000 * b * 1000;
        return {
          question: `${a}k × ${b}k`,
          answer,
          shortcut: { name: "Unit Game", description: "k × k = Mio", steps: [`${bold(a)} × ${bold(b)} = ${bold(a * b)}`, `k × k = Mio`, `Ergebnis: ${bold(fmtAbbrev(answer))}`] },
        };
      }
      // Mio × k-range
      const answer = a * 1_000_000 * b * 1000;
      return {
        question: `${a} Mio × ${b}k`,
        answer,
        shortcut: { name: "Unit Game", description: "Mio × k = Mrd", steps: [`${bold(a)} × ${bold(b)} = ${bold(a * b)}`, `Mio × k = Mrd`, `Ergebnis: ${bold(fmtAbbrev(answer))}`] },
      };
    }
    // Division cross-tier
    const coreResult = choice([2, 3, 4, 5, 6, 8, 10]);
    const divisorK = choice([2, 3, 4, 5, 6, 8, 10]);
    const dividendMrd = coreResult * divisorK;
    return {
      question: `${dividendMrd} Mrd ÷ ${divisorK}k`,
      answer: coreResult * 1_000_000,
      shortcut: { name: "Unit Game", description: "Mrd ÷ k = Mio", steps: [`${bold(dividendMrd)} ÷ ${bold(divisorK)} = ${bold(coreResult)}`, `Mrd ÷ k = Mio`, `Ergebnis: ${bold(coreResult)} Mio`] },
    };
  }
  // dezimal_unit
  const a = choice([1.2, 1.5, 1.8, 2.4, 3.5, 4.5, 6.5, 7.5]);
  const divisorK = choice([200, 300, 400, 500, 600, 750, 800]);
  // a Mrd ÷ divisorK k
  const dividend = a * 1_000_000_000;
  const divisorFull = divisorK * 1000;
  const answer = dividend / divisorFull;
  if (answer !== Math.round(answer)) return generateZerosL2(); // retry for clean
  return {
    question: `${String(a).replace(".", ",")} Mrd ÷ ${formatNumber(divisorK)}k`,
    answer,
    shortcut: {
      name: "Dezimal auflösen",
      description: `${String(a).replace(".", ",")} Mrd in Mio umrechnen, dann durch ${formatNumber(divisorK)} teilen.`,
      steps: [`${bold(String(a).replace(".", ","))} Mrd = ${bold(formatNumber(a * 1000))} Mio`, `÷ ${bold(formatNumber(divisorK))} = ${bold(fmtAbbrev(answer))}`],
    },
  };
};

const generateZerosL3 = (): GenResult => {
  const template = choice(["multi_op", "unit_convert"]);

  if (template === "multi_op") {
    const a = choice([1.2, 1.5, 1.8, 2.4, 3.5]);
    const unitA = "Mio";
    const b = choice([4, 5, 6, 8, 10, 12, 15]);
    const c = choice([0.4, 0.5, 0.6, 0.8, 1.2, 1.5]);
    const answer = Math.round(a * 1_000_000 * b * c * 100) / 100;
    const step1 = a * 1_000_000 * b;
    return {
      question: `${String(a).replace(".", ",")} ${unitA} × ${b} × ${String(c).replace(".", ",")}`,
      answer,
      shortcut: {
        name: "Schritt-für-Schritt",
        description: "Erst die ersten zwei, dann den dritten Faktor.",
        steps: [`${bold(String(a).replace(".", ","))} Mio × ${bold(b)} = ${bold(fmtAbbrev(step1))}`, `× ${bold(String(c).replace(".", ","))} = ${bold(fmtAbbrev(answer))}`],
      },
    };
  }
  // unit_convert: Mio × large number = Mrd
  const a = choice([1.2, 1.5, 1.8, 2.4, 3.6]);
  const b = choice([400, 600, 800, 1000, 1200, 1500, 2000]);
  const answer = a * 1_000_000 * b;
  const answerMrd = answer / 1_000_000_000;
  return {
    question: `${String(a).replace(".", ",")} Mio × ${formatNumber(b)}`,
    answer,
    shortcut: {
      name: "Einheiten-Umrechnung",
      description: `Mio × ${formatNumber(b)} → ergibt Mrd-Bereich`,
      steps: [
        `${bold(String(a).replace(".", ","))} × ${bold(formatNumber(b))} = ${bold(String(a * b).replace(".", ","))}`,
        `${bold(String(a).replace(".", ","))} Mio × ${bold(formatNumber(b))} = ${bold(String(answerMrd).replace(".", ","))} Mrd`,
      ],
    },
  };
};

// ============================================
// GROWTH
// ============================================

const generateGrowthL1 = (): GenResult => {
  const base = choice([100, 200, 300, 500, 800, 1000]);
  const unit = choice(["k", "Mio"]);
  const mult = unit === "k" ? 1000 : 1_000_000;
  const rate = choice([10, 20, 50, 100]);
  const growth = (rate / 100) * base * mult;
  const answer = base * mult + growth;
  const methodName = rate === 10 ? "Komma verschieben" : rate === 50 ? "Halbieren" : rate === 20 ? "÷5" : "Verdoppeln";
  return {
    question: `${base} ${unit} + ${rate}%`,
    answer,
    shortcut: {
      name: "Einfacher Zuwachs",
      description: `${rate}% = ${methodName}`,
      steps: [`${rate}% von ${bold(fmtAbbrev(base * mult))} = ${bold(fmtAbbrev(growth))}`, `+ Basis = ${bold(fmtAbbrev(answer))}`],
    },
  };
};

const generateGrowthL2 = (): GenResult => {
  const template = choice(["wachstum", "abnahme"]);

  const base = choice([80, 120, 150, 200, 240, 300, 450, 600, 800]);
  const unit = choice(["k", "Mio"]);
  const mult = unit === "k" ? 1000 : 1_000_000;

  if (template === "wachstum") {
    const rate = choice([5, 15, 25, 30, 40]);
    const growth = (rate / 100) * base * mult;
    const answer = base * mult + growth;
    const ten = base * mult / 10;
    let steps: string[];
    if (rate === 5) steps = [`10% = ${bold(fmtAbbrev(ten))}`, `÷ 2 = ${bold(fmtAbbrev(growth))}`, `+ Basis = ${bold(fmtAbbrev(answer))}`];
    else if (rate === 15) steps = [`10% = ${bold(fmtAbbrev(ten))}`, `5% = ${bold(fmtAbbrev(ten / 2))}`, `Zuwachs: ${bold(fmtAbbrev(growth))}`, `+ Basis = ${bold(fmtAbbrev(answer))}`];
    else if (rate === 25) steps = [`25% = ÷ 4 = ${bold(fmtAbbrev(growth))}`, `+ Basis = ${bold(fmtAbbrev(answer))}`];
    else if (rate === 30) steps = [`10% = ${bold(fmtAbbrev(ten))}`, `× 3 = ${bold(fmtAbbrev(growth))}`, `+ Basis = ${bold(fmtAbbrev(answer))}`];
    else steps = [`10% = ${bold(fmtAbbrev(ten))}`, `× 4 = ${bold(fmtAbbrev(growth))}`, `+ Basis = ${bold(fmtAbbrev(answer))}`]; // 40%
    return {
      question: `${base} ${unit} + ${rate}%`,
      answer,
      shortcut: { name: "Block-Methode", description: `${rate}% aus 10%-Bausteinen.`, steps },
    };
  }
  // abnahme
  const rate = choice([10, 20, 25, 50]);
  const decline = (rate / 100) * base * mult;
  const answer = base * mult - decline;
  return {
    question: `${base} ${unit} − ${rate}%`,
    answer,
    shortcut: {
      name: "Abnahme",
      description: `${rate}% abziehen = × ${String(1 - rate / 100).replace(".", ",")}`,
      steps: [`${rate}% von ${bold(fmtAbbrev(base * mult))} = ${bold(fmtAbbrev(decline))}`, `${bold(fmtAbbrev(base * mult))} − ${bold(fmtAbbrev(decline))} = ${bold(fmtAbbrev(answer))}`],
    },
  };
};

const generateGrowthL3 = (): GenResult => {
  const template = choice(["compound", "cagr", "multistep"]);

  if (template === "compound") {
    // 2-year compound growth
    const base = choice([50, 80, 100, 120, 150, 200, 250]);
    const unit = "Mio";
    const mult = 1_000_000;
    const rate = choice([5, 8, 10, 12, 15, 20, 25]);
    const factor = 1 + rate / 100;
    const year1 = Math.round(base * factor * 100) / 100;
    const year2 = Math.round(year1 * factor * 100) / 100;
    const answer = year2 * mult;
    return {
      question: `${base} Mio wächst 2 Jahre um ${rate}% p.a. → Endwert?`,
      answer,
      tolerance: Math.abs(answer) * 0.02,
      shortcut: {
        name: "Zinseszins",
        description: `Basis × (1 + ${rate}%)² = Basis × ${String(factor).replace(".", ",")}²`,
        steps: [
          `Jahr 1: ${bold(base)} × ${bold(String(factor).replace(".", ","))} = ${bold(String(year1).replace(".", ","))} Mio`,
          `Jahr 2: ${bold(String(year1).replace(".", ","))} × ${bold(String(factor).replace(".", ","))} = ${bold(String(year2).replace(".", ","))} Mio`,
          `Ergebnis: ${bold(fmtAbbrev(answer))}`,
        ],
      },
    };
  }
  if (template === "cagr") {
    // Given start and end, find growth rate
    const rate = choice([5, 8, 10, 12, 15, 20, 25]);
    const base = choice([50, 80, 100, 120, 150, 200]);
    const years = 2;
    const factor = 1 + rate / 100;
    const endVal = Math.round(base * Math.pow(factor, years) * 100) / 100;
    return {
      question: `Von ${base} Mio auf ${String(endVal).replace(".", ",")} Mio in ${years} Jahren → CAGR in %?`,
      answer: rate,
      tolerance: 1,
      shortcut: {
        name: "CAGR-Rückrechnung",
        description: "√(Endwert/Anfangswert) − 1",
        steps: [
          `${bold(String(endVal).replace(".", ","))} ÷ ${bold(base)} = ${bold(String(Math.round(endVal / base * 100) / 100).replace(".", ","))}`,
          `√ davon = ${bold(String(factor).replace(".", ","))}`,
          `− 1 = ${bold(rate + "%")} p.a.`,
        ],
      },
    };
  }
  // multistep: Revenue → Margin → Tax → Net
  const revenue = choice([500, 800, 1200, 1500, 2000, 2400, 3000]);
  const revUnit = choice(["Mio", "k"]);
  const revMult = revUnit === "Mio" ? 1_000_000 : 1000;
  const margin = choice([8, 10, 12, 15, 20, 25]);
  const taxRate = choice([20, 25, 30]);
  const ebit = (margin / 100) * revenue * revMult;
  const tax = (taxRate / 100) * ebit;
  const answer = ebit - tax;
  return {
    question: `Umsatz ${formatNumber(revenue)} ${revUnit}, ${margin}% Marge, ${taxRate}% Steuern → Nettogewinn?`,
    answer,
    tolerance: Math.abs(answer) * 0.02,
    shortcut: {
      name: "Stufenrechnung",
      description: "Umsatz → EBIT → Nettogewinn",
      steps: [
        `EBIT: ${bold(fmtAbbrev(revenue * revMult))} × ${bold(margin + "%")} = ${bold(fmtAbbrev(ebit))}`,
        `Steuer: ${bold(fmtAbbrev(ebit))} × ${bold(taxRate + "%")} = ${bold(fmtAbbrev(tax))}`,
        `Netto: ${bold(fmtAbbrev(ebit))} − ${bold(fmtAbbrev(tax))} = ${bold(fmtAbbrev(answer))}`,
      ],
    },
  };
};

// ============================================
// DISPATCH
// ============================================

const generators: Record<string, Record<number, () => GenResult>> = {
  multiplication: { 1: generateMultiplicationL1, 2: generateMultiplicationL2, 3: generateMultiplicationL3 },
  percentage: { 1: generatePercentageL1, 2: generatePercentageL2, 3: generatePercentageL3 },
  division: { 1: generateDivisionL1, 2: generateDivisionL2, 3: generateDivisionL3 },
  zeros: { 1: generateZerosL1, 2: generateZerosL2, 3: generateZerosL3 },
  growth: { 1: generateGrowthL1, 2: generateGrowthL2, 3: generateGrowthL3 },
};

export const generateTask = (type: TaskType, difficulty: number = 1): Task => {
  const safeType = type === "all" ? choice(["multiplication", "percentage", "division", "zeros", "growth"] as TaskType[]) : type;
  const safeDiff = Math.max(1, Math.min(3, difficulty));
  const gen = generators[safeType]?.[safeDiff];
  if (!gen) return tryGenerate("multiplication", 1, generateMultiplicationL1);
  return tryGenerate(safeType, safeDiff, gen);
};

// ============================================
// INPUT NORMALIZATION
// ============================================

const normalizeInput = (input: string): number | null => {
  if (typeof input !== "string") return null;

  let cleaned = input.trim().toLowerCase();
  if (cleaned === "" || cleaned === "-") return null;

  // Remove currency symbols and common suffixes
  cleaned = cleaned.replace(/[€$]/g, "").trim();
  cleaned = cleaned.replace(/\s+/g, "");
  cleaned = cleaned.replace(/eur$/i, "").replace(/usd$/i, "");

  // Handle scientific notation
  if (/^-?\d+(\.\d+)?e\d+$/.test(cleaned)) {
    return parseFloat(cleaned);
  }

  // Check for percentage sign
  let isPercent = false;
  if (cleaned.endsWith("%")) {
    cleaned = cleaned.replace(/%$/, "");
    isPercent = true;
  }

  // Detect unit multiplier
  let multiplier = 1;
  if (/(bio|trillion|t)$/.test(cleaned)) {
    cleaned = cleaned.replace(/(bio|trillion|t)$/, "");
    multiplier = 1_000_000_000_000;
  } else if (/(mrd|milliarden?|bn)$/.test(cleaned)) {
    cleaned = cleaned.replace(/(mrd|milliarden?|bn)$/, "");
    multiplier = 1_000_000_000;
  } else if (/(mio|mill(?:ionen?)?|million(?:en)?|m)$/.test(cleaned)) {
    cleaned = cleaned.replace(/(mio|mill(?:ionen?)?|million(?:en)?|m)$/, "");
    multiplier = 1_000_000;
  } else if (/(k|tsd|tausend)$/.test(cleaned)) {
    cleaned = cleaned.replace(/(k|tsd|tausend)$/, "");
    multiplier = 1_000;
  } else if (/b$/.test(cleaned)) {
    cleaned = cleaned.replace(/b$/, "");
    multiplier = 1_000_000_000;
  }

  cleaned = cleaned.trim();
  if (cleaned === "" || cleaned === "-") return multiplier > 1 ? null : null;

  // Determine number format (German vs English)
  const dots = (cleaned.match(/\./g) || []).length;
  const commas = (cleaned.match(/,/g) || []).length;

  let numericValue: number;

  if (dots === 0 && commas === 0) {
    numericValue = parseFloat(cleaned);
  } else if (dots === 0 && commas === 1) {
    // Single comma - German decimal: 1,5 -> 1.5
    numericValue = parseFloat(cleaned.replace(",", "."));
  } else if (dots === 1 && commas === 0) {
    // Single dot - check if it's a thousands separator (e.g., 1.000)
    const afterDot = cleaned.split(".")[1];
    if (afterDot && afterDot.length === 3 && !afterDot.includes("0") === false) {
      // Could be German thousands, check context
      if (/^\d{1,3}\.\d{3}$/.test(cleaned)) {
        numericValue = parseFloat(cleaned.replace(".", ""));
      } else {
        numericValue = parseFloat(cleaned);
      }
    } else {
      numericValue = parseFloat(cleaned);
    }
  } else if (dots >= 1 && commas === 1) {
    // German format: 1.000.000,50
    numericValue = parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
  } else if (commas >= 1 && dots === 1) {
    // English format: 1,000,000.50
    numericValue = parseFloat(cleaned.replace(/,/g, ""));
  } else if (commas > 1 && dots === 0) {
    numericValue = parseFloat(cleaned.replace(/,/g, ""));
  } else if (dots > 1 && commas === 0) {
    numericValue = parseFloat(cleaned.replace(/\./g, ""));
  } else {
    numericValue = parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
  }

  if (isNaN(numericValue)) return null;

  numericValue *= multiplier;

  if (isPercent) {
    // Already correct, user entered with %
  }

  return numericValue;
};

// ============================================
// ANSWER CHECKING
// ============================================

export const checkAnswer = (userAnswer: number | string, correctAnswer: number, isPercentageResult: boolean = false, tolerance?: number): boolean => {
  let normalizedUserAnswer: number;

  if (typeof userAnswer === "string") {
    const normalized = normalizeInput(userAnswer);
    if (normalized === null) return false;
    normalizedUserAnswer = normalized;
  } else {
    normalizedUserAnswer = userAnswer;
  }

  // For percentage results, also accept decimal form (0.035 for 3.5%)
  if (isPercentageResult && normalizedUserAnswer < 1 && correctAnswer >= 1) {
    normalizedUserAnswer *= 100;
  }

  // Use custom tolerance if provided, otherwise default (0.01%)
  if (tolerance !== undefined && tolerance > 0) {
    return Math.abs(normalizedUserAnswer - correctAnswer) <= tolerance;
  }

  const epsilon = Math.abs(correctAnswer) * 0.0001;
  const tol = Math.max(epsilon, 0.01);
  return Math.abs(normalizedUserAnswer - correctAnswer) <= tol;
};

export { normalizeInput };

// ============================================
// ERROR HINTS
// ============================================

export const generateErrorHint = (userAnswer: number | string, correctAnswer: number): string => {
  let normalizedUserAnswer: number;

  if (typeof userAnswer === "string") {
    const normalized = normalizeInput(userAnswer);
    if (normalized === null) return "Konnte die Eingabe nicht als Zahl interpretieren.";
    normalizedUserAnswer = normalized;
  } else {
    normalizedUserAnswer = userAnswer;
  }

  if (correctAnswer === 0) return "Überprüfe deinen Rechenweg Schritt für Schritt.";

  const ratio = normalizedUserAnswer / correctAnswer;

  if (Math.abs(ratio - 10) < 0.5) return "Eine Null zu viel! Überprüfe die Größenordnung.";
  if (Math.abs(ratio - 0.1) < 0.05) return "Eine Null zu wenig! Überprüfe die Größenordnung.";
  if (Math.abs(ratio - 100) < 5) return "Zwei Nullen zu viel! Nutze das Unit Game.";
  if (Math.abs(ratio - 0.01) < 0.005) return "Zwei Nullen zu wenig! Nutze das Unit Game.";
  if (Math.abs(ratio - 1000) < 50) return "Drei Nullen zu viel! k × k = Mio, nicht Mrd.";
  if (Math.abs(ratio - 0.001) < 0.0005) return "Drei Nullen zu wenig! Mio ÷ k = k.";

  return "Überprüfe deinen Rechenweg Schritt für Schritt.";
};
