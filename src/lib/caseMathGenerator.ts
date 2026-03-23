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
    const revs = diff === 1 ? [5, 8, 10, 12, 15, 20] : diff === 2 ? [7.5, 12.5, 18, 22, 35] : [13.7, 27.3, 42.5, 68];
    const rev = choice(revs) * 1_000_000;
    const costPct = diff === 1 ? choice([60, 70, 75, 80]) : diff === 2 ? choice([62, 68, 73, 78]) : choice([64.5, 71, 76.3]);
    const cost = rev * costPct / 100;
    const answer = rev - cost;
    const ind = choice(industries);
    return {
      question: `Ein ${ind} hat einen Umsatz von **${fmtEur(rev)}** und Kosten von **${fmtEur(cost)}**. Wie hoch ist der Gewinn in €?`,
      answer, tolerance: answer * 0.005, tip: "Gewinn = Umsatz - Kosten",
    };
  },
  // Margin-based
  (diff) => {
    const rev = diff === 1 ? choice([500_000, 800_000, 1_000_000, 2_000_000])
      : diff === 2 ? choice([750_000, 1_200_000, 3_500_000, 4_800_000])
      : choice([1_350_000, 2_750_000, 6_200_000]);
    const margin = diff === 1 ? choice([10, 15, 20, 25]) : diff === 2 ? choice([12, 18, 22, 35]) : choice([14.5, 17, 23.5]);
    const answer = rev * margin / 100;
    const period = choice(["monatlichen", "jährlichen", "quartalsweisen"]);
    const ind = choice(industries);
    return {
      question: `Ein ${ind} erzielt einen ${period} Umsatz von **${fmtEur(rev)}**. Die Gewinnmarge beträgt **${margin}%**. Wie hoch ist der ${period.replace("en", "e")} Gewinn in €?`,
      answer, tolerance: answer * 0.005, tip: "Gewinn = Umsatz x Marge",
    };
  },
  // Multi-segment (medium/hard)
  (diff) => {
    if (diff === 1) {
      const rev = choice([4, 6, 8, 10]) * 1_000_000;
      const cogs = choice([40, 50, 60]) / 100;
      const opex = choice([1, 1.5, 2]) * 1_000_000;
      const answer = rev * (1 - cogs) - opex;
      return {
        question: `Umsatz **${fmtEur(rev)}**, COGS **${cogs * 100}%** vom Umsatz, operative Kosten **${fmtEur(opex)}**. Wie hoch ist der operative Gewinn in €?`,
        answer, tolerance: answer * 0.005, tip: "Operativer Gewinn = Umsatz x (1 - COGS%) - OpEx",
      };
    }
    const segments = diff === 2 ? 2 : 3;
    const names = ["A", "B", "C"];
    let total = 0;
    const parts: string[] = [];
    for (let i = 0; i < segments; i++) {
      const rev = choice(diff === 2 ? [5, 8, 10, 12] : [4, 7, 9, 12, 15]) * 1_000_000;
      const margin = choice(diff === 2 ? [10, 15, 20, 25, -5] : [8, 12, 18, 25, -10, -5]);
      total += rev * margin / 100;
      parts.push(`${names[i]} (Umsatz **${fmtEur(rev)}**, Marge **${margin}%**)`);
    }
    const overhead = choice([1, 1.5, 2, 2.5]) * 1_000_000;
    total -= overhead;
    return {
      question: `Ein Unternehmen hat **${segments} Geschäftsbereiche**: ${parts.join(", ")}. Overhead-Kosten: **${fmtEur(overhead)}**. Wie hoch ist der Gesamtgewinn in €?`,
      answer: total, tolerance: Math.abs(total) * 0.01, tip: "Gewinn je Segment aufsummieren, dann Overhead abziehen",
    };
  },
  // SaaS unit economics
  (diff) => {
    const customers = diff === 1 ? choice([1000, 2000, 5000]) : diff === 2 ? choice([3000, 5000, 8000]) : choice([4500, 7500, 12000]);
    const arpu = diff === 1 ? choice([100, 200, 500]) : diff === 2 ? choice([150, 240, 480]) : choice([175, 320, 560]);
    const grossMargin = diff === 1 ? choice([70, 80]) : diff === 2 ? choice([65, 75]) : choice([68, 72]);
    const opex = diff === 1 ? choice([200_000, 300_000, 500_000]) : diff === 2 ? choice([1_500_000, 2_500_000]) : choice([3_200_000, 4_800_000]);
    const revenue = customers * arpu;
    const grossProfit = revenue * grossMargin / 100;
    const answer = grossProfit - opex;
    return {
      question: `Ein SaaS-Unternehmen hat **${fmt(customers)} Kunden** mit einem durchschnittlichen Jahresumsatz von **${fmtEur(arpu)} pro Kunde**. Die Bruttomarge beträgt **${grossMargin}%** und die operativen Kosten belaufen sich auf **${fmtEur(opex)}**. Wie hoch ist der operative Gewinn in €?`,
      answer, tolerance: Math.abs(answer) * 0.01, tip: "Umsatz = Kunden x ARPU, dann Bruttomarge abziehen, dann OpEx",
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
      : diff === 2 ? choice([250_000, 500_000, 750_000])
      : choice([350_000, 850_000, 1_500_000]);
    const profitPa = diff === 1 ? choice([25_000, 50_000, 100_000])
      : diff === 2 ? choice([60_000, 125_000, 175_000])
      : choice([85_000, 150_000, 225_000]);
    const years = diff === 1 ? 1 : diff === 2 ? choice([2, 3]) : choice([3, 5]);
    const totalProfit = profitPa * years;
    const answer = (totalProfit / invest) * 100;
    return {
      question: `Du investierst **${fmtEur(invest)}** und erzielst ${years > 1 ? `nach ${years} Jahren einen Gewinn von **${fmtEur(profitPa)} pro Jahr**` : `einen Jahresgewinn von **${fmtEur(profitPa)}**`}. Wie hoch ist der ROI${years > 1 ? ` nach ${years} Jahren` : ""} in %?`,
      answer, tolerance: 0.5, tip: `ROI = (Gesamtgewinn / Investition) x 100`,
    };
  },
  // Payback period
  (diff) => {
    const invest = diff === 1 ? choice([500_000, 1_000_000, 2_000_000])
      : diff === 2 ? choice([750_000, 1_200_000, 3_000_000])
      : choice([1_800_000, 4_500_000]);
    const cashflow = diff === 1 ? choice([100_000, 250_000, 500_000])
      : diff === 2 ? choice([150_000, 300_000, 400_000])
      : choice([225_000, 375_000, 600_000]);
    const answer = invest / cashflow;
    return {
      question: `Investition: **${fmtEur(invest)}**. Jährlicher Cashflow: **${fmtEur(cashflow)}**. Nach wie vielen Jahren ist die Investition amortisiert?`,
      answer, tolerance: 0.05, tip: "Payback = Investition / jährlicher Cashflow",
    };
  },
  // Marketing ROI
  (diff) => {
    const cost = diff === 1 ? choice([50_000, 80_000, 100_000])
      : diff === 2 ? choice([60_000, 120_000, 200_000])
      : choice([75_000, 150_000, 250_000]);
    const newCustomers = diff === 1 ? choice([1000, 2000, 5000])
      : diff === 2 ? choice([1500, 3000, 4000])
      : choice([2500, 4500, 6000]);
    const clv = diff === 1 ? choice([50, 80, 100, 120])
      : diff === 2 ? choice([75, 110, 150])
      : choice([85, 135, 180]);
    const totalRev = newCustomers * clv;
    const answer = ((totalRev - cost) / cost) * 100;
    return {
      question: `Eine Marketingkampagne kostet **${fmtEur(cost)}**. Sie generiert **${fmt(newCustomers)} neue Kunden** mit einem durchschnittlichen CLV von **${fmtEur(clv)}**. Wie hoch ist der ROI in %?`,
      answer, tolerance: 1, tip: "ROI = ((Umsatz - Kosten) / Kosten) x 100",
    };
  },
  // CAC calculation
  (diff) => {
    const marketingBudget = diff === 1 ? choice([100_000, 200_000, 500_000])
      : diff === 2 ? choice([150_000, 350_000, 600_000])
      : choice([250_000, 450_000, 800_000]);
    const salesBudget = diff === 1 ? choice([50_000, 100_000, 200_000])
      : diff === 2 ? choice([80_000, 150_000, 250_000])
      : choice([120_000, 220_000, 400_000]);
    const newCustomers = diff === 1 ? choice([500, 1000, 2000])
      : diff === 2 ? choice([750, 1500, 2500])
      : choice([1200, 2200, 3500]);
    const answer = (marketingBudget + salesBudget) / newCustomers;
    return {
      question: `Marketing-Budget: **${fmtEur(marketingBudget)}**, Vertriebskosten: **${fmtEur(salesBudget)}**. Damit wurden **${fmt(newCustomers)} Neukunden** gewonnen. Wie hoch sind die Customer Acquisition Costs (CAC) pro Kunde in €?`,
      answer, tolerance: answer * 0.01, tip: "CAC = (Marketing + Vertrieb) / Neukunden",
    };
  },
];

// ============================================
// BREAK-EVEN TEMPLATES
// ============================================

const breakevenTemplates: TemplateGen[] = [
  // Simple break-even units
  (diff) => {
    const fix = diff === 1 ? choice([30_000, 50_000, 60_000, 100_000])
      : diff === 2 ? choice([45_000, 75_000, 120_000])
      : choice([85_000, 150_000, 220_000]);
    const price = diff === 1 ? choice([20, 30, 50, 100])
      : diff === 2 ? choice([25, 35, 60, 90])
      : choice([28, 45, 72, 110]);
    const varCost = diff === 1 ? choice([5, 10, 15, 20])
      : diff === 2 ? choice([8, 14, 22, 36])
      : choice([11, 18, 30, 48]);
    // Ensure price > varCost
    const safeVarCost = Math.min(varCost, price - 1);
    const answer = fix / (price - safeVarCost);
    const period = choice(["pro Monat", "pro Quartal"]);
    return {
      question: `Fixkosten: **${fmtEur(fix)} ${period}**. Verkaufspreis pro Einheit: **${fmtEur(price)}**, variable Kosten: **${fmtEur(safeVarCost)}**. Wie viele Einheiten müssen ${period} verkauft werden, um den Break-even zu erreichen?`,
      answer: Math.ceil(answer), tolerance: 1, tip: "Break-even = Fixkosten / (Preis - variable Kosten)",
    };
  },
  // Subscription break-even
  (diff) => {
    const fix = diff === 1 ? choice([60_000, 100_000, 120_000])
      : diff === 2 ? choice([80_000, 150_000, 240_000])
      : choice([180_000, 360_000, 500_000]);
    const monthlyFee = diff === 1 ? choice([10, 15, 20, 30])
      : diff === 2 ? choice([12, 19, 25, 40])
      : choice([14, 22, 35, 49]);
    const monthlyVar = diff === 1 ? choice([2, 3, 5])
      : diff === 2 ? choice([3, 5, 8])
      : choice([4, 7, 12]);
    const safeVar = Math.min(monthlyVar, monthlyFee - 1);
    const annualContrib = (monthlyFee - safeVar) * 12;
    const answer = Math.ceil(fix / annualContrib);
    const business = choice(["Abo-Service", "Streaming-Dienst", "SaaS-Produkt", "Fitness-App"]);
    return {
      question: `Ein ${business} hat Fixkosten von **${fmtEur(fix)}/Jahr**. Jeder Kunde zahlt **${fmtEur(monthlyFee)}/Monat** und verursacht variable Kosten von **${fmtEur(safeVar)}/Monat**. Wie viele Kunden braucht das Unternehmen, um den Break-even pro Jahr zu erreichen?`,
      answer, tolerance: 1, tip: "Jahresbeitrag pro Kunde = (Monatspreis - variable Kosten) x 12, dann Fixkosten / Beitrag",
    };
  },
  // Revenue-based break-even
  (diff) => {
    const fix = diff === 1 ? choice([200_000, 400_000, 500_000])
      : diff === 2 ? choice([350_000, 600_000, 800_000])
      : choice([750_000, 1_200_000, 1_800_000]);
    const varPct = diff === 1 ? choice([30, 40, 50])
      : diff === 2 ? choice([35, 45, 55])
      : choice([38, 47, 58]);
    const answer = fix / (1 - varPct / 100);
    const ind = choice(industries);
    return {
      question: `Ein ${ind} hat Fixkosten von **${fmtEur(fix)}**. Die variablen Kosten betragen **${varPct}%** vom Umsatz. Wie hoch muss der Umsatz sein, um den Break-even zu erreichen (in €)?`,
      answer, tolerance: answer * 0.01, tip: "Break-even Umsatz = Fixkosten / (1 - variable Kosten %)",
    };
  },
  // Break-even with price change (medium/hard)
  (diff) => {
    const currentUnits = diff === 1 ? choice([5000, 8000, 10000])
      : diff === 2 ? choice([6000, 9000, 12000])
      : choice([7500, 11000, 15000]);
    const currentPrice = diff === 1 ? choice([40, 50, 80])
      : diff === 2 ? choice([45, 65, 90])
      : choice([55, 75, 95]);
    const varCost = Math.round(currentPrice * (diff === 1 ? 0.4 : diff === 2 ? 0.45 : 0.5));
    const fix = diff === 1 ? choice([100_000, 150_000])
      : diff === 2 ? choice([120_000, 200_000])
      : choice([180_000, 280_000]);
    const priceIncrease = choice([5, 10, 15, 20]);
    const newPrice = currentPrice + priceIncrease;
    const answer = Math.ceil(fix / (newPrice - varCost));
    return {
      question: `Ein Unternehmen verkauft aktuell **${fmt(currentUnits)} Einheiten** zu **${fmtEur(currentPrice)}**. Variable Kosten: **${fmtEur(varCost)}/Stück**, Fixkosten: **${fmtEur(fix)}**. Wenn der Preis um **${fmtEur(priceIncrease)}** erhöht wird: Wie viele Einheiten müssen dann für den Break-even verkauft werden?`,
      answer, tolerance: 1, tip: "Neuer Deckungsbeitrag = (Alter Preis + Erhöhung) - variable Kosten, dann Fixkosten / DB",
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
