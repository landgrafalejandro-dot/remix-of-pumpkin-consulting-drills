import { Task, TaskType, ShortcutInfo } from "@/types/drill";

let taskCounter = 0;

// Helper function to format numbers with German notation
const formatNumber = (num: number, useAbbrev: boolean = false): string => {
  if (useAbbrev) {
    if (num >= 1_000_000_000) {
      const val = num / 1_000_000_000;
      return val % 1 === 0 ? `${val} Mrd` : `${val.toFixed(1).replace('.', ',')} Mrd`;
    }
    if (num >= 1_000_000) {
      const val = num / 1_000_000;
      return val % 1 === 0 ? `${val} Mio` : `${val.toFixed(1).replace('.', ',')} Mio`;
    }
    if (num >= 1000) {
      const val = num / 1000;
      return val % 1 === 0 ? `${val}k` : `${val.toFixed(1).replace('.', ',')}k`;
    }
  }
  return num.toLocaleString('de-DE');
};

// Format number for display in steps (with bold markers)
const bold = (text: string | number): string => `**${text}**`;

// Random choice helper
const choice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ============================================
// LEVEL 1: Clean & Fast (Einfach)
// ============================================
const generateMultiplicationL1 = (): Task => {
  const bases = [300, 400, 500, 600, 800, 2000, 5000, 10000, 40000];
  const multipliers = [10, 20, 30, 40, 50, 100, 200, 500];

  const base = choice(bases);
  const mult = choice(multipliers);
  const answer = base * mult;
  
  const useAbbrev = Math.random() > 0.5;
  
  const shortcut: ShortcutInfo = {
    name: "Nullen zählen",
    description: "Multipliziere die signifikanten Ziffern, dann hänge alle Nullen an.",
    steps: [
      `Zähle Nullen: ${bold(base)} hat ${(base.toString().match(/0+$/) || [''])[0].length} Nullen, ${bold(mult)} hat ${(mult.toString().match(/0+$/) || [''])[0].length} Nullen`,
      `Multipliziere Kernziffern`,
      `Ergebnis: ${bold(formatNumber(answer, useAbbrev))}`
    ]
  };
  
  return {
    id: ++taskCounter,
    type: "multiplication",
    question: `${formatNumber(base, useAbbrev)} × ${formatNumber(mult)}`,
    answer,
    shortcut,
    difficulty: 1,
  };
};

// ============================================
// LEVEL 2: Details & Combinations (Medium)
// ============================================
const generateMultiplicationL2 = (): Task => {
  const bases = [15, 25, 35, 45, 55, 75, 150, 250, 550, 1500];
  const multipliers = [12, 15, 18, 24, 25, 45, 55, 150];

  const base = choice(bases);
  const mult = choice(multipliers);
  const answer = base * mult;
  
  const useAbbrev = Math.random() > 0.7;
  
  let shortcut: ShortcutInfo;
  
  if (mult === 15 || mult === 25 || mult === 45) {
    const tens = Math.floor(mult / 10) * 10;
    const ones = mult % 10;
    shortcut = {
      name: "Distributivgesetz",
      description: `Zerlege ${mult} in ${tens} + ${ones} für einfachere Teilrechnungen.`,
      steps: [
        `${bold(base)} × ${tens} = ${bold(formatNumber(base * tens))}`,
        `${bold(base)} × ${ones} = ${bold(formatNumber(base * ones))}`,
        `Summe: ${bold(formatNumber(answer))}`
      ]
    };
  } else if (mult === 25) {
    shortcut = {
      name: "Viertel-Trick",
      description: "×25 = ×100÷4. Erst ×100 (Nullen anhängen), dann ÷4.",
      steps: [
        `${bold(base)} × 100 = ${bold(formatNumber(base * 100))}`,
        `÷ 4 = ${bold(formatNumber(answer))}`,
      ]
    };
  } else {
    shortcut = {
      name: "Faktorzerlegung",
      description: "Zerlege einen Faktor in handlichere Teile.",
      steps: [
        `Rechne ${bold(formatNumber(base))} × ${bold(mult)}`,
        `Ergebnis: ${bold(formatNumber(answer))}`
      ]
    };
  }
  
  return {
    id: ++taskCounter,
    type: "multiplication",
    question: `${formatNumber(base, useAbbrev)} × ${mult}`,
    answer,
    shortcut,
    difficulty: 2,
  };
};

// ============================================
// LEVEL 3: Decimal Precision (Schwer) - VARIANCE PROTOCOL
// ============================================

// Track recent tasks to avoid repetition
const recentL3Tasks: string[] = [];
const MAX_RECENT = 10;

const addToHistory = (taskKey: string) => {
  recentL3Tasks.push(taskKey);
  if (recentL3Tasks.length > MAX_RECENT) recentL3Tasks.shift();
};

const isInHistory = (taskKey: string): boolean => recentL3Tasks.includes(taskKey);

// Format number with random unit variation (70% with units, 30% without)
const formatWithRandomUnit = (num: number): { value: number; display: string } => {
  const useUnit = Math.random() < 0.7;
  
  if (!useUnit) {
    return { value: num, display: num.toLocaleString('de-DE') };
  }
  
  // Randomly choose format style
  const style = Math.random();
  
  if (num >= 1_000_000_000) {
    const val = num / 1_000_000_000;
    if (style < 0.4) return { value: num, display: `${val.toString().replace('.', ',')} Mrd` };
    if (style < 0.7) return { value: num, display: `${val.toString().replace('.', ',')} Mrd.` };
    return { value: num, display: `${(val * 1000).toLocaleString('de-DE')} Mio` };
  }
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    if (style < 0.35) return { value: num, display: `${val.toString().replace('.', ',')} Mio` };
    if (style < 0.55) return { value: num, display: `${val.toString().replace('.', ',')} M` };
    if (style < 0.75) return { value: num, display: `${val.toString().replace('.', ',')} Mio.` };
    return { value: num, display: `${(val * 1000).toLocaleString('de-DE')}k` };
  }
  if (num >= 1000) {
    const val = num / 1000;
    if (style < 0.4) return { value: num, display: `${val.toString().replace('.', ',')}k` };
    if (style < 0.7) return { value: num, display: `${val.toString().replace('.', ',')} Tsd` };
    return { value: num, display: num.toLocaleString('de-DE') };
  }
  return { value: num, display: num.toLocaleString('de-DE') };
};

// Archetype A: Komma-Verschiebung
const generateArchetypeA = (): Task | null => {
  const smallFactors = [0.02, 0.04, 0.05, 0.003, 0.025, 1.2, 1.5, 2.5, 0.08];
  const largeBases = [10, 20, 40, 50, 80, 100, 150, 200, 300, 400, 500, 600, 800, 900];
  const suffixes = [1_000_000, 1_000_000_000, 1_000]; // Mio, Mrd, k
  
  const factor1 = choice(smallFactors);
  const baseNum = choice(largeBases);
  const suffix = choice(suffixes);
  const factor2 = baseNum * suffix;
  
  const taskKey = `A:${factor1}x${factor2}`;
  if (isInHistory(taskKey)) return null;
  
  const answer = factor1 * factor2;
  const formatted = formatWithRandomUnit(factor2);
  const factor1Str = factor1.toString().replace('.', ',');
  
  const shortcut: ShortcutInfo = {
    name: "Komma-Verschiebung",
    description: `Bei ${factor1Str} das Komma passend verschieben und mit den signifikanten Ziffern multiplizieren.`,
    steps: [
      `${bold(factor1Str)} bedeutet: Komma um ${Math.abs(Math.log10(factor1)).toFixed(0)} Stellen verschieben`,
      `${formatted.display} → Kernrechnung identifizieren`,
      `Ergebnis: ${bold(formatNumber(answer, true))}`
    ]
  };
  
  addToHistory(taskKey);
  return {
    id: ++taskCounter,
    type: "multiplication",
    question: `${factor1Str} × ${formatted.display}`,
    answer,
    shortcut,
    difficulty: 3,
  };
};

// Archetype B: Brüche als Dezimal (1/8, 1/4 Fallen)
const generateArchetypeB = (): Task | null => {
  const fractionFactors = [
    { decimal: 0.125, fraction: "⅛", divisor: 8 },
    { decimal: 0.375, fraction: "⅜", mult: 3, divisor: 8 },
    { decimal: 0.625, fraction: "⅝", mult: 5, divisor: 8 },
    { decimal: 0.875, fraction: "⅞", mult: 7, divisor: 8 },
    { decimal: 1.25, fraction: "1¼", addBase: true, divisor: 4 },
    { decimal: 2.25, fraction: "2¼", mult: 9, divisor: 4 },
    { decimal: 0.75, fraction: "¾", mult: 3, divisor: 4 },
  ];
  // Numbers divisible by 8 or 4
  const divisibleBases = [16, 24, 32, 40, 48, 64, 80, 88, 96, 120, 160, 240, 320, 400, 480, 640, 800];
  
  const factorInfo = choice(fractionFactors);
  const base = choice(divisibleBases);
  
  const taskKey = `B:${factorInfo.decimal}x${base}`;
  if (isInHistory(taskKey)) return null;
  
  const answer = factorInfo.decimal * base;
  const decimalStr = factorInfo.decimal.toString().replace('.', ',');
  
  const shortcut: ShortcutInfo = {
    name: `Bruch-Trick (${factorInfo.fraction})`,
    description: `${decimalStr} = ${factorInfo.fraction}. Nutze den Bruch für einfacheres Rechnen.`,
    steps: [
      `${bold(decimalStr)} = ${bold(factorInfo.fraction)}`,
      `${bold(base)} ÷ ${factorInfo.divisor} = ${bold(base / factorInfo.divisor)}`,
      factorInfo.mult ? `× ${factorInfo.mult} = ${bold(answer)}` : `Ergebnis: ${bold(answer)}`
    ].filter(Boolean) as string[]
  };
  
  addToHistory(taskKey);
  return {
    id: ++taskCounter,
    type: "multiplication",
    question: `${decimalStr} × ${base}`,
    answer,
    shortcut,
    difficulty: 3,
  };
};

// Archetype C: Distributivgesetz (krumme Zahlen)
const generateArchetypeC = (): Task | null => {
  const crookedNumbers = [11, 12, 13, 14, 16, 17, 18, 19, 21, 22, 23, 24, 26, 27, 28, 29, 31, 32, 33];
  const smoothNumbers = [20, 30, 40, 50, 60, 80, 100, 150, 200, 300, 400, 500, 1.5, 2.5, 25];
  const suffixes = [1, 1_000, 1_000_000]; // none, k, Mio
  
  const crooked = choice(crookedNumbers);
  const smooth = choice(smoothNumbers);
  const suffix = choice(suffixes);
  const actualSmooth = smooth * suffix;
  
  const taskKey = `C:${crooked}x${actualSmooth}`;
  if (isInHistory(taskKey)) return null;
  
  const answer = crooked * actualSmooth;
  const formatted = formatWithRandomUnit(actualSmooth);
  
  const tens = Math.floor(crooked / 10) * 10;
  const ones = crooked % 10;
  
  const shortcut: ShortcutInfo = {
    name: "Distributivgesetz",
    description: `Zerlege ${crooked} in ${tens} + ${ones} für einfachere Teilrechnungen.`,
    steps: [
      `${bold(crooked)} = ${tens} + ${ones}`,
      `${tens} × ${formatted.display} = ${bold(formatNumber(tens * actualSmooth, true))}`,
      `${ones} × ${formatted.display} = ${bold(formatNumber(ones * actualSmooth, true))}`,
      `Summe: ${bold(formatNumber(answer, true))}`
    ]
  };
  
  addToHistory(taskKey);
  return {
    id: ++taskCounter,
    type: "multiplication",
    question: `${crooked} × ${formatted.display}`,
    answer,
    shortcut,
    difficulty: 3,
  };
};

// Archetype D: Growth Rates (1 + x)
const generateArchetypeD = (): Task | null => {
  const growthFactors = [1.02, 1.05, 1.08, 1.10, 1.12, 1.15, 1.18, 1.20, 1.25, 1.03];
  const bases = [20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 400, 500];
  const suffixes = [1_000, 1_000_000, 1_000_000_000]; // k, Mio, Mrd
  
  const growth = choice(growthFactors);
  const baseNum = choice(bases);
  const suffix = choice(suffixes);
  const actualBase = baseNum * suffix;
  
  const taskKey = `D:${growth}x${actualBase}`;
  if (isInHistory(taskKey)) return null;
  
  const answer = growth * actualBase;
  const formatted = formatWithRandomUnit(actualBase);
  const growthStr = growth.toString().replace('.', ',');
  const growthPct = Math.round((growth - 1) * 100);
  
  const shortcut: ShortcutInfo = {
    name: "Wachstums-Rechnung",
    description: `${growthStr} = 100% + ${growthPct}%. Berechne Basis + Zuwachs.`,
    steps: [
      `${bold(growthStr)} = 1 + ${(growth - 1).toFixed(2).replace('.', ',')} (= +${growthPct}%)`,
      `Basis: ${bold(formatted.display)}`,
      `+${growthPct}%: ${bold(formatNumber(actualBase * (growth - 1), true))}`,
      `Gesamt: ${bold(formatNumber(answer, true))}`
    ]
  };
  
  addToHistory(taskKey);
  return {
    id: ++taskCounter,
    type: "multiplication",
    question: `${growthStr} × ${formatted.display}`,
    answer,
    shortcut,
    difficulty: 3,
  };
};

// Archetype E: Quadratzahlen-Nähe
const generateArchetypeE = (): Task | null => {
  const nearSquares = [11, 12, 13, 14, 15, 16, 19, 21, 24, 25, 26, 29, 31];
  
  const num1 = choice(nearSquares);
  // Pick a number close to num1 but not the same
  const offset = choice([-2, -1, 1, 2]);
  const num2 = num1 + offset;
  
  if (num2 < 10 || num2 > 35) return null;
  
  const taskKey = `E:${Math.min(num1, num2)}x${Math.max(num1, num2)}`;
  if (isInHistory(taskKey)) return null;
  
  const answer = num1 * num2;
  
  // Find nearest square
  const avg = (num1 + num2) / 2;
  const nearestSquare = Math.round(avg);
  const diff = Math.abs(num1 - nearestSquare);
  
  const shortcut: ShortcutInfo = {
    name: "Quadratzahlen-Nähe",
    description: `(a+b)(a-b) = a² - b². Nutze bekannte Quadratzahlen als Anker.`,
    steps: [
      `${bold(num1)} × ${bold(num2)} liegt nahe bei ${nearestSquare}²`,
      `${nearestSquare}² = ${bold(nearestSquare * nearestSquare)}`,
      `Korrektur: ±${diff} → Ergebnis: ${bold(answer)}`
    ]
  };
  
  addToHistory(taskKey);
  return {
    id: ++taskCounter,
    type: "multiplication",
    question: `${num1} × ${num2}`,
    answer,
    shortcut,
    difficulty: 3,
  };
};

const generateMultiplicationL3 = (): Task => {
  const archetypes = [
    generateArchetypeA,
    generateArchetypeB,
    generateArchetypeC,
    generateArchetypeD,
    generateArchetypeE,
  ];
  
  // Shuffle archetypes for randomness
  const shuffled = [...archetypes].sort(() => Math.random() - 0.5);
  
  // Try each archetype until one succeeds (not in history)
  for (const generator of shuffled) {
    const task = generator();
    if (task) return task;
  }
  
  // Fallback: clear history and try again
  recentL3Tasks.length = 0;
  return shuffled[0]()!;
};

// Main multiplication generator by level
const generateMultiplication = (difficulty: number): Task => {
  if (difficulty === 1) return generateMultiplicationL1();
  if (difficulty === 2) return generateMultiplicationL2();
  return generateMultiplicationL3();
};

// ============================================
// PERCENTAGE GENERATORS BY LEVEL
// ============================================
const generatePercentageL1 = (): Task => {
  const bases = [100_000_000, 200_000_000, 500_000_000, 1_000_000_000, 2_000_000_000];
  const percentages = [10, 20, 25, 50];

  const base = choice(bases);
  const pct = choice(percentages);
  const answer = (base * pct) / 100;
  
  const divisor = 100 / pct;
  const shortcut: ShortcutInfo = {
    name: "Block-Methode",
    description: `${pct}% = 1/${divisor}. Einfach durch ${divisor} teilen.`,
    steps: [
      `${bold(pct + "%")} = 1/${divisor}`,
      `${formatNumber(base, true)} ÷ ${divisor} = ${bold(formatNumber(answer, true))}`,
    ]
  };
  
  return {
    id: ++taskCounter,
    type: "percentage",
    question: `${pct}% von ${formatNumber(base, true)}`,
    answer,
    shortcut,
    difficulty: 1,
  };
};

const generatePercentageL2 = (): Task => {
  const bases = [140_000, 280_000, 450_000, 800_000, 1_200_000];
  const percentages = [5, 15, 40, 60, 75];

  const base = choice(bases);
  const pct = choice(percentages);
  const answer = (base * pct) / 100;
  
  let shortcut: ShortcutInfo;
  
  if (pct === 5) {
    const tenPct = base * 0.1;
    shortcut = {
      name: "Block-Methode (5% = 10% ÷ 2)",
      description: "Berechne 10%, dann halbiere.",
      steps: [
        `10% von ${formatNumber(base, true)} = ${bold(formatNumber(tenPct, true))}`,
        `5% = ÷2 = ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (pct === 15) {
    const tenPct = base * 0.1;
    const fivePct = tenPct / 2;
    shortcut = {
      name: "Block-Methode (10% + 5%)",
      description: "15% = 10% + 5%. Berechne beide, addiere.",
      steps: [
        `10% = ${bold(formatNumber(tenPct, true))}`,
        `5% = ${bold(formatNumber(fivePct, true))}`,
        `15% = ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (pct === 40 || pct === 60) {
    const tenPct = base * 0.1;
    shortcut = {
      name: "Block-Methode (10%-Vielfache)",
      description: `${pct}% = ${pct / 10} × 10%. Berechne 10%, multipliziere.`,
      steps: [
        `10% = ${bold(formatNumber(tenPct, true))}`,
        `${pct}% = ${pct / 10} × 10% = ${bold(formatNumber(answer, true))}`
      ]
    };
  } else {
    const fiftyPct = base * 0.5;
    const twentyfivePct = base * 0.25;
    shortcut = {
      name: "Block-Methode (50% + 25%)",
      description: "75% = 50% + 25%. Hälfte + Viertel.",
      steps: [
        `50% = ${bold(formatNumber(fiftyPct, true))}`,
        `25% = ${bold(formatNumber(twentyfivePct, true))}`,
        `75% = ${bold(formatNumber(answer, true))}`
      ]
    };
  }
  
  return {
    id: ++taskCounter,
    type: "percentage",
    question: `${pct}% von ${formatNumber(base, true)}`,
    answer,
    shortcut,
    difficulty: 2,
  };
};

const generatePercentageL3 = (): Task => {
  const scenarios = [
    { base: 82_000_000, pct: 17, baseStr: "82 Mio" },
    { base: 64_000_000, pct: 12.5, baseStr: "64 Mio" },
    { base: 240_000_000, pct: 37.5, baseStr: "240 Mio" },
    { base: 160_000_000, pct: 2.5, baseStr: "160 Mio" },
    { base: 88_000_000, pct: 22, baseStr: "88 Mio" },
  ];

  const scenario = choice(scenarios);
  const answer = (scenario.base * scenario.pct) / 100;
  const pctStr = scenario.pct.toString().replace('.', ',');
  
  let shortcut: ShortcutInfo;
  
  if (scenario.pct === 12.5) {
    shortcut = {
      name: "Bruch-Trick (⅛)",
      description: "12,5% = ⅛. Teile durch 8.",
      steps: [
        `${bold("12,5%")} = ⅛`,
        `${scenario.baseStr} ÷ 8 = ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (scenario.pct === 37.5) {
    shortcut = {
      name: "Bruch-Trick (⅜)",
      description: "37,5% = ⅜ = 3 × ⅛. Berechne ⅛, multipliziere mit 3.",
      steps: [
        `⅛ = ${bold(formatNumber(scenario.base / 8, true))}`,
        `⅜ = 3 × ⅛ = ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (scenario.pct === 2.5) {
    const tenPct = scenario.base * 0.1;
    shortcut = {
      name: "Block-Methode (10% ÷ 4)",
      description: "2,5% = 10% ÷ 4. Berechne 10%, teile durch 4.",
      steps: [
        `10% = ${bold(formatNumber(tenPct, true))}`,
        `2,5% = ÷4 = ${bold(formatNumber(answer, true))}`
      ]
    };
  } else {
    // 17% or 22% - decomposition
    const tenPct = scenario.base * 0.1;
    const fivePct = tenPct / 2;
    const twoPct = tenPct / 5;
    shortcut = {
      name: "Block-Zerlegung",
      description: `${pctStr}% in 10%, 5%, 2% Blöcke zerlegen.`,
      steps: [
        `10% = ${bold(formatNumber(tenPct, true))}`,
        `5% = ${bold(formatNumber(fivePct, true))}`,
        `2% = ${bold(formatNumber(twoPct, true))}`,
        `${pctStr}% = ${bold(formatNumber(answer, true))}`
      ]
    };
  }
  
  return {
    id: ++taskCounter,
    type: "percentage",
    question: `${pctStr}% von ${scenario.baseStr}`,
    answer,
    shortcut,
    difficulty: 3,
  };
};

const generatePercentage = (difficulty: number): Task => {
  if (difficulty === 1) return generatePercentageL1();
  if (difficulty === 2) return generatePercentageL2();
  return generatePercentageL3();
};

// ============================================
// DIVISION GENERATORS BY LEVEL
// ============================================
const generateDivisionL1 = (): Task => {
  const scenarios = [
    { dividend: 1_200_000, divisor: 400, answer: 3000 },
    { dividend: 3_600_000, divisor: 600, answer: 6000 },
    { dividend: 4_800_000, divisor: 800, answer: 6000 },
    { dividend: 2_500_000, divisor: 500, answer: 5000 },
    { dividend: 8_000_000, divisor: 2000, answer: 4000 },
  ];

  const scenario = choice(scenarios);
  const useAbbrev = Math.random() > 0.5;
  
  const shortcut: ShortcutInfo = {
    name: "Kürzen & Verschieben",
    description: "Streiche gemeinsame Nullen auf beiden Seiten.",
    steps: [
      `Kürze Nullen: ${formatNumber(scenario.dividend, useAbbrev)} ÷ ${formatNumber(scenario.divisor)}`,
      `Ergebnis: ${bold(formatNumber(scenario.answer, useAbbrev))}`
    ]
  };
  
  return {
    id: ++taskCounter,
    type: "division",
    question: `${formatNumber(scenario.dividend, useAbbrev)} / ${formatNumber(scenario.divisor)}`,
    answer: scenario.answer,
    shortcut,
    difficulty: 1,
  };
};

const generateDivisionL2 = (): Task => {
  const scenarios = [
    { dividend: 450_000, divisor: 15, answer: 30000 },
    { dividend: 675_000, divisor: 25, answer: 27000 },
    { dividend: 840_000, divisor: 35, answer: 24000 },
    { dividend: 1_125_000, divisor: 45, answer: 25000 },
    { dividend: 550_000, divisor: 55, answer: 10000 },
  ];

  const scenario = choice(scenarios);
  const useAbbrev = Math.random() > 0.6;
  
  const shortcut: ShortcutInfo = {
    name: "Faktorzerlegung",
    description: `Zerlege ${scenario.divisor} in handlichere Faktoren.`,
    steps: [
      `${formatNumber(scenario.dividend, useAbbrev)} ÷ ${scenario.divisor}`,
      `Ergebnis: ${bold(formatNumber(scenario.answer, useAbbrev))}`
    ]
  };
  
  return {
    id: ++taskCounter,
    type: "division",
    question: `${formatNumber(scenario.dividend, useAbbrev)} / ${scenario.divisor}`,
    answer: scenario.answer,
    shortcut,
    difficulty: 2,
  };
};

const generateDivisionL3 = (): Task => {
  const scenarios = [
    { dividend: 330, divisor: 0.15, answer: 2200, divStr: "330", divisorStr: "0,15" },
    { dividend: 480, divisor: 0.04, answer: 12000, divStr: "480", divisorStr: "0,04" },
    { dividend: 750, divisor: 0.25, answer: 3000, divStr: "750", divisorStr: "0,25" },
    { dividend: 660, divisor: 0.12, answer: 5500, divStr: "660", divisorStr: "0,12" },
    { dividend: 840, divisor: 0.05, answer: 16800, divStr: "840", divisorStr: "0,05" },
  ];

  const scenario = choice(scenarios);
  
  let shortcut: ShortcutInfo;
  
  if (scenario.divisor === 0.25) {
    shortcut = {
      name: "Bruch-Umkehr (÷¼ = ×4)",
      description: "Durch 0,25 teilen = mit 4 multiplizieren.",
      steps: [
        `÷ 0,25 = × 4`,
        `${scenario.divStr} × 4 = ${bold(formatNumber(scenario.answer))}`
      ]
    };
  } else if (scenario.divisor === 0.05) {
    shortcut = {
      name: "Dezimal-Trick (÷0,05 = ×20)",
      description: "Durch 0,05 teilen = mit 20 multiplizieren.",
      steps: [
        `÷ 0,05 = × 20`,
        `${scenario.divStr} × 20 = ${bold(formatNumber(scenario.answer))}`
      ]
    };
  } else {
    const multiplier = 1 / scenario.divisor;
    shortcut = {
      name: "Kehrwert-Multiplikation",
      description: `Durch ${scenario.divisorStr} teilen = mit ${multiplier.toFixed(1).replace('.', ',')} multiplizieren.`,
      steps: [
        `÷ ${scenario.divisorStr} = × ${multiplier.toFixed(1).replace('.', ',')}`,
        `Ergebnis: ${bold(formatNumber(scenario.answer))}`
      ]
    };
  }
  
  return {
    id: ++taskCounter,
    type: "division",
    question: `${scenario.divStr} / ${scenario.divisorStr}`,
    answer: scenario.answer,
    shortcut,
    difficulty: 3,
  };
};

const generateDivision = (difficulty: number): Task => {
  if (difficulty === 1) return generateDivisionL1();
  if (difficulty === 2) return generateDivisionL2();
  return generateDivisionL3();
};

// ============================================
// ZEROS GENERATORS BY LEVEL
// ============================================
const generateZerosL1 = (): Task => {
  const scenarios = [
    { dividend: 8_000_000_000, divisor: 4000, answer: 2_000_000, divStr: "8 Mrd", divisorStr: "4k" },
    { dividend: 6_000_000_000, divisor: 3000, answer: 2_000_000, divStr: "6 Mrd", divisorStr: "3k" },
    { dividend: 4_000_000_000, divisor: 2000, answer: 2_000_000, divStr: "4 Mrd", divisorStr: "2k" },
    { dividend: 10_000_000_000, divisor: 5000, answer: 2_000_000, divStr: "10 Mrd", divisorStr: "5k" },
  ];

  const scenario = choice(scenarios);
  
  const shortcut: ShortcutInfo = {
    name: "Unit Game (Mrd / k = Mio)",
    description: "Mrd ÷ k = Mio. Rechne nur mit den Kernziffern.",
    steps: [
      `Regel: ${bold("Mrd / k = Mio")}`,
      `${scenario.divStr} ÷ ${scenario.divisorStr} = ${bold(formatNumber(scenario.answer, true))}`
    ]
  };
  
  return {
    id: ++taskCounter,
    type: "zeros",
    question: `${scenario.divStr} / ${scenario.divisorStr}`,
    answer: scenario.answer,
    shortcut,
    difficulty: 1,
  };
};

const generateZerosL2 = (): Task => {
  const scenarios = [
    { dividend: 1_500_000_000, divisor: 300_000, answer: 5000, divStr: "1,5 Mrd", divisorStr: "300k" },
    { dividend: 2_400_000_000, divisor: 600_000, answer: 4000, divStr: "2,4 Mrd", divisorStr: "600k" },
    { dividend: 900_000_000, divisor: 150_000, answer: 6000, divStr: "900 Mio", divisorStr: "150k" },
    { dividend: 750_000_000, divisor: 250_000, answer: 3000, divStr: "750 Mio", divisorStr: "250k" },
  ];

  const scenario = choice(scenarios);
  
  const shortcut: ShortcutInfo = {
    name: "Unit Game (Mio / k = k)",
    description: "Mio ÷ k = k. Bei krummen Zahlen: Erst Einheiten vereinfachen.",
    steps: [
      `Regel: ${bold("Mio / k = k")}`,
      `${scenario.divStr} ÷ ${scenario.divisorStr}`,
      `Ergebnis: ${bold(formatNumber(scenario.answer))}k`
    ]
  };
  
  return {
    id: ++taskCounter,
    type: "zeros",
    question: `${scenario.divStr} / ${scenario.divisorStr}`,
    answer: scenario.answer,
    shortcut,
    difficulty: 2,
  };
};

const generateZerosL3 = (): Task => {
  const scenarios = [
    { a: 1_250_000, b: 800, op: "×", answer: 1_000_000_000, aStr: "1,25 Mio", bStr: "800", ansStr: "1 Mrd" },
    { a: 3_500_000, b: 0.04, op: "×", answer: 140_000, aStr: "3,5 Mio", bStr: "0,04", ansStr: "140k" },
    { a: 2_700_000_000, b: 450_000, op: "/", answer: 6000, aStr: "2,7 Mrd", bStr: "450k", ansStr: "6k" },
    { a: 1_800_000, b: 1200, op: "×", answer: 2_160_000_000, aStr: "1,8 Mio", bStr: "1.200", ansStr: "2,16 Mrd" },
  ];

  const scenario = choice(scenarios);
  
  const shortcut: ShortcutInfo = {
    name: "Unit Game (gemischt)",
    description: "k × k = Mio, Mio × k = Mrd. Bei Dezimalen: Erst umrechnen.",
    steps: [
      `${scenario.aStr} ${scenario.op} ${scenario.bStr}`,
      `Ergebnis: ${bold(scenario.ansStr)}`
    ]
  };
  
  return {
    id: ++taskCounter,
    type: "zeros",
    question: `${scenario.aStr} ${scenario.op} ${scenario.bStr}`,
    answer: scenario.answer,
    shortcut,
    difficulty: 3,
  };
};

const generateZeros = (difficulty: number): Task => {
  if (difficulty === 1) return generateZerosL1();
  if (difficulty === 2) return generateZerosL2();
  return generateZerosL3();
};

// ============================================
// GROWTH GENERATORS BY LEVEL
// ============================================
const generateGrowthL1 = (): Task => {
  const bases = [100_000_000, 200_000_000, 500_000_000, 1_000_000_000];
  const rates = [10, 20, 50];

  const base = choice(bases);
  const rate = choice(rates);
  const growth = (base * rate) / 100;
  const answer = base + growth;
  
  const shortcut: ShortcutInfo = {
    name: "Block-Methode (einfach)",
    description: `${rate}% = 1/${100/rate}. Berechne, dann addiere.`,
    steps: [
      `${rate}% von ${formatNumber(base, true)} = ${bold(formatNumber(growth, true))}`,
      `${formatNumber(base, true)} + ${formatNumber(growth, true)} = ${bold(formatNumber(answer, true))}`
    ]
  };
  
  return {
    id: ++taskCounter,
    type: "growth",
    question: `${formatNumber(base, true)} + ${rate}%`,
    answer,
    shortcut,
    difficulty: 1,
  };
};

const generateGrowthL2 = (): Task => {
  const bases = [80_000_000, 150_000_000, 240_000_000, 450_000_000];
  const rates = [5, 15, 25, 40];

  const base = choice(bases);
  const rate = choice(rates);
  const growth = (base * rate) / 100;
  const answer = base + growth;
  
  let shortcut: ShortcutInfo;
  
  if (rate === 5) {
    shortcut = {
      name: "Block-Methode (5% = 10% ÷ 2)",
      description: "Berechne 10%, halbiere, dann addiere.",
      steps: [
        `10% = ${bold(formatNumber(base * 0.1, true))}`,
        `5% = ${bold(formatNumber(growth, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (rate === 15) {
    shortcut = {
      name: "Block-Methode (10% + 5%)",
      description: "15% = 10% + 5%. Beide berechnen, addieren.",
      steps: [
        `10% = ${bold(formatNumber(base * 0.1, true))}`,
        `5% = ${bold(formatNumber(base * 0.05, true))}`,
        `15% = ${bold(formatNumber(growth, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (rate === 25) {
    shortcut = {
      name: "Viertel-Trick",
      description: "25% = ¼. Durch 4 teilen, dann addieren.",
      steps: [
        `25% = ÷4 = ${bold(formatNumber(growth, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  } else {
    shortcut = {
      name: "Block-Methode (4 × 10%)",
      description: "40% = 4 × 10%. Berechne 10%, mal 4.",
      steps: [
        `10% = ${bold(formatNumber(base * 0.1, true))}`,
        `40% = ${bold(formatNumber(growth, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  }
  
  return {
    id: ++taskCounter,
    type: "growth",
    question: `${formatNumber(base, true)} + ${rate}%`,
    answer,
    shortcut,
    difficulty: 2,
  };
};

const generateGrowthL3 = (): Task => {
  const scenarios = [
    { base: 82_000_000, rate: 17, baseStr: "82 Mio" },
    { base: 64_000_000, rate: 12.5, baseStr: "64 Mio" },
    { base: 160_000_000, rate: 2.5, baseStr: "160 Mio" },
    { base: 88_000_000, rate: 22, baseStr: "88 Mio" },
    { base: 240_000_000, rate: 37.5, baseStr: "240 Mio" },
  ];

  const scenario = choice(scenarios);
  const growth = (scenario.base * scenario.rate) / 100;
  const answer = scenario.base + growth;
  const rateStr = scenario.rate.toString().replace('.', ',');
  
  let shortcut: ShortcutInfo;
  
  if (scenario.rate === 12.5) {
    shortcut = {
      name: "Bruch-Trick (⅛)",
      description: "12,5% = ⅛. Durch 8 teilen.",
      steps: [
        `12,5% = ⅛ = ${bold(formatNumber(growth, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (scenario.rate === 37.5) {
    shortcut = {
      name: "Bruch-Trick (⅜)",
      description: "37,5% = ⅜. Berechne ⅛, mal 3.",
      steps: [
        `⅛ = ${bold(formatNumber(scenario.base / 8, true))}`,
        `⅜ = ${bold(formatNumber(growth, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (scenario.rate === 2.5) {
    shortcut = {
      name: "Block-Methode (10% ÷ 4)",
      description: "2,5% = 10% ÷ 4.",
      steps: [
        `10% = ${bold(formatNumber(scenario.base * 0.1, true))}`,
        `2,5% = ${bold(formatNumber(growth, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  } else {
    // 17% or 22%
    const tenPct = scenario.base * 0.1;
    const fivePct = tenPct / 2;
    const twoPct = tenPct / 5;
    shortcut = {
      name: "Block-Zerlegung",
      description: `${rateStr}% in 10%, 5%, 2% zerlegen.`,
      steps: [
        `10% = ${bold(formatNumber(tenPct, true))}`,
        `5% = ${bold(formatNumber(fivePct, true))}`,
        `2% = ${bold(formatNumber(twoPct, true))}`,
        `${rateStr}% = ${bold(formatNumber(growth, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  }
  
  return {
    id: ++taskCounter,
    type: "growth",
    question: `${scenario.baseStr} + ${rateStr}%`,
    answer,
    shortcut,
    difficulty: 3,
  };
};

const generateGrowth = (difficulty: number): Task => {
  if (difficulty === 1) return generateGrowthL1();
  if (difficulty === 2) return generateGrowthL2();
  return generateGrowthL3();
};

// Main generator function
export const generateTask = (type: TaskType, difficulty: number = 1): Task => {
  const generators = {
    multiplication: generateMultiplication,
    percentage: generatePercentage,
    division: generateDivision,
    zeros: generateZeros,
    growth: generateGrowth,
  };

  if (type === "all") {
    const types = Object.keys(generators) as (keyof typeof generators)[];
    const randomType = choice(types);
    return generators[randomType](difficulty);
  }

  return generators[type](difficulty);
};

// Normalize user input to a float value
const normalizeInput = (input: string): number | null => {
  let cleaned = input
    .trim()
    .toLowerCase()
    .replace(/[€$]/g, "")
    .replace(/\s+/g, "")
    .replace(/eur|usd/gi, "");

  // Handle scientific notation (e.g., 2e6)
  if (/^-?[\d.,]+e\d+$/i.test(cleaned)) {
    const normalized = cleaned.replace(",", ".");
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? null : parsed;
  }

  // Detect and apply unit multipliers (case insensitive)
  const unitPatterns: [RegExp, number][] = [
    [/(bio|trillion|t)$/, 1_000_000_000_000],
    [/(mrd|milliarden?|bn?|b)$/, 1_000_000_000],
    [/(mio|mill(?:ionen?)?|million(?:en)?|m)$/, 1_000_000],
    [/(k|tsd|tausend)$/, 1_000],
  ];

  let multiplier = 1;
  for (const [pattern, mult] of unitPatterns) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, "");
      multiplier = mult;
      break;
    }
  }

  // Handle percentage sign
  const isPercent = cleaned.includes("%");
  cleaned = cleaned.replace(/%/g, "");

  // Parse number with German/English format detection
  // German: 1.000,50 (dot = thousand, comma = decimal)
  // English: 1,000.50 (comma = thousand, dot = decimal)
  
  let numericValue: number;
  
  // Count dots and commas
  const dots = (cleaned.match(/\./g) || []).length;
  const commas = (cleaned.match(/,/g) || []).length;
  
  if (dots === 0 && commas === 0) {
    // No separators
    numericValue = parseFloat(cleaned);
  } else if (dots === 0 && commas === 1) {
    // Single comma - likely German decimal (1,5) 
    numericValue = parseFloat(cleaned.replace(",", "."));
  } else if (dots === 1 && commas === 0) {
    // Single dot - could be decimal (1.5) or thousand (1.000)
    // Check position: if 3 digits after dot, it's likely thousand separator
    const afterDot = cleaned.split(".")[1];
    if (afterDot && afterDot.length === 3 && /^\d+$/.test(afterDot)) {
      // Likely thousand separator (German style)
      numericValue = parseFloat(cleaned.replace(".", ""));
    } else {
      // Decimal point
      numericValue = parseFloat(cleaned);
    }
  } else if (dots >= 1 && commas === 1) {
    // German format: 1.000.000,50
    numericValue = parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
  } else if (commas >= 1 && dots === 1) {
    // English format: 1,000,000.50
    numericValue = parseFloat(cleaned.replace(/,/g, ""));
  } else if (commas > 1 && dots === 0) {
    // Multiple commas, no dots - English thousand separators
    numericValue = parseFloat(cleaned.replace(/,/g, ""));
  } else if (dots > 1 && commas === 0) {
    // Multiple dots, no commas - German thousand separators
    numericValue = parseFloat(cleaned.replace(/\./g, ""));
  } else {
    // Ambiguous - try German format first
    numericValue = parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
  }
  
  if (isNaN(numericValue)) return null;
  
  // Apply multiplier
  numericValue *= multiplier;
  
  // Handle percentage as decimal (0.035 for 3.5%)
  if (isPercent) {
    // Already correct, user entered with %
  }
  
  return numericValue;
};

// Check if answer is correct (with tolerance for rounding)
export const checkAnswer = (userAnswer: number | string, correctAnswer: number, isPercentageResult: boolean = false): boolean => {
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
    // User might have entered decimal form of percentage
    normalizedUserAnswer *= 100;
  }
  
  // Check with epsilon tolerance (0.01%)
  const epsilon = Math.abs(correctAnswer) * 0.0001;
  const tolerance = Math.max(epsilon, 0.01); // At least 0.01 absolute tolerance
  
  return Math.abs(normalizedUserAnswer - correctAnswer) <= tolerance;
};

// Export normalizeInput for external use
export { normalizeInput };

// Generate error hint
export const generateErrorHint = (userAnswer: number | string, correctAnswer: number): string => {
  let normalizedUserAnswer: number;
  
  if (typeof userAnswer === "string") {
    const normalized = normalizeInput(userAnswer);
    if (normalized === null) return "Konnte die Eingabe nicht als Zahl interpretieren.";
    normalizedUserAnswer = normalized;
  } else {
    normalizedUserAnswer = userAnswer;
  }
  
  const ratio = normalizedUserAnswer / correctAnswer;
  
  if (Math.abs(ratio - 10) < 0.1) return "Eine Null zu viel! Überprüfe die Größenordnung.";
  if (Math.abs(ratio - 0.1) < 0.01) return "Eine Null zu wenig! Überprüfe die Größenordnung.";
  if (Math.abs(ratio - 100) < 1) return "Zwei Nullen zu viel! Nutze das Unit Game.";
  if (Math.abs(ratio - 0.01) < 0.001) return "Zwei Nullen zu wenig! Nutze das Unit Game.";
  if (Math.abs(ratio - 1000) < 10) return "Drei Nullen zu viel! k · k = M, nicht Mrd.";
  if (Math.abs(ratio - 0.001) < 0.0001) return "Drei Nullen zu wenig! M / k = k.";
  
  return "Überprüfe deinen Rechenweg Schritt für Schritt.";
};
