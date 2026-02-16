import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useUserEmail } from "@/hooks/useUserEmail";
import { saveDrillSession } from "@/lib/sessionTracker";
import { FileText } from "lucide-react";
import CaseMathConfig from "@/components/caseMath/CaseMathConfig";
import CaseMathGame from "@/components/caseMath/CaseMathGame";
import CaseMathDebrief from "@/components/caseMath/CaseMathDebrief";
import { DifficultyLevel } from "@/components/DifficultySelector";
import { SprintDuration } from "@/types/drill";
import { 
  CaseMathTask, 
  CaseMathCategory, 
  CaseMathResult, 
  CaseMathStats, 
  CaseMathPhase 
} from "@/types/caseMath";
import { generateCaseMathTask, resetCaseMathHistory, checkAnswer } from "@/lib/caseMathGenerator";

const CaseMathDrill = () => {
  const userEmail = useUserEmail();
  // Configuration state
  const [duration, setDuration] = useState<SprintDuration>(300);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [selectedCategories, setSelectedCategories] = useState<CaseMathCategory[]>([
    "profitability", 
    "investment", 
    "breakeven", 
    "market-sizing"
  ]);
  
  // Game state
  const [phase, setPhase] = useState<CaseMathPhase>("config");
  const [currentTask, setCurrentTask] = useState<CaseMathTask | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [flashState, setFlashState] = useState<"none" | "correct" | "incorrect">("none");
  
  // Results tracking
  const [results, setResults] = useState<CaseMathResult[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  
  // Refs for timing
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const taskStartTime = useRef<number>(0);
  const flashTimeout = useRef<NodeJS.Timeout | null>(null);

  // Generate a new task based on selected categories
  const generateNewTask = useCallback(() => {
    const task = generateCaseMathTask(selectedCategories, difficulty);
    setCurrentTask(task);
    taskStartTime.current = Date.now();
  }, [selectedCategories, difficulty]);

  // Start the sprint
  const handleStart = useCallback(() => {
    resetCaseMathHistory();
    setPhase("sprint");
    setTimeRemaining(duration);
    setResults([]);
    setCorrectCount(0);
    setFlashState("none");
    generateNewTask();

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase("debrief");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [duration, generateNewTask]);

  // End the sprint early
  const handleEndEarly = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    setPhase("debrief");
  }, []);

  // Handle answer submission
  const handleSubmit = useCallback((userAnswer: string) => {
    if (!currentTask || phase !== "sprint") return;

    const timeSpent = Date.now() - taskStartTime.current;
    const isCorrect = checkAnswer(userAnswer, currentTask.answer, false);

    const result: CaseMathResult = {
      task: currentTask,
      userAnswer,
      isCorrect,
      timeSpent,
    };
    
    setResults(prev => [...prev, result]);
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }

    setFlashState(isCorrect ? "correct" : "incorrect");
    
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    flashTimeout.current = setTimeout(() => {
      setFlashState("none");
      generateNewTask();
    }, 200);
  }, [currentTask, phase, generateNewTask]);

  // Save session when entering debrief
  const prevPhaseRef = useRef<CaseMathPhase>("config");
  useEffect(() => {
    if (phase === "debrief" && prevPhaseRef.current === "sprint" && userEmail && results.length > 0) {
      const acc = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;
      saveDrillSession({
        userEmail,
        drillType: "case_math",
        correctCount,
        totalCount: results.length,
        accuracyPercent: acc,
        durationSeconds: duration,
      });
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  // Restart the game
  const handleRestart = useCallback(() => {
    setPhase("config");
    setCurrentTask(null);
    setResults([]);
    setCorrectCount(0);
    setTimeRemaining(0);
    setFlashState("none");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (flashTimeout.current) clearTimeout(flashTimeout.current);
    };
  }, []);

  // Calculate stats for debrief
  const stats: CaseMathStats = {
    totalAttempted: results.length,
    correctCount,
    accuracyPercent: results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0,
    tasksPerMinute: results.length > 0 ? (results.length / (duration / 60)) : 0,
    durationSeconds: duration,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex flex-col items-center px-4 pt-12 pb-6">
        <Link to="/" className="mb-4 transition-opacity hover:opacity-80">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
            <FileText className="h-7 w-7 text-primary" />
          </div>
        </Link>
        <h1 className="mb-2 text-center text-3xl font-bold text-foreground md:text-4xl">
          Case Math Drill
        </h1>
        <p className="max-w-md text-center text-muted-foreground">
          {phase === "config" && "Business-Textaufgaben unter Zeitdruck lösen."}
          {phase === "sprint" && "Analysiere das Problem und berechne die Lösung!"}
          {phase === "debrief" && "Analysiere deine Ergebnisse."}
        </p>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center px-4 pb-12">
        <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-xl">
          {phase === "config" && (
            <CaseMathConfig
              duration={duration}
              onDurationChange={setDuration}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              onStart={handleStart}
            />
          )}

          {phase === "sprint" && (
            <CaseMathGame
              task={currentTask}
              timeRemaining={timeRemaining}
              totalDuration={duration}
              difficulty={difficulty}
              correctCount={correctCount}
              totalAttempted={results.length}
              flashState={flashState}
              onSubmit={handleSubmit}
              onEnd={handleEndEarly}
            />
          )}

          {phase === "debrief" && (
            <CaseMathDebrief
              stats={stats}
              results={results}
              onRestart={handleRestart}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default CaseMathDrill;
