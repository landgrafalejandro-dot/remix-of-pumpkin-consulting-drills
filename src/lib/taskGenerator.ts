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
  
  // Determine best shortcut technique
  let shortcut: ShortcutInfo;
  
  if (mult === 2.5 || mult === 1.5 || mult === 3.5 || mult === 4.5) {
    const wholepart = Math.floor(mult);
    const decimalPart = mult - wholepart;
    
    shortcut = {
      name: "Distributivgesetz (Split & Calculate)",
      description: "Zerlege krumme Zahlen in glatte Blöcke. Rechne jeden Block einzeln und addiere die Ergebnisse. Besonders effektiv bei Dezimalzahlen wie 1,5 oder 2,5.",
      steps: [
        `Zerlege ${bold(multStr)} in ${bold(wholepart)} + ${bold((decimalPart).toString().replace('.', ','))}`,
        `${bold(formatNumber(base))} × ${wholepart} = ${bold(formatNumber(base * wholepart))}`,
        `${bold(formatNumber(base))} × ${decimalPart.toString().replace('.', ',')} = ${bold(formatNumber(base * decimalPart))}`,
        `Ergebnis: ${bold(formatNumber(answer))}`
      ]
    };
  } else if (mult === 1.25) {
    shortcut = {
      name: "Prozent-Trick (125% = 100% + 25%)",
      description: "Wandle den Multiplikator in Prozente um. 1,25 = 125% = 100% + 25%. Berechne 25% als Viertel der Basis.",
      steps: [
        `${bold("1,25")} = 1 + 0,25 = 1 + ¼`,
        `100%: ${bold(formatNumber(base))}`,
        `25% (÷4): ${bold(formatNumber(base / 4))}`,
        `Ergebnis: ${bold(formatNumber(answer))}`
      ]
    };
  } else {
    shortcut = {
      name: "Direkte Multiplikation",
      description: "Bei glatten Faktoren: Multipliziere direkt. Nutze bekannte Einmaleins-Fakten und verschiebe Nullen nach Bedarf.",
      steps: [
        `Rechne ${bold(formatNumber(base))} × ${bold(multStr)}`,
        `Ergebnis: ${bold(formatNumber(answer))}`
      ]
    };
  }
  
  return {
    id: ++taskCounter,
    type: "multiplication",
    question: `${formatNumber(base, useAbbrev)} × ${multStr}`,
    answer,
    shortcut,
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
  
  let shortcut: ShortcutInfo;
  
  if (pct === 10 || pct === 20 || pct === 50) {
    const divisor = 100 / pct;
    shortcut = {
      name: "Block-Methode (Einfache Prozente)",
      description: "Rechne nie 0,XX × Y. Nutze stattdessen Brüche: 10% = ÷10, 20% = ÷5, 50% = ÷2. Das Komma-Verschieben ist schneller als Dezimalmultiplikation.",
      steps: [
        `${bold(pctStr + "%")} = 1/${divisor}`,
        `${bold(formatNumber(base, true))} ÷ ${divisor} = ${bold(formatNumber(answer, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (pct === 25) {
    shortcut = {
      name: "Block-Methode (Viertel)",
      description: "25% = ¼. Teile einfach durch 4. Bei großen Zahlen: Erst durch 2, dann nochmal durch 2.",
      steps: [
        `${bold("25%")} = ¼`,
        `${bold(formatNumber(base, true))} ÷ 4 = ${bold(formatNumber(answer, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (pct === 12.5) {
    shortcut = {
      name: "Block-Methode (Achtel)",
      description: "12,5% = ⅛. Merke dir: 12,5% ist ein Achtel. Teile durch 8 (oder 3× durch 2).",
      steps: [
        `${bold("12,5%")} = ⅛`,
        `${bold(formatNumber(base, true))} ÷ 8 = ${bold(formatNumber(answer, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (pct === 15) {
    const ten = base * 0.1;
    const five = ten / 2;
    shortcut = {
      name: "Block-Methode (10% + 5%)",
      description: "Zerlege den Prozentsatz in einfache Blöcke. 15% = 10% + 5%. Berechne 10% (Komma verschieben), dann 5% als Hälfte davon.",
      steps: [
        `Zerlege ${bold("15%")} in ${bold("10%")} + ${bold("5%")}`,
        `10% von ${formatNumber(base, true)} = ${bold(formatNumber(ten, true))}`,
        `5% = Hälfte von 10% = ${bold(formatNumber(five, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (pct === 35) {
    const twentyfive = base * 0.25;
    const ten = base * 0.1;
    shortcut = {
      name: "Block-Methode (25% + 10%)",
      description: "Zerlege krumme Prozentsätze in bekannte Blöcke. 35% = 25% + 10%. Nutze bekannte Brüche (¼) und einfache Prozente (10%).",
      steps: [
        `Zerlege ${bold("35%")} in ${bold("25%")} + ${bold("10%")}`,
        `25% (÷4) = ${bold(formatNumber(twentyfive, true))}`,
        `10% = ${bold(formatNumber(ten, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  } else {
    const tenPct = base * 0.1;
    shortcut = {
      name: "Block-Methode",
      description: "Starte immer mit 10% (Komma um 1 nach links). Dann skaliere: 8% = 10% - 2%, 17% = 10% + 5% + 2%.",
      steps: [
        `10% von ${formatNumber(base, true)} = ${bold(formatNumber(tenPct, true))}`,
        `${pctStr}% = ${pct / 10} × 10% = ${bold(formatNumber(answer, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  }
  
  return {
    id: ++taskCounter,
    type: "percentage",
    question: `${pctStr}% von ${formatNumber(base, useAbbrev)}`,
    answer,
    shortcut,
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
  const roundedAnswer = Math.round(answer * 100) / 100;
  
  const useAbbrev = Math.random() > 0.5;
  
  // Find common zeros to cancel
  let tempDividend = dividend;
  let tempDivisor = divisor;
  let zerosRemoved = 0;
  
  while (tempDividend % 10 === 0 && tempDivisor % 10 === 0) {
    tempDividend /= 10;
    tempDivisor /= 10;
    zerosRemoved++;
  }
  
  const shortcut: ShortcutInfo = {
    name: "Kürzen & Verschieben",
    description: "Bei Division großer Zahlen: Streiche gemeinsame Nullen auf beiden Seiten. Das Ergebnis bleibt gleich, die Rechnung wird einfacher.",
    steps: [
      `Streiche ${bold(zerosRemoved)} gemeinsame Nullen`,
      `${formatNumber(dividend)} / ${formatNumber(divisor)} → ${bold(formatNumber(tempDividend))} / ${bold(formatNumber(tempDivisor))}`,
      `${formatNumber(tempDividend)} ÷ ${formatNumber(tempDivisor)} = ${bold(roundedAnswer.toString().replace('.', ','))}`,
      `Ergebnis: ${bold(roundedAnswer.toString().replace('.', ','))}`
    ]
  };
  
  return {
    id: ++taskCounter,
    type: "division",
    question: `${formatNumber(dividend, useAbbrev)} / ${formatNumber(divisor, useAbbrev)}`,
    answer: roundedAnswer,
    shortcut,
    difficulty,
  };
};

// Generate zeros management task
const generateZeros = (difficulty: number): Task => {
  const scenarios = [
    { dividend: 1_500_000_000, divisor: 300_000, answer: 5000, divUnit: "Mrd", divisorUnit: "k", resultUnit: "k" },
    { dividend: 2_400_000_000, divisor: 600_000, answer: 4000, divUnit: "Mrd", divisorUnit: "k", resultUnit: "k" },
    { dividend: 900_000_000, divisor: 150_000, answer: 6000, divUnit: "Mio", divisorUnit: "k", resultUnit: "k" },
    { dividend: 3_600_000_000, divisor: 900_000, answer: 4000, divUnit: "Mrd", divisorUnit: "k", resultUnit: "k" },
    { dividend: 30_000_000, divisor: 500_000, answer: 60, divUnit: "Mio", divisorUnit: "k", resultUnit: "" },
  ];
  
  const scenario = choice(scenarios);
  const useMixed = Math.random() > 0.5;
  
  // Calculate unit values for explanation
  const divInUnit = scenario.dividend / (scenario.divUnit === "Mrd" ? 1_000_000_000 : 1_000_000);
  const divisorInK = scenario.divisor / 1000;
  
  const shortcut: ShortcutInfo = {
    name: "Nullen-Management (Unit Game)",
    description: "Bei großen Zahlen (Mio, Mrd, k): Rechne NIEMALS mit Nullen. Nutze Einheiten und merke dir: k × k = M, M × k = Mrd, M / k = k.",
    steps: [
      `Regel: ${bold("k · k = M")} | ${bold("M · k = Mrd")} | ${bold("M / k = k")}`,
      `Rechne in Einheiten: ${bold(divInUnit + " " + scenario.divUnit)} / ${bold(divisorInK + "k")}`,
      `${divInUnit} ${scenario.divUnit} = ${divInUnit * (scenario.divUnit === "Mrd" ? 1000 : 1)} Mio`,
      `Mio / k = k → ${bold(formatNumber(scenario.answer))}`,
      `Ergebnis: ${bold(formatNumber(scenario.answer))}`
    ]
  };
  
  return {
    id: ++taskCounter,
    type: "zeros",
    question: useMixed 
      ? `${formatNumber(scenario.dividend, true)} / ${formatNumber(scenario.divisor, true)}`
      : `${formatNumber(scenario.dividend)} / ${formatNumber(scenario.divisor)}`,
    answer: scenario.answer,
    shortcut,
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
  
  let shortcut: ShortcutInfo;
  
  if (rate === 10) {
    shortcut = {
      name: "Block-Methode (10%)",
      description: "10% ist der einfachste Prozentsatz: Verschiebe das Komma um 1 Stelle nach links. Dann addiere zur Basis.",
      steps: [
        `${bold("10%")} = Komma um 1 nach links`,
        `10% von ${formatNumber(base, true)} = ${bold(formatNumber(growth, true))}`,
        `${formatNumber(base, true)} + ${formatNumber(growth, true)} = ${bold(formatNumber(answer, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (rate === 5) {
    shortcut = {
      name: "Block-Methode (5% = 10% ÷ 2)",
      description: "5% ist die Hälfte von 10%. Berechne zuerst 10% (Komma verschieben), dann halbieren.",
      steps: [
        `10% von ${formatNumber(base, true)} = ${bold(formatNumber(base * 0.1, true))}`,
        `5% = Hälfte = ${bold(formatNumber(growth, true))}`,
        `${formatNumber(base, true)} + ${formatNumber(growth, true)} = ${bold(formatNumber(answer, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  } else if (rate === 2.5) {
    shortcut = {
      name: "Block-Methode (2,5% = 10% ÷ 4)",
      description: "2,5% ist ein Viertel von 10%. Berechne 10%, dann teile durch 4 (oder 2× durch 2).",
      steps: [
        `10% von ${formatNumber(base, true)} = ${bold(formatNumber(base * 0.1, true))}`,
        `2,5% = ¼ von 10% = ${bold(formatNumber(growth, true))}`,
        `${formatNumber(base, true)} + ${formatNumber(growth, true)} = ${bold(formatNumber(answer, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  } else {
    const tenPct = base * 0.1;
    shortcut = {
      name: "Block-Methode",
      description: "Zerlege den Prozentsatz in 10%-Blöcke. Berechne 10% als Basis, dann skaliere auf den gewünschten Wert.",
      steps: [
        `10% von ${formatNumber(base, true)} = ${bold(formatNumber(tenPct, true))}`,
        `${rateStr}% = ${rate / 10} × 10% = ${bold(formatNumber(growth, true))}`,
        `${formatNumber(base, true)} + ${formatNumber(growth, true)} = ${bold(formatNumber(answer, true))}`,
        `Ergebnis: ${bold(formatNumber(answer, true))}`
      ]
    };
  }
  
  return {
    id: ++taskCounter,
    type: "growth",
    question: `${formatNumber(base, true)} + ${rateStr}%`,
    answer,
    shortcut,
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
  
  if (Math.abs(ratio - 10) < 0.1) return "Eine Null zu viel! Überprüfe die Größenordnung.";
  if (Math.abs(ratio - 0.1) < 0.01) return "Eine Null zu wenig! Überprüfe die Größenordnung.";
  if (Math.abs(ratio - 100) < 1) return "Zwei Nullen zu viel! Nutze das Unit Game.";
  if (Math.abs(ratio - 0.01) < 0.001) return "Zwei Nullen zu wenig! Nutze das Unit Game.";
  if (Math.abs(ratio - 1000) < 10) return "Drei Nullen zu viel! k · k = M, nicht Mrd.";
  if (Math.abs(ratio - 0.001) < 0.0001) return "Drei Nullen zu wenig! M / k = k.";
  
  return "Überprüfe deinen Rechenweg Schritt für Schritt.";
};
