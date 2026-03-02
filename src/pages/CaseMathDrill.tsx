import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import NavHeader from "@/components/NavHeader";
import { useUserEmail } from "@/hooks/useUserEmail";
import { saveDrillSession, saveDrillAttempts } from "@/lib/sessionTracker";
import { FileText, ArrowLeft } from "lucide-react";
import CaseMathConfig from "@/components/caseMath/CaseMathConfig";
import CaseMathGame from "@/components/caseMath/CaseMathGame";
import CaseMathDebrief from "@/components/caseMath/CaseMathDebrief";
import { DifficultyLevel } from "@/components/DifficultySelector";
import { SprintDuration } from "@/types/drill";
import { CaseMathTask, CaseMathCategory, CaseMathResult, CaseMathStats, CaseMathPhase } from "@/types/caseMath";
import { fetchCaseMathTasks, getNextCaseMathTask, resetCaseMathSession, checkCaseMathAnswer } from "@/lib/caseMathFetcher";
import { loadCaseMathExplanationTemplates, getCaseMathExplanation } from "@/lib/caseMathExplanationMatcher";

const CaseMathDrill = () => {
  const userEmail = useUserEmail();
  const [duration, setDuration] = useState<SprintDuration>(300);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [selectedCategories, setSelectedCategories] = useState<CaseMathCategory[]>(["profitability", "investment", "breakeven"]);
  const [phase, setPhase] = useState<CaseMathPhase>("config");
  const [currentTask, setCurrentTask] = useState<CaseMathTask | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [flashState, setFlashState] = useState<"none" | "correct" | "incorrect">("none");
  const [results, setResults] = useState<CaseMathResult[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const taskStartTime = useRef<number>(0);
  const flashTimeout = useRef<NodeJS.Timeout | null>(null);

  const buildLink = (path: string) =>
    userEmail ? `${path}?email=${encodeURIComponent(userEmail)}` : path;

  const generateNewTask = useCallback(() => {
    const task = getNextCaseMathTask();
    setCurrentTask(task);
    taskStartTime.current = Date.now();
  }, []);

  const handleStart = useCallback(async () => {
    const diffMap: Record<DifficultyLevel, "easy" | "medium" | "hard"> = { 1: "easy", 2: "medium", 3: "hard" };
    await Promise.all([
      fetchCaseMathTasks(selectedCategories, diffMap[difficulty]),
      loadCaseMathExplanationTemplates(),
    ]);
    resetCaseMathSession();
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
  }, [duration, generateNewTask, selectedCategories, difficulty]);

  const handleEndEarly = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    setPhase("debrief");
  }, []);

  const handleSubmit = useCallback((userAnswer: string) => {
    if (!currentTask || phase !== "sprint") return;
    const timeSpent = Date.now() - taskStartTime.current;
    const isCorrect = checkCaseMathAnswer(userAnswer, currentTask.answer, currentTask.tolerance || 0);
    const explanation = currentTask.dbTaskType && currentTask.dbDifficulty
      ? getCaseMathExplanation(currentTask.question, currentTask.dbTaskType, currentTask.dbDifficulty) ?? undefined
      : undefined;
    const result: CaseMathResult = { task: currentTask, userAnswer, isCorrect, timeSpent, explanation };
    setResults(prev => [...prev, result]);
    if (isCorrect) setCorrectCount(prev => prev + 1);
    setFlashState(isCorrect ? "correct" : "incorrect");
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    flashTimeout.current = setTimeout(() => {
      setFlashState("none");
      generateNewTask();
    }, 200);
  }, [currentTask, phase, generateNewTask]);

  const sprintStartTime = useRef<number>(0);
  const prevPhaseRef = useRef<CaseMathPhase>("config");
  useEffect(() => {
    if (phase === "sprint") sprintStartTime.current = Date.now();
    if (phase === "debrief" && prevPhaseRef.current === "sprint" && userEmail && results.length > 0) {
      const actualSeconds = Math.round((Date.now() - sprintStartTime.current) / 1000);
      const acc = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;
      const diffMap: Record<number, string> = { 1: "easy", 2: "medium", 3: "hard" };
      const diffLabel = diffMap[difficulty] || "medium";
      saveDrillSession({
        userEmail, drillType: "case_math", correctCount, totalCount: results.length,
        accuracyPercent: acc, durationSeconds: actualSeconds,
      }).then((sessionId) => {
        saveDrillAttempts({
          userEmail, drillType: "case_math", sessionId,
          attempts: results.map((r) => ({
            taskType: r.task.category, isCorrect: r.isCorrect, responseTimeMs: r.timeSpent, difficulty: diffLabel,
          })),
        });
      });
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  const handleRestart = useCallback(() => {
    setPhase("config");
    setCurrentTask(null);
    setResults([]);
    setCorrectCount(0);
    setTimeRemaining(0);
    setFlashState("none");
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (flashTimeout.current) clearTimeout(flashTimeout.current);
    };
  }, []);

  const stats: CaseMathStats = {
    totalAttempted: results.length,
    correctCount,
    accuracyPercent: results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0,
    tasksPerMinute: results.length > 0 ? (results.length / (duration / 60)) : 0,
    durationSeconds: duration,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {phase === "config" ? (
        <NavHeader showStats={false} />
      ) : phase === "sprint" ? (
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <span className="font-logo text-logo text-foreground">pumpkin.</span>
          <button
            onClick={handleEndEarly}
            className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
          >
            Beenden ✕
          </button>
        </header>
      ) : null}

      {phase === "config" && (
        <>
          <section className="flex flex-col items-center px-4 pt-8 pb-4">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mb-2 text-center text-h2 text-foreground">Case Math Drill</h1>
            <p className="max-w-md text-center text-body text-secondary-foreground">
              Business-Textaufgaben unter Zeitdruck lösen.
            </p>
            <Link to={buildLink("/")} className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" /> Zurück zum Dashboard
            </Link>
          </section>
          <main className="flex flex-1 flex-col items-center px-4 pb-12">
            <div className="w-full max-w-drill rounded-2xl border border-border bg-card p-card-padding">
              <CaseMathConfig
                duration={duration} onDurationChange={setDuration}
                difficulty={difficulty} onDifficultyChange={setDifficulty}
                selectedCategories={selectedCategories} onCategoriesChange={setSelectedCategories}
                onStart={handleStart}
              />
            </div>
          </main>
        </>
      )}

      {phase === "sprint" && (
        <main className="flex flex-1 flex-col items-center px-4 py-8">
          <div className="w-full max-w-drill rounded-2xl border border-border bg-card p-card-padding">
            <CaseMathGame
              task={currentTask} timeRemaining={timeRemaining} totalDuration={duration}
              difficulty={difficulty} correctCount={correctCount} totalAttempted={results.length}
              flashState={flashState} onSubmit={handleSubmit} onEnd={handleEndEarly}
            />
          </div>
        </main>
      )}

      {phase === "debrief" && (
        <>
          <NavHeader showStats={false} />
          <section className="flex flex-col items-center px-4 pt-8 pb-4">
            <Link to={buildLink("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" /> Zurück zum Dashboard
            </Link>
          </section>
          <main className="flex flex-1 flex-col items-center px-4 pb-12">
            <div className="w-full max-w-drill rounded-2xl border border-border bg-card p-card-padding">
              <CaseMathDebrief stats={stats} results={results} onRestart={handleRestart} />
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default CaseMathDrill;
