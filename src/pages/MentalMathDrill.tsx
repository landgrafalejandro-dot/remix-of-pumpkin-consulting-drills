import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import DrillIcon from "@/components/DrillIcon";
import SprintConfig from "@/components/sprint/SprintConfig";
import SprintGame from "@/components/sprint/SprintGame";
import SprintDebrief from "@/components/sprint/SprintDebrief";
import { DifficultyLevel } from "@/components/DifficultySelector";
import { Task, TaskType, SprintDuration, SprintResult, SprintStats, GamePhase } from "@/types/drill";
import { checkAnswer } from "@/lib/taskGenerator";
import {
  fetchMentalMathTasks,
  getNextMentalMathTask,
  resetMentalMathSession,
  getMentalMathTaskCount,
} from "@/lib/mentalMathFetcher";
import { useUserEmail } from "@/hooks/useUserEmail";
import { saveDrillSession } from "@/lib/sessionTracker";

const DIFFICULTY_MAP: Record<DifficultyLevel, "easy" | "medium" | "hard"> = {
  1: "easy",
  2: "medium",
  3: "hard",
};

const Index = () => {
  const userEmail = useUserEmail();
  // Configuration state
  const [duration, setDuration] = useState<SprintDuration>(300);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [selectedTypes, setSelectedTypes] = useState<TaskType[]>(["multiplication", "percentage", "division", "zeros"]);

  // Game state
  const [phase, setPhase] = useState<GamePhase>("config");
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [flashState, setFlashState] = useState<"none" | "correct" | "incorrect">("none");
  const [isLoading, setIsLoading] = useState(false);

  // Results tracking
  const [results, setResults] = useState<SprintResult[]>([]);
  const [correctCount, setCorrectCount] = useState(0);

  // Refs for timing
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const taskStartTime = useRef<number>(0);
  const flashTimeout = useRef<NodeJS.Timeout | null>(null);

  // Generate next task from DB
  const generateNewTask = useCallback(() => {
    const task = getNextMentalMathTask();
    if (task) {
      setCurrentTask(task);
      taskStartTime.current = Date.now();
    } else {
      console.warn("No tasks available from DB");
    }
  }, []);

  // Start the sprint
  const handleStart = useCallback(async () => {
    setIsLoading(true);
    resetMentalMathSession();

    // Fetch tasks from DB
    await fetchMentalMathTasks(selectedTypes, DIFFICULTY_MAP[difficulty]);

    const count = getMentalMathTaskCount();
    if (count === 0) {
      setIsLoading(false);
      alert("Keine Aufgaben für diese Kombination in der Datenbank gefunden.");
      return;
    }

    setPhase("sprint");
    setTimeRemaining(duration);
    setResults([]);
    setCorrectCount(0);
    setFlashState("none");
    setIsLoading(false);
    generateNewTask();

    // Start the countdown timer
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
  }, [duration, generateNewTask, selectedTypes, difficulty]);

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
    const isPercentageResult = currentTask.type === "percentage" || currentTask.type === "growth";
    const isCorrect = checkAnswer(userAnswer, currentTask.answer, isPercentageResult);

    const result: SprintResult = {
      task: currentTask,
      userAnswer,
      isCorrect,
      timeSpent,
    };

    setResults(prev => [...prev, result]);

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }

    // Flash feedback
    setFlashState(isCorrect ? "correct" : "incorrect");

    // Clear flash and load next task after 200ms
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    flashTimeout.current = setTimeout(() => {
      setFlashState("none");
      generateNewTask();
    }, 200);
  }, [currentTask, phase, generateNewTask]);

  // Save session when entering debrief
  const prevPhaseRef = useRef<GamePhase>("config");
  useEffect(() => {
    if (phase === "debrief" && prevPhaseRef.current === "sprint" && userEmail && results.length > 0) {
      const acc = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;
      saveDrillSession({
        userEmail,
        drillType: "mental_math",
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
  const stats: SprintStats = {
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
        <div className="mb-4">
          <DrillIcon />
        </div>
        <h1 className="mb-2 text-center text-3xl font-bold text-foreground md:text-4xl">
          Consulting Mental Math Drill
        </h1>
        <p className="max-w-md text-center text-muted-foreground">
          {phase === "config" && "Trainiere deine Rechengeschwindigkeit unter Zeitdruck."}
          {phase === "sprint" && "Löse so viele Aufgaben wie möglich!"}
          {phase === "debrief" && "Analysiere deine Ergebnisse."}
        </p>
        <Link
          to={userEmail ? `/?email=${encodeURIComponent(userEmail)}` : "/"}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          ← Zurück zum Hauptmenü
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center px-4 pb-12">
        <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-xl">
          {phase === "config" && (
            <>
              <SprintConfig
                duration={duration}
                onDurationChange={setDuration}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                selectedTypes={selectedTypes}
                onTypesChange={setSelectedTypes}
                onStart={handleStart}
              />
              {isLoading && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Lade Aufgaben aus der Datenbank…
                </p>
              )}
            </>
          )}

          {phase === "sprint" && (
            <SprintGame
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
            <SprintDebrief
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

export default Index;
