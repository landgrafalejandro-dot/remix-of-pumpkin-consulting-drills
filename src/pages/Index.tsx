import React, { useState, useCallback, useEffect } from "react";
import DrillIcon from "@/components/DrillIcon";
import TaskTypeSelector from "@/components/TaskTypeSelector";
import TaskDisplay from "@/components/TaskDisplay";
import AnswerInput from "@/components/AnswerInput";
import FeedbackDisplay from "@/components/FeedbackDisplay";
import StatsDisplay from "@/components/StatsDisplay";
import { Task, TaskType, FeedbackState } from "@/types/drill";
import { generateTask, checkAnswer, generateErrorHint } from "@/lib/taskGenerator";

const Index = () => {
  const [selectedType, setSelectedType] = useState<TaskType>("all");
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0 });
  const [difficulty, setDifficulty] = useState(1);
  const [isStarted, setIsStarted] = useState(false);

  const createNewTask = useCallback(() => {
    const task = generateTask(selectedType, difficulty);
    setCurrentTask(task);
    setFeedback(null);
  }, [selectedType, difficulty]);

  const handleStart = () => {
    setIsStarted(true);
    createNewTask();
  };

  const handleSubmit = (userAnswer: string) => {
    if (!currentTask) return;

    const isPercentageResult = currentTask.type === "percentage" || currentTask.type === "growth";
    const isCorrect = checkAnswer(userAnswer, currentTask.answer, isPercentageResult);
    
    setFeedback({
      isCorrect,
      userAnswer,
      correctAnswer: currentTask.answer,
      shortcut: currentTask.shortcut,
      errorHint: isCorrect ? undefined : generateErrorHint(userAnswer, currentTask.answer),
    });

    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));

    // Increase difficulty on streak
    if (isCorrect && stats.streak >= 2 && difficulty < 5) {
      setDifficulty((d) => Math.min(d + 1, 5));
    }
  };

  const handleNext = () => {
    createNewTask();
  };

  const handleTypeChange = (type: TaskType) => {
    setSelectedType(type);
    if (isStarted) {
      setCurrentTask(generateTask(type, difficulty));
      setFeedback(null);
    }
  };

  // Keyboard shortcut for next task
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && feedback) {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [feedback]);

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
            <div className="flex flex-col items-center py-8">
              <p className="mb-6 text-center text-lg text-muted-foreground">
                Drill-Modus aktiviert. Bereit für reine Zahlen?
              </p>
              <button
                onClick={handleStart}
                className="rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
              >
                Starten →
              </button>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-6 flex justify-center">
                <StatsDisplay
                  correct={stats.correct}
                  total={stats.total}
                  streak={stats.streak}
                />
              </div>

              {/* Task Display */}
              <TaskDisplay task={currentTask} />

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
            </>
          )}
        </div>

        {/* Keyboard Hint */}
        {isStarted && feedback && (
          <p className="mt-4 text-sm text-muted-foreground">
            Drücke <kbd className="rounded bg-muted px-2 py-1 font-mono">Enter</kbd> für die nächste Aufgabe
          </p>
        )}
      </main>
    </div>
  );
};

export default Index;
