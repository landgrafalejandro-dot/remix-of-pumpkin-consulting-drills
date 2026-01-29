import { CaseMathTask, CaseMathCategory, CaseMathShortcut } from "@/types/caseMath";

let taskCounter = 0;

// Session-based task history to prevent repetition
const sessionCaseMathHistory: Set<string> = new Set();

export const resetCaseMathHistory = () => {
  sessionCaseMathHistory.clear();
};

const addToHistory = (key: string) => {
  sessionCaseMathHistory.add(key);
};

const isInHistory = (key: string): boolean => sessionCaseMathHistory.has(key);

// Helper functions
const choice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const formatNumber = (num: number): string => {
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
  return num.toLocaleString('de-DE');
};

const formatCurrency = (num: number): string => {
  return `€${formatNumber(num)}`;
};

const formatPercent = (num: number): string => {
  return `${num}%`;
};

// ============================================
// PROFITABILITY TASKS
// ============================================
const generateProfitabilityL1 = (): CaseMathTask | null => {
  const scenarios = [
    { 
      type: "revenue",
      price: 100, volume: 5000,
      question: "Ein Produkt kostet **€100** pro Stück. Das Unternehmen verkauft **5.000 Einheiten**. Wie hoch ist der Umsatz?",
      answer: 500_000,
      formula: "Umsatz = Preis × Menge",
    },
    { 
      type: "revenue",
      price: 50, volume: 20000,
      question: "Bei einem Preis von **€50** und einem Absatz von **20.000 Stück** – wie hoch ist der Umsatz?",
      answer: 1_000_000,
      formula: "Umsatz = Preis × Menge",
    },
    { 
      type: "profit",
      revenue: 800_000, cost: 600_000,
      question: "Umsatz: **€800k**. Kosten: **€600k**. Wie hoch ist der Gewinn?",
      answer: 200_000,
      formula: "Gewinn = Umsatz − Kosten",
    },
    { 
      type: "profit",
      revenue: 1_500_000, cost: 1_200_000,
      question: "Das Unternehmen erzielt **€1,5 Mio** Umsatz bei **€1,2 Mio** Kosten. Was ist der Gewinn?",
      answer: 300_000,
      formula: "Gewinn = Umsatz − Kosten",
    },
    { 
      type: "cost",
      fixed: 200_000, variable: 300_000,
      question: "Fixkosten: **€200k**. Variable Kosten: **€300k**. Wie hoch sind die Gesamtkosten?",
      answer: 500_000,
      formula: "Kosten = Fixkosten + Variable Kosten",
    },
  ];

  const scenario = choice(scenarios);
  const key = `prof-L1:${scenario.question.slice(0, 30)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);

  return {
    id: ++taskCounter,
    category: "profitability",
    question: scenario.question,
    highlightedQuestion: scenario.question,
    answer: scenario.answer,
    shortcut: {
      name: "Basis-Formel",
      formula: scenario.formula,
      tip: "Merke dir die Grundformeln: Umsatz = P×M, Gewinn = U−K, Kosten = Fix + Var",
    },
    difficulty: 1,
  };
};

const generateProfitabilityL2 = (): CaseMathTask | null => {
  const scenarios = [
    { 
      question: "Umsatz: **€2 Mio**. Gewinnmarge: **20%**. Wie hoch ist der Gewinn?",
      answer: 400_000,
      formula: "Gewinn = Umsatz × Marge",
      tip: "Nutze den Block-Trick: 20% = 10% × 2. 10% von 2 Mio = 200k, also 400k.",
    },
    { 
      question: "Bei **€500k** Umsatz und **€125k** Gewinn – wie hoch ist die Gewinnmarge?",
      answer: 25,
      formula: "Marge = Gewinn / Umsatz",
      tip: "125k / 500k = 1/4 = 25%. Suche Brüche!",
    },
    { 
      question: "Preis: **€80**. Variable Kosten pro Stück: **€50**. Fixkosten: **€150k**. Absatz: **10.000**. Gewinn?",
      answer: 150_000,
      formula: "Gewinn = (Preis − VK) × Menge − Fixkosten",
      tip: "Deckungsbeitrag = 80−50 = 30€. 30 × 10k = 300k. Minus 150k Fix = 150k Gewinn.",
    },
    { 
      question: "Kosten: **€800k**. Marge: **25%**. Bei welchem Umsatz wird dieser erreicht?",
      answer: 1_066_667,
      formula: "Umsatz = Kosten / (1 − Marge)",
      tip: "Bei 25% Marge sind 75% des Umsatzes Kosten. 800k / 0,75 ≈ 1,07 Mio.",
    },
  ];

  const scenario = choice(scenarios);
  const key = `prof-L2:${scenario.question.slice(0, 30)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);

  return {
    id: ++taskCounter,
    category: "profitability",
    question: scenario.question,
    highlightedQuestion: scenario.question,
    answer: scenario.answer,
    shortcut: {
      name: "Marge-Rechnung",
      formula: scenario.formula,
      tip: scenario.tip,
    },
    difficulty: 2,
  };
};

const generateProfitabilityL3 = (): CaseMathTask | null => {
  const scenarios = [
    { 
      question: "Ein Retailer erzielt **€4,2 Mio** Umsatz. Rohertrag: **35%**. Betriebskosten: **€1,1 Mio**. EBIT?",
      answer: 370_000,
      formula: "EBIT = Umsatz × Rohertrag − Betriebskosten",
      tip: "35% von 4,2 Mio = 1,47 Mio. Minus 1,1 Mio = 370k EBIT.",
    },
    { 
      question: "Fixkosten: **€40 Mio**. Variable Kosten: **€1,90** pro Stück. Preis: **€2,00**. Break-even Menge?",
      answer: 400_000_000,
      formula: "Break-even = Fixkosten / (Preis − VK)",
      tip: "Deckungsbeitrag = 10 Cent. 40 Mio / 0,10 = 400 Mio Stück.",
    },
    { 
      question: "Unternehmen A: Marge **18%**, Umsatz **€5 Mio**. Unternehmen B: Marge **12%**, Umsatz **€8 Mio**. Gewinn-Differenz?",
      answer: -60_000,
      formula: "Gewinn = Umsatz × Marge",
      tip: "A: 900k. B: 960k. Differenz A−B = −60k (B ist profitabler).",
    },
  ];

  const scenario = choice(scenarios);
  const key = `prof-L3:${scenario.question.slice(0, 30)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);

  return {
    id: ++taskCounter,
    category: "profitability",
    question: scenario.question,
    highlightedQuestion: scenario.question,
    answer: scenario.answer,
    shortcut: {
      name: "Multi-Step Analyse",
      formula: scenario.formula,
      tip: scenario.tip,
    },
    difficulty: 3,
  };
};

// ============================================
// INVESTMENT / ROI TASKS
// ============================================
const generateInvestmentL1 = (): CaseMathTask | null => {
  const scenarios = [
    { 
      question: "Investition: **€100k**. Jährlicher Gewinn: **€25k**. Payback-Zeit in Jahren?",
      answer: 4,
      formula: "Payback = Investition / Jahresgewinn",
      tip: "100k / 25k = 4 Jahre. Einfache Division.",
    },
    { 
      question: "Investition: **€500k**. ROI: **20%**. Jahresgewinn?",
      answer: 100_000,
      formula: "Jahresgewinn = Investition × ROI",
      tip: "20% von 500k = 100k. Nutze den 10%-Block.",
    },
    { 
      question: "Jahresgewinn: **€80k**. Investition: **€400k**. ROI?",
      answer: 20,
      formula: "ROI = Jahresgewinn / Investition",
      tip: "80k / 400k = 1/5 = 20%.",
    },
  ];

  const scenario = choice(scenarios);
  const key = `inv-L1:${scenario.question.slice(0, 30)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);

  return {
    id: ++taskCounter,
    category: "investment",
    question: scenario.question,
    highlightedQuestion: scenario.question,
    answer: scenario.answer,
    shortcut: {
      name: "Investitions-Grundlagen",
      formula: scenario.formula,
      tip: scenario.tip,
    },
    difficulty: 1,
  };
};

const generateInvestmentL2 = (): CaseMathTask | null => {
  const scenarios = [
    { 
      question: "Investition: **€1,2 Mio**. Jahr 1-3: **€300k** Gewinn. Jahr 4-5: **€450k** Gewinn. Gesamt-Rückfluss?",
      answer: 1_800_000,
      formula: "Rückfluss = Σ(Jahresgewinne)",
      tip: "3×300k + 2×450k = 900k + 900k = 1,8 Mio.",
    },
    { 
      question: "Neuer Standort: Investition **€800k**. Jährliche Kosten **€200k**. Jährlicher Umsatz **€500k**. Payback?",
      answer: 2.67,
      formula: "Payback = Investition / (Umsatz − Kosten)",
      tip: "Jährlicher Nettoertrag = 300k. 800k / 300k ≈ 2,7 Jahre.",
    },
    { 
      question: "Zwei Projekte: A) €500k Investment, 15% ROI. B) €800k Investment, 12% ROI. Welches bringt mehr Gewinn?",
      answer: 96_000,
      formula: "Gewinn = Investment × ROI",
      tip: "A: 75k. B: 96k. B bringt 21k mehr (Antwort: 96k als B-Gewinn).",
    },
  ];

  const scenario = choice(scenarios);
  const key = `inv-L2:${scenario.question.slice(0, 30)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);

  return {
    id: ++taskCounter,
    category: "investment",
    question: scenario.question,
    highlightedQuestion: scenario.question,
    answer: scenario.answer,
    shortcut: {
      name: "Investment-Analyse",
      formula: scenario.formula,
      tip: scenario.tip,
    },
    difficulty: 2,
  };
};

const generateInvestmentL3 = (): CaseMathTask | null => {
  const scenarios = [
    { 
      question: "M&A: Kaufpreis **€50 Mio**. Synergien: **€8 Mio**/Jahr. Ziel-Payback: **5 Jahre**. Max. Kaufpreis?",
      answer: 40_000_000,
      formula: "Max. Kaufpreis = Synergien × Payback",
      tip: "8 Mio × 5 = 40 Mio. Der aktuelle Preis ist 10 Mio zu hoch!",
    },
    { 
      question: "Investment: **€2,5 Mio**. Jahr 1: **€400k**, Jahr 2: **€600k**, danach **€800k**/Jahr. Payback-Periode?",
      answer: 3.875,
      formula: "Kumulative Rückflüsse berechnen",
      tip: "Nach J2: 1 Mio. Restbetrag: 1,5 Mio. Bei 800k/Jahr: 1,875 Jahre mehr. Total: 3,875 Jahre.",
    },
  ];

  const scenario = choice(scenarios);
  const key = `inv-L3:${scenario.question.slice(0, 30)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);

  return {
    id: ++taskCounter,
    category: "investment",
    question: scenario.question,
    highlightedQuestion: scenario.question,
    answer: scenario.answer,
    shortcut: {
      name: "Advanced Investment",
      formula: scenario.formula,
      tip: scenario.tip,
    },
    difficulty: 3,
  };
};

// ============================================
// BREAKEVEN TASKS
// ============================================
const generateBreakevenL1 = (): CaseMathTask | null => {
  const scenarios = [
    { 
      question: "Fixkosten: **€100k**. Preis: **€50**. Variable Kosten: **€30**. Break-even Menge?",
      answer: 5000,
      formula: "Break-even = Fixkosten / (Preis − VK)",
      tip: "Deckungsbeitrag = 20€. 100k / 20 = 5.000 Stück.",
    },
    { 
      question: "Fixkosten: **€200k**. Deckungsbeitrag: **€40**/Stück. Break-even?",
      answer: 5000,
      formula: "Break-even = Fixkosten / DB",
      tip: "200k / 40 = 5.000 Stück. Einfache Division.",
    },
    { 
      question: "Preis: **€100**. Variable Kosten: **€60**. Fixkosten: **€80k**. Break-even Menge?",
      answer: 2000,
      formula: "Break-even = Fixkosten / (P − VK)",
      tip: "DB = 40€. 80k / 40 = 2.000 Stück.",
    },
  ];

  const scenario = choice(scenarios);
  const key = `be-L1:${scenario.question.slice(0, 30)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);

  return {
    id: ++taskCounter,
    category: "breakeven",
    question: scenario.question,
    highlightedQuestion: scenario.question,
    answer: scenario.answer,
    shortcut: {
      name: "Break-even Basics",
      formula: scenario.formula,
      tip: scenario.tip,
    },
    difficulty: 1,
  };
};

const generateBreakevenL2 = (): CaseMathTask | null => {
  const scenarios = [
    { 
      question: "Fixkosten: **€500k**. Marge: **25%**. Welcher Umsatz für Break-even?",
      answer: 2_000_000,
      formula: "Break-even Umsatz = Fixkosten / Marge",
      tip: "500k / 0,25 = 2 Mio Umsatz nötig.",
    },
    { 
      question: "Aktuell: **8.000** Einheiten. Fixkosten steigen um **€60k**. DB: **€30**/Stück. Neue Break-even Menge?",
      answer: 2000,
      formula: "Zusätzliche Menge = ΔFixkosten / DB",
      tip: "60k / 30 = 2.000 zusätzliche Einheiten nötig.",
    },
    { 
      question: "Preis: **€25**. VK: **€15**. Fix: **€200k**. Zielgewinn: **€100k**. Benötigte Menge?",
      answer: 30_000,
      formula: "Menge = (Fixkosten + Zielgewinn) / DB",
      tip: "DB = 10€. (200k + 100k) / 10 = 30.000 Stück.",
    },
  ];

  const scenario = choice(scenarios);
  const key = `be-L2:${scenario.question.slice(0, 30)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);

  return {
    id: ++taskCounter,
    category: "breakeven",
    question: scenario.question,
    highlightedQuestion: scenario.question,
    answer: scenario.answer,
    shortcut: {
      name: "Break-even Analyse",
      formula: scenario.formula,
      tip: scenario.tip,
    },
    difficulty: 2,
  };
};

const generateBreakevenL3 = (): CaseMathTask | null => {
  const scenarios = [
    { 
      question: "Fixkosten: **€40 Mio**. Preis: **€2,00**. Variable Kosten: **€1,90**. Break-even Menge?",
      answer: 400_000_000,
      formula: "Break-even = Fixkosten / (P − VK)",
      tip: "DB = 10 Cent. 40 Mio / 0,10 = 400 Mio Stück. Achte auf die Einheiten!",
    },
    { 
      question: "Zwei Produkte: A) Fix **€120k**, DB **€30**. B) Fix **€80k**, DB **€20**. Kombinations-Break-even bei 60% A, 40% B Anteil?",
      answer: 7692,
      formula: "Gewichteter DB = 0,6×30 + 0,4×20",
      tip: "Gewichteter DB = 26€. Gesamt-Fix = 200k. 200k / 26 ≈ 7.692 Stück.",
    },
  ];

  const scenario = choice(scenarios);
  const key = `be-L3:${scenario.question.slice(0, 30)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);

  return {
    id: ++taskCounter,
    category: "breakeven",
    question: scenario.question,
    highlightedQuestion: scenario.question,
    answer: scenario.answer,
    shortcut: {
      name: "Break-even Advanced",
      formula: scenario.formula,
      tip: scenario.tip,
    },
    difficulty: 3,
  };
};

// ============================================
// MARKET SIZING TASKS
// ============================================
const generateMarketSizingL1 = (): CaseMathTask | null => {
  const scenarios = [
    { 
      question: "Gesamtmarkt: **€1 Mrd**. Marktanteil: **5%**. Dein Umsatz?",
      answer: 50_000_000,
      formula: "Umsatz = Markt × Marktanteil",
      tip: "5% von 1 Mrd = 50 Mio. 10% = 100 Mio, halbieren.",
    },
    { 
      question: "Bevölkerung: **80 Mio**. Zielgruppe: **25%**. Kaufrate: **10%**. Potenzielle Kunden?",
      answer: 2_000_000,
      formula: "Kunden = Bevölkerung × Zielgruppe × Kaufrate",
      tip: "80 Mio × 0,25 = 20 Mio. × 0,1 = 2 Mio.",
    },
    { 
      question: "**10.000** Kunden. Durchschnittsbon: **€200**. Jahresumsatz?",
      answer: 2_000_000,
      formula: "Umsatz = Kunden × Durchschnittsbon",
      tip: "10k × 200 = 2 Mio. Nullen-Trick!",
    },
  ];

  const scenario = choice(scenarios);
  const key = `ms-L1:${scenario.question.slice(0, 30)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);

  return {
    id: ++taskCounter,
    category: "market-sizing",
    question: scenario.question,
    highlightedQuestion: scenario.question,
    answer: scenario.answer,
    shortcut: {
      name: "Market Sizing Basics",
      formula: scenario.formula,
      tip: scenario.tip,
    },
    difficulty: 1,
  };
};

const generateMarketSizingL2 = (): CaseMathTask | null => {
  const scenarios = [
    { 
      question: "Stadt: **500k** Einwohner. **40%** trinken Kaffee täglich. **€3** pro Kaffee. Tagesumsatz Kaffee?",
      answer: 600_000,
      formula: "Umsatz = Bevölkerung × Rate × Preis",
      tip: "500k × 0,4 = 200k Kaffeetrinker. 200k × 3 = 600k.",
    },
    { 
      question: "Markt wächst **7%**/Jahr. Heute: **€500 Mio**. Größe in 5 Jahren? (Nutze Schätzung)",
      answer: 700_000_000,
      formula: "Zukunft ≈ Heute × (1 + Rate × Jahre)",
      tip: "Grobe Schätzung: 7% × 5 = 35%. 500 Mio × 1,35 ≈ 675-700 Mio.",
    },
    { 
      question: "Markt A: **€2 Mrd**, Wachstum **3%**. Markt B: **€800 Mio**, Wachstum **15%**. Welcher ist in 3 Jahren größer?",
      answer: 2_180_000_000,
      formula: "Zukunft ≈ Heute × (1 + Rate × Jahre)",
      tip: "A: 2 Mrd × 1,09 ≈ 2,18 Mrd. B: 800 Mio × 1,45 ≈ 1,16 Mrd. A bleibt größer.",
    },
  ];

  const scenario = choice(scenarios);
  const key = `ms-L2:${scenario.question.slice(0, 30)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);

  return {
    id: ++taskCounter,
    category: "market-sizing",
    question: scenario.question,
    highlightedQuestion: scenario.question,
    answer: scenario.answer,
    shortcut: {
      name: "Market Sizing Analysis",
      formula: scenario.formula,
      tip: scenario.tip,
    },
    difficulty: 2,
  };
};

const generateMarketSizingL3 = (): CaseMathTask | null => {
  const scenarios = [
    { 
      question: "Deutschland: **80 Mio** Einwohner. **50%** über 40. Davon **8%** haben Diabetes. Davon **60%** brauchen Medikamente. Patienten?",
      answer: 1_920_000,
      formula: "Patienten = Bevölkerung × Segmente × Raten",
      tip: "80 Mio × 0,5 × 0,08 × 0,6 = 80 × 0,024 Mio = 1,92 Mio.",
    },
    { 
      question: "Ride-Sharing Markt: **20 Mio** Fahrten/Tag. **€12** Schnitt. Unser Marktanteil: **8%**. Jahresumsatz?",
      answer: 7_008_000_000,
      formula: "Umsatz = Fahrten × Preis × Anteil × 365",
      tip: "20 Mio × 12 × 0,08 = 19,2 Mio/Tag. × 365 ≈ 7 Mrd.",
    },
  ];

  const scenario = choice(scenarios);
  const key = `ms-L3:${scenario.question.slice(0, 30)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);

  return {
    id: ++taskCounter,
    category: "market-sizing",
    question: scenario.question,
    highlightedQuestion: scenario.question,
    answer: scenario.answer,
    shortcut: {
      name: "Market Sizing Advanced",
      formula: scenario.formula,
      tip: scenario.tip,
    },
    difficulty: 3,
  };
};

// ============================================
// MAIN GENERATORS
// ============================================
const generators: Record<CaseMathCategory, Record<number, () => CaseMathTask | null>> = {
  profitability: { 1: generateProfitabilityL1, 2: generateProfitabilityL2, 3: generateProfitabilityL3 },
  investment: { 1: generateInvestmentL1, 2: generateInvestmentL2, 3: generateInvestmentL3 },
  breakeven: { 1: generateBreakevenL1, 2: generateBreakevenL2, 3: generateBreakevenL3 },
  "market-sizing": { 1: generateMarketSizingL1, 2: generateMarketSizingL2, 3: generateMarketSizingL3 },
};

export const generateCaseMathTask = (
  categories: CaseMathCategory[],
  difficulty: number
): CaseMathTask => {
  const maxAttempts = 50;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const category = choice(categories);
    const generator = generators[category][difficulty];
    
    if (generator) {
      const task = generator();
      if (task) return task;
    }
  }
  
  // Fallback: clear history and try again
  sessionCaseMathHistory.clear();
  const category = choice(categories);
  const task = generators[category][difficulty]();
  if (task) return task;
  
  // Ultimate fallback
  return {
    id: ++taskCounter,
    category: "profitability",
    question: "Umsatz: **€1 Mio**. Marge: **10%**. Gewinn?",
    highlightedQuestion: "Umsatz: **€1 Mio**. Marge: **10%**. Gewinn?",
    answer: 100_000,
    shortcut: {
      name: "Basis-Formel",
      formula: "Gewinn = Umsatz × Marge",
      tip: "10% von 1 Mio = 100k.",
    },
    difficulty,
  };
};

// Reuse normalizeInput from taskGenerator
export { normalizeInput, checkAnswer } from "./taskGenerator";
