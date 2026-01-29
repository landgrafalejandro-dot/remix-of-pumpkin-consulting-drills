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
const randInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const formatNumber = (num: number): string => {
  if (Math.abs(num) >= 1_000_000_000) {
    const val = num / 1_000_000_000;
    return val % 1 === 0 ? `${val} Mrd` : `${val.toFixed(1).replace('.', ',')} Mrd`;
  }
  if (Math.abs(num) >= 1_000_000) {
    const val = num / 1_000_000;
    return val % 1 === 0 ? `${val} Mio` : `${val.toFixed(1).replace('.', ',')} Mio`;
  }
  if (Math.abs(num) >= 1000) {
    const val = num / 1000;
    return val % 1 === 0 ? `${val}k` : `${val.toFixed(1).replace('.', ',')}k`;
  }
  if (!Number.isInteger(num)) {
    return num.toLocaleString('de-DE', { maximumFractionDigits: 2 });
  }
  return num.toLocaleString('de-DE');
};

const formatCurrency = (num: number): string => `€${formatNumber(num)}`;
const formatPercent = (num: number): string => `${num}%`;

// ============================================
// ARCHETYPE A: PRODUCT ECONOMICS (BREAKEVEN)
// ============================================
type BreakevenVariant = 'find_volume' | 'find_vc' | 'find_price';

const generateBreakevenTask = (difficulty: number): CaseMathTask | null => {
  const variants: BreakevenVariant[] = ['find_volume', 'find_vc', 'find_price'];
  const variant = choice(variants);
  
  let fixedCosts: number, price: number, variableCost: number, volume: number;
  let question: string, answer: number, formula: string, tip: string, name: string;
  
  // Generate clean numbers based on difficulty
  if (difficulty === 1) {
    // Simple: Round numbers, easy division
    const fcOptions = [50_000, 100_000, 200_000, 150_000, 80_000];
    const dbOptions = [10, 20, 25, 40, 50]; // Contribution margin options
    const contributionMargin = choice(dbOptions);
    fixedCosts = choice(fcOptions);
    volume = fixedCosts / contributionMargin;
    price = choice([50, 80, 100, 120, 150]);
    variableCost = price - contributionMargin;
  } else if (difficulty === 2) {
    // Medium: k/m notation, 2-step
    const fcOptions = [500_000, 1_000_000, 1_500_000, 2_000_000, 750_000];
    const dbOptions = [25, 50, 100, 200, 250];
    const contributionMargin = choice(dbOptions);
    fixedCosts = choice(fcOptions);
    volume = fixedCosts / contributionMargin;
    price = choice([100, 200, 300, 500, 750]);
    variableCost = price - contributionMargin;
  } else {
    // Hard: Tighter margins, larger numbers
    const fcOptions = [10_000_000, 25_000_000, 40_000_000, 50_000_000, 80_000_000];
    fixedCosts = choice(fcOptions);
    // Small contribution margins (cents to few euros)
    const dbCents = choice([5, 10, 20, 25, 50]); // in cents
    const contributionMargin = dbCents / 100;
    volume = fixedCosts / contributionMargin;
    price = choice([1.5, 2, 2.5, 3, 5]);
    variableCost = Math.round((price - contributionMargin) * 100) / 100;
  }
  
  switch (variant) {
    case 'find_volume':
      question = `Fixkosten: **${formatCurrency(fixedCosts)}**. Preis: **${formatCurrency(price)}**. Variable Kosten: **${formatCurrency(variableCost)}**. Break-even Menge?`;
      answer = volume;
      formula = "Break-even = Fixkosten / (Preis − VK)";
      tip = `Deckungsbeitrag = ${formatCurrency(price - variableCost)}. ${formatCurrency(fixedCosts)} / ${formatCurrency(price - variableCost)} = ${formatNumber(volume)} Stück.`;
      name = "Break-even Volumen";
      break;
      
    case 'find_vc':
      question = `Um bei **${formatNumber(volume)} Einheiten** Break-even zu erreichen, bei Fixkosten von **${formatCurrency(fixedCosts)}** und einem Preis von **${formatCurrency(price)}** – wie hoch dürfen die variablen Kosten maximal sein?`;
      answer = variableCost;
      formula = "VK = Preis − (Fixkosten / Volumen)";
      tip = `Erforderlicher DB = ${formatCurrency(fixedCosts)} / ${formatNumber(volume)} = ${formatCurrency(price - variableCost)}. Also VK = ${formatCurrency(price)} − ${formatCurrency(price - variableCost)} = ${formatCurrency(variableCost)}.`;
      name = "Reverse Variable Kosten";
      break;
      
    case 'find_price':
      question = `Fixkosten: **${formatCurrency(fixedCosts)}**. Variable Kosten: **${formatCurrency(variableCost)}**. Ziel-Break-even: **${formatNumber(volume)} Einheiten**. Welchen Preis müssen wir verlangen?`;
      answer = price;
      formula = "Preis = (Fixkosten / Volumen) + VK";
      tip = `Erforderlicher DB = ${formatCurrency(fixedCosts)} / ${formatNumber(volume)} = ${formatCurrency(price - variableCost)}. Preis = ${formatCurrency(variableCost)} + ${formatCurrency(price - variableCost)} = ${formatCurrency(price)}.`;
      name = "Reverse Preiskalkulation";
      break;
  }
  
  const key = `breakeven:${variant}:${fixedCosts}:${price}:${variableCost}`;
  if (isInHistory(key)) return null;
  addToHistory(key);
  
  return {
    id: ++taskCounter,
    category: "breakeven",
    question,
    highlightedQuestion: question,
    answer,
    shortcut: { name, formula, tip },
    difficulty,
  };
};

// ============================================
// ARCHETYPE B: PROFITABILITY & MARGINS
// ============================================
type ProfitabilityVariant = 'find_profit' | 'find_margin' | 'find_blended_margin' | 'find_revenue';

const generateProfitabilityTask = (difficulty: number): CaseMathTask | null => {
  const variants: ProfitabilityVariant[] = difficulty === 1 
    ? ['find_profit', 'find_margin'] 
    : ['find_profit', 'find_margin', 'find_blended_margin', 'find_revenue'];
  const variant = choice(variants);
  
  let question: string, answer: number, formula: string, tip: string, name: string;
  
  switch (variant) {
    case 'find_profit': {
      let volume: number, price: number, margin: number;
      if (difficulty === 1) {
        volume = choice([1000, 5000, 10000, 20000]);
        price = choice([10, 20, 50, 100]);
        margin = choice([10, 20, 25, 50]);
      } else if (difficulty === 2) {
        volume = choice([100_000, 500_000, 1_000_000]);
        price = choice([10, 25, 50, 80]);
        margin = choice([15, 20, 25, 30]);
      } else {
        volume = choice([1_000_000, 2_000_000, 5_000_000]);
        price = choice([12, 18, 24, 35]);
        margin = choice([12, 18, 22, 28]);
      }
      const revenue = volume * price;
      const profit = revenue * (margin / 100);
      question = `Absatz: **${formatNumber(volume)} Stück**. Preis: **${formatCurrency(price)}**. Marge: **${margin}%**. Wie hoch ist der Gesamtgewinn?`;
      answer = profit;
      formula = "Gewinn = Volumen × Preis × Marge";
      tip = `Umsatz = ${formatNumber(volume)} × ${formatCurrency(price)} = ${formatCurrency(revenue)}. Gewinn = ${formatCurrency(revenue)} × ${margin}% = ${formatCurrency(profit)}.`;
      name = "Gewinnberechnung";
      break;
    }
    
    case 'find_margin': {
      let price: number, cost: number;
      if (difficulty === 1) {
        price = choice([50, 100, 200, 250]);
        cost = choice([30, 60, 80, 150, 200]);
        // Ensure cost < price
        if (cost >= price) cost = Math.floor(price * 0.6);
      } else if (difficulty === 2) {
        price = choice([80, 120, 200, 500]);
        cost = Math.round(price * choice([0.5, 0.6, 0.7, 0.75]));
      } else {
        price = choice([45, 85, 125, 175, 225]);
        cost = Math.round(price * choice([0.55, 0.65, 0.72, 0.78]));
      }
      const margin = Math.round(((price - cost) / price) * 100);
      question = `Ein Produkt wird für **${formatCurrency(price)}** verkauft. Herstellungs- und Lieferkosten: **${formatCurrency(cost)}**. Wie hoch ist die Gewinnmarge?`;
      answer = margin;
      formula = "Marge = (Preis − Kosten) / Preis";
      tip = `Marge wird immer relativ zum Preis/Umsatz berechnet, nicht zu den Kosten! (${formatCurrency(price)} − ${formatCurrency(cost)}) / ${formatCurrency(price)} = ${margin}%.`;
      name = "Margenberechnung";
      break;
    }
    
    case 'find_blended_margin': {
      const marginA = choice([10, 15, 20]);
      const marginB = choice([40, 50, 60]);
      const revenueA = choice([100_000, 200_000, 500_000]);
      const revenueB = choice([100_000, 200_000, 500_000]);
      const totalRevenue = revenueA + revenueB;
      const blendedMargin = Math.round(((revenueA * marginA / 100) + (revenueB * marginB / 100)) / totalRevenue * 100);
      question = `Produkt A: Marge **${marginA}%**, Umsatz **${formatCurrency(revenueA)}**. Produkt B: Marge **${marginB}%**, Umsatz **${formatCurrency(revenueB)}**. Durchschnittsmarge des Portfolios?`;
      answer = blendedMargin;
      formula = "Blended Margin = Σ(Umsatz × Marge) / Gesamtumsatz";
      tip = `Gewichteter Durchschnitt: (${formatCurrency(revenueA)}×${marginA}% + ${formatCurrency(revenueB)}×${marginB}%) / ${formatCurrency(totalRevenue)} = ${blendedMargin}%.`;
      name = "Portfolio-Marge";
      break;
    }
    
    case 'find_revenue': {
      let profit: number, margin: number;
      if (difficulty === 2) {
        profit = choice([100_000, 200_000, 500_000, 250_000]);
        margin = choice([20, 25, 50]);
      } else {
        profit = choice([350_000, 450_000, 750_000, 1_200_000]);
        margin = choice([15, 18, 22, 35]);
      }
      const revenue = profit / (margin / 100);
      question = `Zielgewinn: **${formatCurrency(profit)}**. Gewünschte Marge: **${margin}%**. Welchen Umsatz müssen wir erzielen?`;
      answer = revenue;
      formula = "Umsatz = Gewinn / Marge";
      tip = `Wenn Marge = Gewinn/Umsatz, dann Umsatz = Gewinn/Marge = ${formatCurrency(profit)} / ${margin}% = ${formatCurrency(revenue)}.`;
      name = "Reverse Umsatz";
      break;
    }
  }
  
  const key = `profit:${variant}:${question.slice(0, 40)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);
  
  return {
    id: ++taskCounter,
    category: "profitability",
    question: question!,
    highlightedQuestion: question!,
    answer: answer!,
    shortcut: { name: name!, formula: formula!, tip: tip! },
    difficulty,
  };
};

// ============================================
// ARCHETYPE C: MARKET DYNAMICS (MARKET SHARE)
// ============================================
type MarketShareVariant = 'find_share' | 'find_market_size' | 'find_growth_share';

const generateMarketShareTask = (difficulty: number): CaseMathTask | null => {
  const variants: MarketShareVariant[] = difficulty === 1 
    ? ['find_share'] 
    : ['find_share', 'find_market_size', 'find_growth_share'];
  const variant = choice(variants);
  
  let question: string, answer: number, formula: string, tip: string, name: string;
  
  switch (variant) {
    case 'find_share': {
      let companyRevenue: number, marketSize: number;
      if (difficulty === 1) {
        marketSize = choice([1_000_000_000, 2_000_000_000, 5_000_000_000, 500_000_000]);
        // Ensure clean percentages
        const sharePercent = choice([5, 10, 20, 25, 50]);
        companyRevenue = marketSize * (sharePercent / 100);
      } else if (difficulty === 2) {
        marketSize = choice([2_500_000_000, 4_000_000_000, 8_000_000_000]);
        const sharePercent = choice([8, 12, 15, 20, 25]);
        companyRevenue = marketSize * (sharePercent / 100);
      } else {
        marketSize = choice([2_500_000_000, 3_200_000_000, 6_400_000_000]);
        const sharePercent = choice([6.25, 12.5, 15, 18.75, 25]);
        companyRevenue = marketSize * (sharePercent / 100);
      }
      const share = Math.round((companyRevenue / marketSize) * 100 * 100) / 100;
      question = `Unser Kunde erzielt **${formatCurrency(companyRevenue)}** Umsatz in einem Markt von **${formatCurrency(marketSize)}**. Wie hoch ist der Marktanteil?`;
      answer = share;
      formula = "Marktanteil = Unternehmensumsatz / Marktgröße";
      // Simplification tip
      const numerator = companyRevenue / 1_000_000;
      const denominator = marketSize / 1_000_000;
      tip = `Vereinfache den Bruch: ${formatNumber(companyRevenue)} / ${formatNumber(marketSize)} = ${numerator}/${denominator} = ${share}%.`;
      name = "Marktanteil berechnen";
      break;
    }
    
    case 'find_market_size': {
      let sharePercent: number, revenue: number;
      if (difficulty === 2) {
        sharePercent = choice([10, 20, 25, 50]);
        revenue = choice([40_000_000, 100_000_000, 200_000_000, 500_000_000]);
      } else {
        sharePercent = choice([8, 12, 15, 16, 20]);
        revenue = choice([48_000_000, 120_000_000, 240_000_000, 320_000_000]);
      }
      const marketSize = revenue / (sharePercent / 100);
      question = `Wir haben **${sharePercent}%** Marktanteil und erzielen **${formatCurrency(revenue)}** Umsatz. Wie groß ist der Gesamtmarkt?`;
      answer = marketSize;
      formula = "Marktgröße = Umsatz / Marktanteil";
      tip = `Wenn ${sharePercent}% = ${formatCurrency(revenue)}, dann 100% = ${formatCurrency(revenue)} / ${sharePercent}% = ${formatCurrency(marketSize)}.`;
      name = "Marktgröße berechnen";
      break;
    }
    
    case 'find_growth_share': {
      const currentMarket = choice([100, 1000, 10000]);
      const ourSales = choice([10, 20, 25, 30, 40]);
      const marketGrowth = choice([10, 20, 25, 50]);
      const newMarket = currentMarket * (1 + marketGrowth / 100);
      const newShare = Math.round((ourSales / newMarket) * 100 * 10) / 10;
      question = `Der Markt hat **${formatNumber(currentMarket)} Einheiten**. Wir verkaufen **${ourSales} Einheiten**. Nächstes Jahr wächst der Markt um **${marketGrowth}%**, aber unser Absatz bleibt gleich. Neuer Marktanteil?`;
      answer = newShare;
      formula = "Neuer Anteil = Eigene Menge / (Markt × Wachstum)";
      tip = `Neuer Markt = ${formatNumber(currentMarket)} × ${1 + marketGrowth/100} = ${formatNumber(newMarket)}. Unser Anteil: ${ourSales} / ${formatNumber(newMarket)} = ${newShare}%.`;
      name = "Marktanteil nach Wachstum";
      break;
    }
  }
  
  const key = `market:${variant}:${question.slice(0, 40)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);
  
  return {
    id: ++taskCounter,
    category: "market-sizing",
    question: question!,
    highlightedQuestion: question!,
    answer: answer!,
    shortcut: { name: name!, formula: formula!, tip: tip! },
    difficulty,
  };
};

// ============================================
// ARCHETYPE D: COST REDUCTION (SAVINGS)
// ============================================
type SavingsVariant = 'find_savings_percent' | 'find_savings_per_unit' | 'find_total_savings';

const generateSavingsTask = (difficulty: number): CaseMathTask | null => {
  const variants: SavingsVariant[] = ['find_savings_percent', 'find_savings_per_unit', 'find_total_savings'];
  const variant = choice(variants);
  
  let question: string, answer: number, formula: string, tip: string, name: string;
  
  switch (variant) {
    case 'find_savings_percent': {
      let totalCost: number, reductionPercent: number;
      if (difficulty === 1) {
        totalCost = choice([50_000_000, 100_000_000, 200_000_000]);
        reductionPercent = choice([10, 20, 25]);
      } else if (difficulty === 2) {
        totalCost = choice([45_000_000, 80_000_000, 120_000_000]);
        reductionPercent = choice([12, 15, 18, 22]);
      } else {
        totalCost = choice([47_000_000, 83_000_000, 125_000_000]);
        reductionPercent = choice([8, 13, 17, 23]);
      }
      const savings = totalCost * (reductionPercent / 100);
      question = `Outsourcing reduziert unser **${formatCurrency(totalCost)}** IT-Budget um **${reductionPercent}%**. Wie viel sparen wir?`;
      answer = savings;
      formula = "Ersparnis = Gesamtkosten × Reduktion%";
      tip = `${formatCurrency(totalCost)} × ${reductionPercent}% = ${formatCurrency(savings)}.`;
      name = "Prozentuale Einsparung";
      break;
    }
    
    case 'find_savings_per_unit': {
      let volume: number, currentCost: number, savingsPerUnit: number;
      if (difficulty === 1) {
        volume = choice([100_000, 500_000, 1_000_000]);
        savingsPerUnit = choice([1, 2, 5, 10]);
        currentCost = savingsPerUnit + choice([5, 10, 20]);
      } else if (difficulty === 2) {
        volume = choice([500_000, 1_000_000, 2_000_000]);
        savingsPerUnit = choice([0.5, 1, 1.5, 2]);
        currentCost = savingsPerUnit + choice([3, 5, 8]);
      } else {
        volume = choice([1_000_000, 5_000_000, 10_000_000]);
        savingsPerUnit = choice([0.25, 0.5, 0.75, 1.25]);
        currentCost = savingsPerUnit + choice([2.5, 4, 6]);
      }
      const totalSavings = volume * savingsPerUnit;
      question = `Wir produzieren **${formatNumber(volume)} Einheiten** zu **${formatCurrency(currentCost)}/Stück**. Ein neuer Prozess spart **${formatCurrency(savingsPerUnit)}** pro Einheit. Jährliche Gesamtersparnis?`;
      answer = totalSavings;
      formula = "Ersparnis = Volumen × Einsparung/Einheit";
      tip = `${formatNumber(volume)} × ${formatCurrency(savingsPerUnit)} = ${formatCurrency(totalSavings)}.`;
      name = "Stückkosten-Einsparung";
      break;
    }
    
    case 'find_total_savings': {
      let currentCost: number, newCost: number;
      if (difficulty === 1) {
        currentCost = choice([100_000, 200_000, 500_000]);
        newCost = choice([0.7, 0.75, 0.8]) * currentCost;
      } else if (difficulty === 2) {
        currentCost = choice([1_200_000, 2_500_000, 4_000_000]);
        newCost = choice([0.72, 0.78, 0.85]) * currentCost;
      } else {
        currentCost = choice([3_400_000, 5_600_000, 8_200_000]);
        newCost = choice([0.68, 0.74, 0.82]) * currentCost;
      }
      newCost = Math.round(newCost);
      const savings = currentCost - newCost;
      question = `Aktuelle Kosten: **${formatCurrency(currentCost)}**. Nach Optimierung: **${formatCurrency(newCost)}**. Absolute Ersparnis?`;
      answer = savings;
      formula = "Ersparnis = Alte Kosten − Neue Kosten";
      tip = `${formatCurrency(currentCost)} − ${formatCurrency(newCost)} = ${formatCurrency(savings)}.`;
      name = "Absolute Einsparung";
      break;
    }
  }
  
  const key = `savings:${variant}:${question.slice(0, 40)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);
  
  return {
    id: ++taskCounter,
    category: "profitability", // Cost savings fits under profitability
    question: question!,
    highlightedQuestion: question!,
    answer: answer!,
    shortcut: { name: name!, formula: formula!, tip: tip! },
    difficulty,
  };
};

// ============================================
// ARCHETYPE E: INVESTMENT PAYBACK (ROI)
// ============================================
type InvestmentVariant = 'find_payback' | 'find_required_profit' | 'find_roi';

const generateInvestmentTask = (difficulty: number): CaseMathTask | null => {
  const variants: InvestmentVariant[] = ['find_payback', 'find_required_profit', 'find_roi'];
  const variant = choice(variants);
  
  let question: string, answer: number, formula: string, tip: string, name: string;
  
  switch (variant) {
    case 'find_payback': {
      let investment: number, annualProfit: number;
      if (difficulty === 1) {
        investment = choice([100_000, 200_000, 500_000, 1_000_000]);
        annualProfit = choice([25_000, 50_000, 100_000, 200_000]);
      } else if (difficulty === 2) {
        investment = choice([1_200_000, 2_500_000, 4_000_000]);
        annualProfit = choice([300_000, 500_000, 800_000]);
      } else {
        investment = choice([15_000_000, 24_000_000, 50_000_000]);
        annualProfit = choice([3_000_000, 4_000_000, 8_000_000, 10_000_000]);
      }
      const payback = investment / annualProfit;
      question = `Investition: **${formatCurrency(investment)}**. Jährlicher Gewinn: **${formatCurrency(annualProfit)}**. Payback-Zeit in Jahren?`;
      answer = payback;
      formula = "Payback = Investition / Jahresgewinn";
      tip = `${formatCurrency(investment)} / ${formatCurrency(annualProfit)} = ${formatNumber(payback)} Jahre.`;
      name = "Payback-Berechnung";
      break;
    }
    
    case 'find_required_profit': {
      let investment: number, targetPayback: number;
      if (difficulty === 1) {
        investment = choice([100_000, 200_000, 400_000, 500_000]);
        targetPayback = choice([2, 4, 5]);
      } else if (difficulty === 2) {
        investment = choice([1_500_000, 2_000_000, 3_000_000, 4_500_000]);
        targetPayback = choice([3, 4, 5, 6]);
      } else {
        investment = choice([200_000_000, 350_000_000, 500_000_000]);
        targetPayback = choice([4, 5, 7, 8]);
      }
      const requiredProfit = investment / targetPayback;
      question = `Wir brauchen einen Payback von **${targetPayback} Jahren** bei einer Investition von **${formatCurrency(investment)}**. Wie viel Jahresgewinn ist erforderlich?`;
      answer = requiredProfit;
      formula = "Jahresgewinn = Investition / Payback";
      tip = `${formatCurrency(investment)} / ${targetPayback} Jahre = ${formatCurrency(requiredProfit)} pro Jahr.`;
      name = "Erforderlicher Gewinn";
      break;
    }
    
    case 'find_roi': {
      let investment: number, annualProfit: number;
      if (difficulty === 1) {
        investment = choice([100_000, 200_000, 400_000, 500_000]);
        // Ensure clean percentages
        const roiPercent = choice([10, 20, 25, 50]);
        annualProfit = investment * (roiPercent / 100);
      } else if (difficulty === 2) {
        investment = choice([500_000, 800_000, 1_000_000, 2_000_000]);
        const roiPercent = choice([12, 15, 18, 20, 25]);
        annualProfit = investment * (roiPercent / 100);
      } else {
        investment = choice([1_200_000, 2_400_000, 3_600_000, 4_800_000]);
        const roiPercent = choice([8, 12, 15, 16, 18]);
        annualProfit = investment * (roiPercent / 100);
      }
      const roi = Math.round((annualProfit / investment) * 100);
      question = `Investition: **${formatCurrency(investment)}**. Jährlicher Gewinn: **${formatCurrency(annualProfit)}**. ROI in Prozent?`;
      answer = roi;
      formula = "ROI = Jahresgewinn / Investition";
      tip = `${formatCurrency(annualProfit)} / ${formatCurrency(investment)} = ${roi}%.`;
      name = "ROI-Berechnung";
      break;
    }
  }
  
  const key = `investment:${variant}:${question.slice(0, 40)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);
  
  return {
    id: ++taskCounter,
    category: "investment",
    question: question!,
    highlightedQuestion: question!,
    answer: answer!,
    shortcut: { name: name!, formula: formula!, tip: tip! },
    difficulty,
  };
};

// ============================================
// ADDITIONAL MARKET SIZING TASKS
// ============================================
const generateMarketSizingTask = (difficulty: number): CaseMathTask | null => {
  let question: string, answer: number, formula: string, tip: string, name: string;
  
  if (difficulty === 1) {
    const scenarios = [
      () => {
        const market = choice([1_000_000_000, 2_000_000_000, 5_000_000_000]);
        const share = choice([5, 10, 20, 25]);
        const revenue = market * (share / 100);
        return {
          question: `Gesamtmarkt: **${formatCurrency(market)}**. Marktanteil: **${share}%**. Unser Umsatz?`,
          answer: revenue,
          formula: "Umsatz = Markt × Marktanteil",
          tip: `${share}% von ${formatCurrency(market)} = ${formatCurrency(revenue)}.`,
          name: "Marktanteil → Umsatz",
        };
      },
      () => {
        const population = choice([10_000_000, 40_000_000, 80_000_000]);
        const targetGroup = choice([25, 50]);
        const purchaseRate = choice([10, 20]);
        const customers = population * (targetGroup / 100) * (purchaseRate / 100);
        return {
          question: `Bevölkerung: **${formatNumber(population)}**. Zielgruppe: **${targetGroup}%**. Kaufrate: **${purchaseRate}%**. Potenzielle Kunden?`,
          answer: customers,
          formula: "Kunden = Bevölkerung × Zielgruppe% × Kaufrate%",
          tip: `${formatNumber(population)} × ${targetGroup}% × ${purchaseRate}% = ${formatNumber(customers)}.`,
          name: "Kundenberechnung",
        };
      },
    ];
    const scenario = choice(scenarios)();
    question = scenario.question;
    answer = scenario.answer;
    formula = scenario.formula;
    tip = scenario.tip;
    name = scenario.name;
  } else if (difficulty === 2) {
    const scenarios = [
      () => {
        const city = choice([500_000, 1_000_000, 2_000_000]);
        const coffeeRate = choice([30, 40, 50]);
        const pricePerCoffee = choice([3, 4, 5]);
        const dailyRevenue = city * (coffeeRate / 100) * pricePerCoffee;
        return {
          question: `Stadt: **${formatNumber(city)}** Einwohner. **${coffeeRate}%** trinken täglich Kaffee. **${formatCurrency(pricePerCoffee)}** pro Kaffee. Tagesumsatz?`,
          answer: dailyRevenue,
          formula: "Umsatz = Bevölkerung × Rate × Preis",
          tip: `${formatNumber(city)} × ${coffeeRate}% = ${formatNumber(city * coffeeRate / 100)} Trinker. × ${formatCurrency(pricePerCoffee)} = ${formatCurrency(dailyRevenue)}.`,
          name: "Bottom-up Sizing",
        };
      },
      () => {
        const currentMarket = choice([500_000_000, 1_000_000_000, 2_000_000_000]);
        const growthRate = choice([5, 7, 10]);
        const years = 5;
        // Use simple growth approximation
        const futureMarket = Math.round(currentMarket * (1 + (growthRate * years) / 100));
        return {
          question: `Markt wächst **${growthRate}%**/Jahr. Heute: **${formatCurrency(currentMarket)}**. Größe in **${years} Jahren**? (Nutze lineare Schätzung)`,
          answer: futureMarket,
          formula: "Zukunft ≈ Heute × (1 + Rate × Jahre)",
          tip: `Schätzung: ${growthRate}% × ${years} = ${growthRate * years}%. ${formatCurrency(currentMarket)} × ${1 + (growthRate * years) / 100} ≈ ${formatCurrency(futureMarket)}.`,
          name: "Marktwachstum (linear)",
        };
      },
    ];
    const scenario = choice(scenarios)();
    question = scenario.question;
    answer = scenario.answer;
    formula = scenario.formula;
    tip = scenario.tip;
    name = scenario.name;
  } else {
    const scenarios = [
      () => {
        const households = choice([20_000_000, 30_000_000, 40_000_000]);
        const internetRate = choice([80, 85, 90]);
        const streamingRate = choice([40, 50, 60]);
        const monthlyPrice = choice([10, 12, 15]);
        const yearlyRevenue = households * (internetRate / 100) * (streamingRate / 100) * monthlyPrice * 12;
        return {
          question: `**${formatNumber(households)}** Haushalte. **${internetRate}%** haben Internet. **${streamingRate}%** davon nutzen Streaming. **${formatCurrency(monthlyPrice)}/Monat**. Jahresumsatz des Streaming-Markts?`,
          answer: yearlyRevenue,
          formula: "Umsatz = Haushalte × Internet% × Streaming% × Preis × 12",
          tip: `Schrittweise: ${formatNumber(households)} × ${internetRate}% × ${streamingRate}% = ${formatNumber(households * internetRate / 100 * streamingRate / 100)} Abos. × ${formatCurrency(monthlyPrice)} × 12 = ${formatCurrency(yearlyRevenue)}.`,
          name: "Multi-Step Market Sizing",
        };
      },
      () => {
        const currentMarket = choice([1_000_000_000, 2_000_000_000, 5_000_000_000]);
        const growthRate = choice([8, 10, 12]);
        const years = 3;
        // Compound growth
        const futureMarket = Math.round(currentMarket * Math.pow(1 + growthRate / 100, years));
        const simpleApprox = Math.round(currentMarket * (1 + growthRate * years / 100));
        return {
          question: `Markt: **${formatCurrency(currentMarket)}**. Wächst **${growthRate}%** pro Jahr (Zinseszins). Größe in **${years} Jahren**?`,
          answer: futureMarket,
          formula: "Zukunft = Heute × (1 + Rate)^Jahre",
          tip: `Compound: ${formatCurrency(currentMarket)} × (1.${growthRate})^${years} ≈ ${formatCurrency(futureMarket)}. Schnelle Schätzung: ~${growthRate * years}% Wachstum.`,
          name: "Compound Growth",
        };
      },
    ];
    const scenario = choice(scenarios)();
    question = scenario.question;
    answer = scenario.answer;
    formula = scenario.formula;
    tip = scenario.tip;
    name = scenario.name;
  }
  
  const key = `msize:${question.slice(0, 40)}`;
  if (isInHistory(key)) return null;
  addToHistory(key);
  
  return {
    id: ++taskCounter,
    category: "market-sizing",
    question,
    highlightedQuestion: question,
    answer,
    shortcut: { name, formula, tip },
    difficulty,
  };
};

// ============================================
// MAIN GENERATOR
// ============================================
type ArchetypeGenerator = (difficulty: number) => CaseMathTask | null;

const archetypeGenerators: Record<CaseMathCategory, ArchetypeGenerator[]> = {
  "profitability": [generateProfitabilityTask, generateSavingsTask],
  "investment": [generateInvestmentTask],
  "breakeven": [generateBreakevenTask],
  "market-sizing": [generateMarketShareTask, generateMarketSizingTask],
};

export const generateCaseMathTask = (
  categories: CaseMathCategory[],
  difficulty: number
): CaseMathTask => {
  const maxAttempts = 100;
  
  for (let i = 0; i < maxAttempts; i++) {
    // Pick a random category from selected ones
    const category = choice(categories);
    
    // Pick a random archetype generator for that category
    const generators = archetypeGenerators[category];
    const generator = choice(generators);
    
    // Try to generate a unique task
    const task = generator(difficulty);
    if (task) {
      return task;
    }
  }
  
  // Fallback: Reset history and try again
  console.log("Case Math: Resetting history after max attempts");
  resetCaseMathHistory();
  
  const category = choice(categories);
  const generators = archetypeGenerators[category];
  const generator = choice(generators);
  
  return generator(difficulty) || {
    id: ++taskCounter,
    category: "profitability",
    question: "Umsatz: **€1 Mio**. Marge: **20%**. Gewinn?",
    highlightedQuestion: "Umsatz: **€1 Mio**. Marge: **20%**. Gewinn?",
    answer: 200_000,
    shortcut: {
      name: "Basis-Gewinn",
      formula: "Gewinn = Umsatz × Marge",
      tip: "20% von 1 Mio = 200k.",
    },
    difficulty,
  };
};

// Answer checking with tolerance
export const checkAnswer = (
  userInput: string,
  correctAnswer: number,
  isPercentage: boolean = false
): boolean => {
  if (!userInput || userInput.trim() === "") return false;
  
  let normalized = userInput.toLowerCase().trim();
  
  // Remove currency symbols and common prefixes
  normalized = normalized.replace(/[€$£¥]/g, "");
  normalized = normalized.replace(/^ca\.?\s*/i, "");
  
  // Handle German decimal format (comma as decimal separator)
  // First, handle cases like "1.000.000" (German thousands) or "1,5" (German decimal)
  if (normalized.includes(',') && normalized.includes('.')) {
    // "1.000,5" format - dots are thousands, comma is decimal
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else if (normalized.includes(',')) {
    // Could be "1,5" (decimal) or "1,000" (thousands)
    const parts = normalized.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Likely a decimal: "1,5" or "1,50"
      normalized = normalized.replace(',', '.');
    } else {
      // Likely thousands: "1,000"
      normalized = normalized.replace(/,/g, '');
    }
  }
  
  // Handle suffixes
  const suffixPatterns: { pattern: RegExp; multiplier: number }[] = [
    { pattern: /(\d+\.?\d*)\s*(mrd|milliarde|milliarden|b|billion|bn)/i, multiplier: 1_000_000_000 },
    { pattern: /(\d+\.?\d*)\s*(mio|million|millionen|m(?!rd))/i, multiplier: 1_000_000 },
    { pattern: /(\d+\.?\d*)\s*(k|tsd|tausend|thousand)/i, multiplier: 1_000 },
    { pattern: /(\d+\.?\d*)\s*%/, multiplier: 1 }, // Keep percentage as-is
  ];
  
  let numericValue: number | null = null;
  
  for (const { pattern, multiplier } of suffixPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      numericValue = parseFloat(match[1]) * multiplier;
      break;
    }
  }
  
  // If no suffix matched, try to parse as plain number
  if (numericValue === null) {
    // Remove any remaining non-numeric characters except decimal point and minus
    const cleanedNumber = normalized.replace(/[^\d.\-]/g, '');
    numericValue = parseFloat(cleanedNumber);
  }
  
  if (isNaN(numericValue)) return false;
  
  // Calculate tolerance (allow 1% deviation for rounding)
  const tolerance = Math.abs(correctAnswer) * 0.01;
  const difference = Math.abs(numericValue - correctAnswer);
  
  // For percentages displayed without decimal, also accept decimal form
  // e.g., if correct is 25, accept 0.25
  if (isPercentage && Math.abs(numericValue * 100 - correctAnswer) <= tolerance) {
    return true;
  }
  
  return difference <= tolerance || difference <= 0.5;
};
