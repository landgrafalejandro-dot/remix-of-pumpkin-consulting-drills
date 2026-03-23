import { CaseMathTask, CaseMathCategory } from "@/types/caseMath";

/**
 * Procedural generator for Case Math drill tasks.
 * Generates unlimited unique business-scenario math problems
 * with guaranteed correct answers.
 */

let taskCounter = 40000;
const sessionHistory = new Set<string>();

const choice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const fmt = (n: number): string => {
  if (Math.abs(n) >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `${v % 1 === 0 ? v : v.toFixed(1).replace(".", ",")} Mrd`;
  }
  if (Math.abs(n) >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v % 1 === 0 ? v : v.toFixed(1).replace(".", ",")} Mio`;
  }
  if (Math.abs(n) >= 10_000) {
    const v = n / 1_000;
    return `${v % 1 === 0 ? v : v.toFixed(1).replace(".", ",")}k`;
  }
  return n.toLocaleString("de-DE");
};

const fmtEur = (n: number): string => `${fmt(n)} €`;

// ============================================
// INDUSTRIES & CONTEXTS
// ============================================
const industries = [
  "Onlineshop", "SaaS-Unternehmen", "Restaurant", "Fitness-Studio",
  "Logistikunternehmen", "Beratungsfirma", "E-Commerce-Unternehmen",
  "Pharma-Unternehmen", "Einzelhändler", "Automobilzulieferer",
  "Telekommunikationsanbieter", "Versicherungsunternehmen", "Medienunternehmen",
  "Lebensmittelhersteller", "Modehändler", "Reiseveranstalter",
  "Immobilienunternehmen", "Start-up", "Maschinenbauer", "Energieversorger",
];

// ============================================
// PROFITABILITY TEMPLATES
// ============================================

type TemplateGen = (diff: number) => { question: string; answer: number; tolerance: number; tip: string };

const profitabilityTemplates: TemplateGen[] = [
  // Simple: Revenue - Costs
  (diff) => {
    const revs = diff === 1 ? [1, 2, 5, 10, 20] : diff === 2 ? [3, 5, 8, 12, 15] : [7.5, 12.5, 18, 35];
    const rev = choice(revs) * 1_000_000;
    const costPct = diff === 1 ? choice([50, 60, 70, 80]) : diff === 2 ? choice([60, 65, 70, 75]) : choice([62, 68, 73, 78]);
    const cost = rev * costPct / 100;
    const answer = rev - cost;
    const ind = choice(industries);
    return {
      question: `Ein ${ind} hat einen Umsatz von **${fmtEur(rev)}** und Kosten von **${fmtEur(cost)}**. Wie hoch ist der Gewinn?`,
      answer, tolerance: answer * 0.005, tip: "Gewinn = Umsatz − Kosten",
    };
  },
  // Margin-based
  (diff) => {
    const rev = diff === 1 ? choice([500_000, 1_000_000, 2_000_000, 5_000_000])
      : diff === 2 ? choice([1_000_000, 2_000_000, 3_000_000, 5_000_000])
      : choice([1_500_000, 3_500_000, 6_000_000]);
    const margin = diff === 1 ? choice([10, 20, 25, 50]) : diff === 2 ? choice([10, 15, 20, 25]) : choice([12, 18, 22, 35]);
    const answer = rev * margin / 100;
    const ind = choice(industries);
    return {
      question: `Ein ${ind} hat einen Umsatz von **${fmtEur(rev)}**. Die Gewinnmarge beträgt **${margin}%**. Wie hoch ist der Gewinn?`,
      answer, tolerance: answer * 0.005, tip: "Gewinn = Umsatz × Marge",
    };
  },
  // Multi-segment (medium/hard)
  (diff) => {
    if (diff === 1) {
      const rev = choice([2, 4, 5, 10]) * 1_000_000;
      const cogs = choice([40, 50, 60]) / 100;
      const opex = choice([1, 2]) * 1_000_000;
      const answer = rev * (1 - cogs) - opex;
      return {
        question: `Umsatz **${fmtEur(rev)}**, Herstellkosten **${cogs * 100}%** vom Umsatz, operative Kosten **${fmtEur(opex)}**. Wie hoch ist der operative Gewinn?`,
        answer, tolerance: answer * 0.005, tip: "Operativer Gewinn = Umsatz × (1 − Herstellkosten%) − OpEx",
      };
    }
    const segments = diff === 2 ? 2 : 3;
    const names = ["A", "B", "C"];
    let total = 0;
    const parts: string[] = [];
    for (let i = 0; i < segments; i++) {
      const rev = choice(diff === 2 ? [5, 10, 15, 20] : [5, 8, 10, 12, 15]) * 1_000_000;
      const margin = choice(diff === 2 ? [10, 15, 20, 25] : [10, 15, 20, 25, -5, -10]);
      total += rev * margin / 100;
      parts.push(`${names[i]} (Umsatz **${fmtEur(rev)}**, Marge **${margin}%**)`);
    }
    const overhead = choice([1, 2, 3]) * 1_000_000;
    total -= overhead;
    return {
      question: `Ein Unternehmen hat **${segments} Bereiche**: ${parts.join(", ")}. Overhead: **${fmtEur(overhead)}**. Wie hoch ist der Gesamtgewinn?`,
      answer: total, tolerance: Math.abs(total) * 0.01, tip: "Gewinn je Bereich = Umsatz × Marge, dann alle addieren − Overhead",
    };
  },
  // Customers x Price
  (diff) => {
    const customers = diff === 1 ? choice([100, 200, 500, 1000]) : diff === 2 ? choice([500, 1000, 2000, 5000]) : choice([3000, 5000, 8000]);
    const price = diff === 1 ? choice([50, 100, 200, 500]) : diff === 2 ? choice([80, 120, 200, 300]) : choice([150, 250, 480]);
    const costPct = diff === 1 ? choice([50, 60, 70]) : diff === 2 ? choice([55, 65, 75]) : choice([60, 68, 72]);
    const revenue = customers * price;
    const answer = revenue * (1 - costPct / 100);
    const ind = choice(industries);
    return {
      question: `Ein ${ind} hat **${fmt(customers)} Kunden**, die je **${fmtEur(price)} pro Jahr** zahlen. Die Kosten betragen **${costPct}%** vom Umsatz. Wie hoch ist der Gewinn?`,
      answer, tolerance: Math.abs(answer) * 0.01, tip: "Umsatz = Kunden × Preis, dann Gewinn = Umsatz × (1 − Kosten%)",
    };
  },
];

// ============================================
// INVESTMENT / ROI TEMPLATES
// ============================================

const investmentTemplates: TemplateGen[] = [
  // Simple ROI
  (diff) => {
    const invest = diff === 1 ? choice([100_000, 200_000, 500_000, 1_000_000])
      : diff === 2 ? choice([200_000, 500_000, 1_000_000])
      : choice([500_000, 750_000, 1_500_000]);
    const profitPa = diff === 1 ? choice([50_000, 100_000, 200_000])
      : diff === 2 ? choice([50_000, 100_000, 150_000])
      : choice([80_000, 150_000, 250_000]);
    const years = diff === 1 ? 1 : diff === 2 ? choice([2, 3]) : choice([3, 5]);
    const totalProfit = profitPa * years;
    const answer = (totalProfit / invest) * 100;
    return {
      question: `Investition: **${fmtEur(invest)}**. Gewinn: **${fmtEur(profitPa)} pro Jahr**${years > 1 ? ` über **${years} Jahre**` : ""}. Wie hoch ist der ROI in %?`,
      answer, tolerance: 0.5, tip: "ROI = (Gesamtgewinn ÷ Investition) × 100",
    };
  },
  // Payback period
  (diff) => {
    const invest = diff === 1 ? choice([500_000, 1_000_000, 2_000_000])
      : diff === 2 ? choice([500_000, 1_000_000, 1_500_000])
      : choice([1_500_000, 3_000_000]);
    const cashflow = diff === 1 ? choice([100_000, 250_000, 500_000])
      : diff === 2 ? choice([200_000, 300_000, 500_000])
      : choice([250_000, 400_000, 600_000]);
    const answer = invest / cashflow;
    return {
      question: `Investition: **${fmtEur(invest)}**. Jährlicher Rückfluss: **${fmtEur(cashflow)}**. Nach wie vielen Jahren ist die Investition zurückgezahlt?`,
      answer, tolerance: 0.05, tip: "Payback = Investition ÷ jährlicher Rückfluss",
    };
  },
  // Marketing ROI
  (diff) => {
    const cost = diff === 1 ? choice([50_000, 100_000])
      : diff === 2 ? choice([100_000, 200_000])
      : choice([150_000, 250_000]);
    const newCustomers = diff === 1 ? choice([1000, 2000, 5000])
      : diff === 2 ? choice([2000, 5000])
      : choice([3000, 5000, 8000]);
    const avgRevenue = diff === 1 ? choice([50, 100, 200])
      : diff === 2 ? choice([80, 100, 150])
      : choice([75, 120, 180]);
    const totalRev = newCustomers * avgRevenue;
    const answer = ((totalRev - cost) / cost) * 100;
    return {
      question: `Eine Kampagne kostet **${fmtEur(cost)}** und bringt **${fmt(newCustomers)} neue Kunden**. Jeder Kunde bringt **${fmtEur(avgRevenue)} Umsatz**. Wie hoch ist der ROI in %?`,
      answer, tolerance: 1, tip: "ROI = ((Umsatz − Kosten) ÷ Kosten) × 100",
    };
  },
  // Cost per customer
  (diff) => {
    const totalBudget = diff === 1 ? choice([100_000, 200_000, 500_000])
      : diff === 2 ? choice([200_000, 300_000, 500_000])
      : choice([300_000, 500_000, 800_000]);
    const newCustomers = diff === 1 ? choice([500, 1000, 2000])
      : diff === 2 ? choice([1000, 2000, 2500])
      : choice([1500, 2500, 4000]);
    const answer = totalBudget / newCustomers;
    return {
      question: `Gesamtbudget für Kundengewinnung: **${fmtEur(totalBudget)}**. Damit wurden **${fmt(newCustomers)} Neukunden** gewonnen. Wie viel kostet ein Neukunde?`,
      answer, tolerance: answer * 0.01, tip: "Kosten pro Kunde = Gesamtbudget ÷ Anzahl Neukunden",
    };
  },
];

// ============================================
// BREAK-EVEN TEMPLATES
// ============================================

const breakevenTemplates: TemplateGen[] = [
  // Simple break-even units
  (diff) => {
    const fix = diff === 1 ? choice([10_000, 20_000, 50_000, 100_000])
      : diff === 2 ? choice([30_000, 50_000, 100_000])
      : choice([80_000, 150_000, 200_000]);
    const price = diff === 1 ? choice([20, 50, 100])
      : diff === 2 ? choice([25, 40, 50, 80])
      : choice([30, 45, 70, 90]);
    const varCost = diff === 1 ? choice([5, 10, 20])
      : diff === 2 ? choice([10, 15, 20])
      : choice([12, 18, 30]);
    const safeVarCost = Math.min(varCost, price - 1);
    const answer = fix / (price - safeVarCost);
    return {
      question: `Fixkosten: **${fmtEur(fix)}**. Preis pro Stück: **${fmtEur(price)}**, variable Kosten: **${fmtEur(safeVarCost)}**. Wie viele Stück müssen verkauft werden für den Break-even?`,
      answer: Math.ceil(answer), tolerance: 1, tip: "Break-even = Fixkosten ÷ (Preis − variable Kosten)",
    };
  },
  // Subscription break-even
  (diff) => {
    const fix = diff === 1 ? choice([60_000, 120_000])
      : diff === 2 ? choice([100_000, 200_000])
      : choice([200_000, 360_000, 500_000]);
    const monthlyFee = diff === 1 ? choice([10, 20, 30, 50])
      : diff === 2 ? choice([15, 20, 25, 40])
      : choice([18, 25, 35, 49]);
    const monthlyVar = diff === 1 ? choice([2, 5, 10])
      : diff === 2 ? choice([3, 5, 10])
      : choice([5, 8, 12]);
    const safeVar = Math.min(monthlyVar, monthlyFee - 1);
    const annualContrib = (monthlyFee - safeVar) * 12;
    const answer = Math.ceil(fix / annualContrib);
    const business = choice(["Abo-Service", "Streaming-Dienst", "SaaS-Produkt", "Fitness-App"]);
    return {
      question: `Ein ${business} hat Fixkosten von **${fmtEur(fix)} pro Jahr**. Kunden zahlen **${fmtEur(monthlyFee)}/Monat**, variable Kosten: **${fmtEur(safeVar)}/Monat**. Wie viele Kunden braucht man für den Break-even?`,
      answer, tolerance: 1, tip: "Beitrag/Kunde/Jahr = (Monatspreis − var. Kosten) × 12, dann Fixkosten ÷ Beitrag",
    };
  },
  // Revenue-based break-even
  (diff) => {
    const fix = diff === 1 ? choice([200_000, 500_000, 1_000_000])
      : diff === 2 ? choice([300_000, 500_000, 800_000])
      : choice([500_000, 1_000_000, 1_500_000]);
    const varPct = diff === 1 ? choice([25, 40, 50])
      : diff === 2 ? choice([30, 40, 50])
      : choice([35, 45, 55]);
    const answer = fix / (1 - varPct / 100);
    const ind = choice(industries);
    return {
      question: `Ein ${ind} hat Fixkosten von **${fmtEur(fix)}**. Variable Kosten: **${varPct}%** vom Umsatz. Wie hoch muss der Umsatz für den Break-even sein?`,
      answer, tolerance: answer * 0.01, tip: "Break-even Umsatz = Fixkosten ÷ (1 − variable Kosten%)",
    };
  },
  // Break-even with price change (medium/hard)
  (diff) => {
    const currentPrice = diff === 1 ? choice([40, 50, 100])
      : diff === 2 ? choice([50, 60, 80])
      : choice([55, 75, 95]);
    const varCost = diff === 1 ? choice([10, 20]) : diff === 2 ? choice([20, 25, 30]) : choice([25, 35, 45]);
    const safeVarCost = Math.min(varCost, currentPrice - 5);
    const fix = diff === 1 ? choice([100_000, 200_000])
      : diff === 2 ? choice([100_000, 150_000, 200_000])
      : choice([150_000, 250_000]);
    const priceIncrease = choice([5, 10, 20]);
    const newPrice = currentPrice + priceIncrease;
    const answer = Math.ceil(fix / (newPrice - safeVarCost));
    return {
      question: `Preis aktuell **${fmtEur(currentPrice)}**, variable Kosten **${fmtEur(safeVarCost)}**, Fixkosten **${fmtEur(fix)}**. Der Preis wird um **${fmtEur(priceIncrease)}** erhöht. Wie viele Stück für den Break-even?`,
      answer, tolerance: 1, tip: "Neuer DB = (Preis + Erhöhung) − var. Kosten, dann Fixkosten ÷ DB",
    };
  },
];

// ============================================
// GENERATOR
// ============================================

const templateMap: Record<CaseMathCategory, TemplateGen[]> = {
  profitability: profitabilityTemplates,
  investment: investmentTemplates,
  breakeven: breakevenTemplates,
};

export const generateCaseMathTask = (
  categories: CaseMathCategory[],
  difficulty: number
): CaseMathTask => {
  const category = choice(categories);
  const templates = templateMap[category];
  const template = choice(templates);

  // Generate until unique
  let result: ReturnType<TemplateGen>;
  let attempts = 0;
  do {
    result = template(difficulty);
    attempts++;
  } while (sessionHistory.has(result.question) && attempts < 10);

  sessionHistory.add(result.question);
  if (sessionHistory.size > 200) {
    const arr = Array.from(sessionHistory);
    sessionHistory.clear();
    arr.slice(-100).forEach(q => sessionHistory.add(q));
  }

  return {
    id: ++taskCounter,
    category,
    question: result.question,
    highlightedQuestion: result.question,
    answer: Math.round(result.answer * 100) / 100,
    tolerance: result.tolerance,
    shortcut: { name: "", formula: "", tip: result.tip },
    difficulty,
  };
};

export const resetCaseMathGenerator = () => {
  sessionHistory.clear();
};

/**
 * Check if user answer matches the correct answer (with tolerance and suffix parsing).
 * Replicates logic from caseMathFetcher.ts
 */
export const checkCaseMathAnswer = (
  userInput: string,
  correctAnswer: number,
  tolerance: number
): boolean => {
  const cleaned = userInput
    .trim()
    .replace(/[€%\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  let value: number;
  const mrdMatch = cleaned.match(/^(-?[\d.]+)\s*(?:mrd)$/i);
  const mioMatch = cleaned.match(/^(-?[\d.]+)\s*(?:mio)$/i);
  const kMatch = cleaned.match(/^(-?[\d.]+)\s*k$/i);

  if (mrdMatch) value = parseFloat(mrdMatch[1]) * 1_000_000_000;
  else if (mioMatch) value = parseFloat(mioMatch[1]) * 1_000_000;
  else if (kMatch) value = parseFloat(kMatch[1]) * 1_000;
  else value = parseFloat(cleaned);

  if (isNaN(value)) return false;

  if (tolerance > 0) {
    return Math.abs(value - correctAnswer) <= tolerance;
  }

  return Math.abs(value - correctAnswer) < 0.01;
};
