import React, { useState, useCallback, useEffect, useRef } from "react";
import DrillIcon from "@/components/DrillIcon";
import TaskTypeSelector from "@/components/TaskTypeSelector";
import TaskDisplay from "@/components/TaskDisplay";
import AnswerInput from "@/components/AnswerInput";
import FeedbackDisplay from "@/components/FeedbackDisplay";
import StatsDisplay from "@/components/StatsDisplay";
import DifficultySelector, { DifficultyLevel } from "@/components/DifficultySelector";
import LevelPrompt from "@/components/LevelPrompt";
import { Task, TaskType, FeedbackState } from "@/types/drill";
import { generateTask, checkAnswer, generateErrorHint } from "@/lib/taskGenerator";

const levelNames: Record<DifficultyLevel, string> = {
  1: "Einfach",
  2: "Mittel",
  3: "Schwer",
};

const Index = () => {
  const [selectedType, setSelectedType] = useState<TaskType>("all");
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0, wrongStreak: 0 });
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [isStarted, setIsStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [levelPrompt, setLevelPrompt] = useState<{ type: "up" | "down"; target: DifficultyLevel } | null>(null);
  
  const taskStartTime = useRef<number>(0);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    taskStartTime.current = Date.now();
    setElapsedTime(0);
    
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    timerInterval.current = setInterval(() => {
      setElapsedTime(Date.now() - taskStartTime.current);
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    return Date.now() - taskStartTime.current;
  }, []);

  const createNewTask = useCallback(() => {
    const task = generateTask(selectedType, difficulty);
    setCurrentTask(task);
    setFeedback(null);
    setLevelPrompt(null);
    startTimer();
  }, [selectedType, difficulty, startTimer]);

  const handleStart = () => {
    setIsStarted(true);
    createNewTask();
  };

  const handleSubmit = (userAnswer: string) => {
    if (!currentTask) return;

    const reactionTime = stopTimer();
    const isPercentageResult = currentTask.type === "percentage" || currentTask.type === "growth";
    const isCorrect = checkAnswer(userAnswer, currentTask.answer, isPercentageResult);
    
    setFeedback({
      isCorrect,
      userAnswer,
      correctAnswer: currentTask.answer,
      shortcut: currentTask.shortcut,
      errorHint: isCorrect ? undefined : generateErrorHint(userAnswer, currentTask.answer),
      reactionTime,
    });

    const newStreak = isCorrect ? stats.streak + 1 : 0;
    const newWrongStreak = isCorrect ? 0 : stats.wrongStreak + 1;

    setStats({
      correct: stats.correct + (isCorrect ? 1 : 0),
      total: stats.total + 1,
      streak: newStreak,
      wrongStreak: newWrongStreak,
    });

    // Check for level up prompt (3 correct in a row, fast answers)
    if (isCorrect && newStreak >= 3 && difficulty < 3 && reactionTime < 15000) {
      setLevelPrompt({ type: "up", target: (difficulty + 1) as DifficultyLevel });
    }

    // Check for level down prompt (3 wrong in a row)
    if (!isCorrect && newWrongStreak >= 3 && difficulty > 1) {
      setLevelPrompt({ type: "down", target: (difficulty - 1) as DifficultyLevel });
    }
  };

  const handleLevelChange = (accept: boolean) => {
    if (accept && levelPrompt) {
      setDifficulty(levelPrompt.target);
      setStats(prev => ({ ...prev, streak: 0, wrongStreak: 0 }));
    }
    setLevelPrompt(null);
  };

  const handleNext = () => {
    createNewTask();
  };

  const handleTypeChange = (type: TaskType) => {
    setSelectedType(type);
    if (isStarted) {
      setCurrentTask(generateTask(type, difficulty));
      setFeedback(null);
      setLevelPrompt(null);
      startTimer();
    }
  };

  const handleDifficultyChange = (level: DifficultyLevel) => {
    setDifficulty(level);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  // Keyboard shortcut for next task
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && feedback && !levelPrompt) {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [feedback, levelPrompt]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex flex-col items-center px-4 pt-12 pb-8">
        <DrillIcon className="mb-6" />
        <h1 className="mb-2 text-center text-3xl font-bold text-foreground md:text-4xl">
          Consulting Mental Math Drill
        </h1>
        <p className="max-w-md text-center text-muted-foreground">
          Trainiere deine Rechengeschwindigkeit und Präzision für Interviews.
        </p>
      </header>

      {/* Task Type Selector */}
      <section className="px-4 pb-8">
        <TaskTypeSelector
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
        />
      </section>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center px-4 pb-12">
        {/* Task Card */}
        <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-xl">
          {!isStarted ? (
            <div className="flex flex-col items-center gap-8 py-4">
              <DifficultySelector
                selectedLevel={difficulty}
                onLevelChange={handleDifficultyChange}
              />
              <button
                onClick={handleStart}
                className="rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
              >
                Starten →
              </button>
            </div>
          ) : (
            <>
              {/* Stats + Current Level */}
              <div className="mb-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    Level: {levelNames[difficulty]}
                  </span>
                </div>
                <StatsDisplay
                  correct={stats.correct}
                  total={stats.total}
                  streak={stats.streak}
                />
              </div>

              {/* Task Display */}
              <TaskDisplay task={currentTask} elapsedTime={feedback ? undefined : elapsedTime} />

              {/* Answer Input - hidden when showing feedback */}
              {!feedback && (
                <div className="mt-8 flex justify-center">
                  <AnswerInput onSubmit={handleSubmit} disabled={!!feedback} />
                </div>
              )}

              {/* Feedback */}
              <div className="flex justify-center">
                <FeedbackDisplay feedback={feedback} onNext={handleNext} />
              </div>

              {/* Level Prompt */}
              {levelPrompt && feedback && (
                <LevelPrompt
                  type={levelPrompt.type}
                  currentLevel={difficulty}
                  targetLevel={levelPrompt.target}
                  onAccept={() => handleLevelChange(true)}
                  onDecline={() => handleLevelChange(false)}
                />
              )}
            </>
          )}
        </div>

        {/* Keyboard Hint */}
        {isStarted && feedback && !levelPrompt && (
          <p className="mt-4 text-sm text-muted-foreground">
            Drücke <kbd className="rounded bg-muted px-2 py-1 font-mono">Enter</kbd> für die nächste Aufgabe
          </p>
        )}
      </main>
    </div>
  );
};

export default Index;
