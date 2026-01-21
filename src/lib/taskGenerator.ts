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
// LEVEL 3: Decimal Precision (Schwer)
// ============================================
const generateMultiplicationL3 = (): Task => {
  const scenarios = [
    { base: 1_250_000_000, mult: 0.04, baseStr: "1,25 Mrd" },
    { base: 800_000_000, mult: 0.125, baseStr: "800 Mio" },
    { base: 2_400_000, mult: 2.5, baseStr: "2,4 Mio" },
    { base: 1_500_000, mult: 1.25, baseStr: "1,5 Mio" },
    { base: 3_200_000, mult: 0.75, baseStr: "3,2 Mio" },
    { base: 17_000_000, mult: 2.3, baseStr: "17 Mio" },
    { base: 820_000, mult: 0.15, baseStr: "820k" },
  ];

  const scenario = choice(scenarios);
  const answer = scenario.base * scenario.mult;
  const multStr = scenario.mult.toString().replace('.', ',');
  
  let shortcut: ShortcutInfo;
  
  if (scenario.mult === 0.04) {
    shortcut = {
      name: "Prozent-Umwandlung",
      description: "0,04 = 4% = 4/100. Teile durch 100, multipliziere mit 4.",
      steps: [
        `${bold("0,04")} = 4%`,
        `${scenario.baseStr} ÷ 100 = ${bold(formatNumber(scenario.base / 100, true))}`,
        `× 4 = ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (scenario.mult === 0.125) {
    shortcut = {
      name: "Bruch-Trick (⅛)",
      description: "0,125 = ⅛. Teile einfach durch 8.",
      steps: [
        `${bold("0,125")} = ⅛`,
        `${scenario.baseStr} ÷ 8 = ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (scenario.mult === 1.25) {
    shortcut = {
      name: "Prozent-Trick (125%)",
      description: "1,25 = 100% + 25%. Basis + ein Viertel.",
      steps: [
        `100%: ${bold(scenario.baseStr)}`,
        `25% (÷4): ${bold(formatNumber(scenario.base / 4, true))}`,
        `Summe: ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (scenario.mult === 0.75) {
    shortcut = {
      name: "Komplement-Trick (75%)",
      description: "0,75 = ¾ = 1 - ¼. Basis minus ein Viertel.",
      steps: [
        `100%: ${bold(scenario.baseStr)}`,
        `25% (÷4): ${bold(formatNumber(scenario.base / 4, true))}`,
        `75% = 100% - 25% = ${bold(formatNumber(answer, true))}`
      ]
    };
  } else {
    const wholePart = Math.floor(scenario.mult);
    const decimalPart = scenario.mult - wholePart;
    shortcut = {
      name: "Distributivgesetz",
      description: "Zerlege Dezimalzahlen in ganze Teile + Dezimalteil.",
      steps: [
        `Zerlege ${bold(multStr)} in ${wholePart} + ${decimalPart.toFixed(2).replace('.', ',')}`,
        `${scenario.baseStr} × ${wholePart} = ${bold(formatNumber(scenario.base * wholePart, true))}`,
        `${scenario.baseStr} × ${decimalPart.toFixed(2).replace('.', ',')} = ${bold(formatNumber(scenario.base * decimalPart, true))}`,
        `Summe: ${bold(formatNumber(answer, true))}`
      ]
    };
  }
  
  return {
    id: ++taskCounter,
    type: "multiplication",
    question: `${scenario.baseStr} × ${multStr}`,
    answer,
    shortcut,
    difficulty: 3,
  };
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
