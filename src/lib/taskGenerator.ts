import { Task, TaskType } from "@/types/drill";

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

// Random choice helper
const choice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generate multiplication task
const generateMultiplication = (difficulty: number): Task => {
  const bases = difficulty < 3 
    ? [1000, 5000, 10000, 15000, 20000]
    : [7500, 12500, 17000, 23000, 35000];
  
  const multipliers = difficulty < 3 
    ? [1.5, 2, 2.5, 3, 4, 5]
    : [1.7, 2.3, 3.5, 4.5, 0.8, 1.25];

  const base = choice(bases);
  const mult = choice(multipliers);
  const answer = base * mult;
  
  const useAbbrev = Math.random() > 0.5;
  const multStr = mult.toString().replace('.', ',');
  
  return {
    id: ++taskCounter,
    type: "multiplication",
    question: `${formatNumber(base, useAbbrev)} × ${multStr}`,
    answer,
    shortcut: `${formatNumber(base)}×${mult} = ${formatNumber(answer)}. Tipp: Zerlege in einfache Faktoren.`,
    difficulty,
  };
};

// Generate percentage task
const generatePercentage = (difficulty: number): Task => {
  const bases = difficulty < 3 
    ? [50_000_000, 80_000_000, 100_000_000, 200_000_000]
    : [75_000_000, 120_000_000, 180_000_000, 350_000_000];
  
  const percentages = difficulty < 3 
    ? [10, 20, 25, 50, 5]
    : [15, 17, 35, 12.5, 8];

  const base = choice(bases);
  const pct = choice(percentages);
  const answer = (base * pct) / 100;
  
  const useAbbrev = Math.random() > 0.3;
  const pctStr = pct.toString().replace('.', ',');
  
  return {
    id: ++taskCounter,
    type: "percentage",
    question: `${pctStr}% von ${formatNumber(base, useAbbrev)}`,
    answer,
    shortcut: `${pctStr}% = ${pctStr}/100. Ergebnis: ${formatNumber(answer, true)}`,
    difficulty,
  };
};

// Generate division task
const generateDivision = (difficulty: number): Task => {
  const dividends = difficulty < 3 
    ? [420_000, 630_000, 840_000, 1_200_000]
    : [455_000, 728_000, 1_050_000, 1_890_000];
  
  const divisors = difficulty < 3 
    ? [700, 900, 1200, 1500]
    : [650, 850, 1400, 1750];

  const dividend = choice(dividends);
  const divisor = choice(divisors);
  const answer = dividend / divisor;
  
  const useAbbrev = Math.random() > 0.5;
  
  return {
    id: ++taskCounter,
    type: "division",
    question: `${formatNumber(dividend, useAbbrev)} / ${formatNumber(divisor, useAbbrev)}`,
    answer: Math.round(answer * 100) / 100,
    shortcut: `Streiche gemeinsame Nullen. ${formatNumber(dividend)} / ${formatNumber(divisor)} = ${answer.toFixed(2).replace('.', ',')}`,
    difficulty,
  };
};

// Generate zeros management task
const generateZeros = (difficulty: number): Task => {
  const scenarios = [
    { dividend: 1_500_000_000, divisor: 300_000, answer: 5000 },
    { dividend: 2_400_000_000, divisor: 600_000, answer: 4000 },
    { dividend: 900_000_000, divisor: 150_000, answer: 6000 },
    { dividend: 3_600_000_000, divisor: 900_000, answer: 4000 },
  ];
  
  const scenario = choice(scenarios);
  const useMixed = Math.random() > 0.5;
  
  return {
    id: ++taskCounter,
    type: "zeros",
    question: useMixed 
      ? `${formatNumber(scenario.dividend, true)} / ${formatNumber(scenario.divisor, true)}`
      : `${formatNumber(scenario.dividend)} / ${formatNumber(scenario.divisor)}`,
    answer: scenario.answer,
    shortcut: `Kürze systematisch: ${formatNumber(scenario.dividend, true)} / ${formatNumber(scenario.divisor, true)} = ${formatNumber(scenario.answer)}`,
    difficulty,
  };
};

// Generate growth/delta task
const generateGrowth = (difficulty: number): Task => {
  const bases = difficulty < 3 
    ? [50_000_000, 100_000_000, 200_000_000]
    : [75_000_000, 150_000_000, 320_000_000];
  
  const growthRates = difficulty < 3 
    ? [2, 2.5, 5, 10]
    : [1.5, 3.5, 7.5, 12];

  const base = choice(bases);
  const rate = choice(growthRates);
  const growth = (base * rate) / 100;
  const answer = base + growth;
  
  const rateStr = rate.toString().replace('.', ',');
  
  return {
    id: ++taskCounter,
    type: "growth",
    question: `${formatNumber(base, true)} + ${rateStr}%`,
    answer,
    shortcut: `${rateStr}% von ${formatNumber(base, true)} = ${formatNumber(growth, true)}. Summe: ${formatNumber(answer, true)}`,
    difficulty,
  };
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

// Check if answer is correct (with tolerance for rounding)
export const checkAnswer = (userAnswer: number, correctAnswer: number): boolean => {
  const tolerance = Math.abs(correctAnswer) * 0.01; // 1% tolerance
  return Math.abs(userAnswer - correctAnswer) <= tolerance;
};

// Generate error hint
export const generateErrorHint = (userAnswer: number, correctAnswer: number): string => {
  const ratio = userAnswer / correctAnswer;
  
  if (Math.abs(ratio - 10) < 0.1) return "Eine Null zu viel!";
  if (Math.abs(ratio - 0.1) < 0.01) return "Eine Null zu wenig!";
  if (Math.abs(ratio - 100) < 1) return "Zwei Nullen zu viel!";
  if (Math.abs(ratio - 0.01) < 0.001) return "Zwei Nullen zu wenig!";
  if (Math.abs(ratio - 1000) < 10) return "Drei Nullen zu viel!";
  if (Math.abs(ratio - 0.001) < 0.0001) return "Drei Nullen zu wenig!";
  
  return "Überprüfe deinen Rechenweg Schritt für Schritt.";
};
