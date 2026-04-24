import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import NavHeader from "@/components/NavHeader";
import { useUserEmail } from "@/hooks/useUserEmail";
import { saveDrillSession, saveDrillAttempts } from "@/lib/sessionTracker";
import { BarChart3, ArrowLeft } from "lucide-react";
import TextDrillConfig from "@/components/textDrill/TextDrillConfig";
import TextDrillGame from "@/components/textDrill/TextDrillGame";
import TextDrillResultView from "@/components/textDrill/TextDrillResult";
import TextDrillDebrief from "@/components/textDrill/TextDrillDebrief";
import { SprintDuration } from "@/types/drill";
import { TextDrillCase, TextDrillResult, TextDrillPhase, TextDrillEvaluation, DrillConfig } from "@/types/textDrill";
import {
  fetchTextDrillCases, getNextTextDrillCase, resetTextDrillSession,
  submitTextDrillAnswer, saveTextDrillEvaluation,
} from "@/lib/textDrillFetcher";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const drillConfig: DrillConfig = {
  drillType: "charts",
  title: "Diagramme",
  subtitle: "Analysiere Charts, Graphen und Tabellen wie ein Berater. KI-gestützte Bewertung.",
  icon: "BarChart3",
  tableName: "chart_cases",
  categoryField: "chart_type",
  categoryLabel: "Chart-Typ",
  categories: [
    { value: "bar", label: "Bar Chart" },
    { value: "line", label: "Line Chart" },
    { value: "pie", label: "Pie Chart" },
    { value: "waterfall", label: "Waterfall" },
    { value: "stacked_bar", label: "Stacked Bar" },
  ],
  difficultyOptions: [
    { value: "easy", label: "Einfach", desc: "1 Chart, einfache Ablesung" },
    { value: "medium", label: "Mittel", desc: "Mehrere Datensätze" },
    { value: "hard", label: "Schwer", desc: "Komplexe Analyse" },
  ],
  hintText: "Analysiere das Diagramm und beschreibe deine Erkenntnisse strukturiert. Die KI bewertet deine Antwort nach fester Rubrik.",
  startButtonText: "Start Diagramme \u2192",
  rubricLabels: [
    { key: "data_reading", label: "Daten-Ablesung", max: 25 },
    { key: "trend_analysis", label: "Trend-Analyse", max: 25 },
    { key: "business_implications", label: "Business-Implikationen", max: 25 },
    { key: "depth_of_analysis", label: "Analysetiefe", max: 15 },
    { key: "communication", label: "Kommunikation", max: 10 },
  ],
  placeholder: "1) Beobachtung: ...\n2) Trend: ...\n3) Ursache: ...\n4) Business-Implikation: ...",
};

const ChartDrill: React.FC = () => {
  const userEmail = useUserEmail();
  const [duration, setDuration] = useState<SprintDuration>(300);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [category, setCategory] = useState("all");
  const [phase, setPhase] = useState<TextDrillPhase>("config");
  const [currentCase, setCurrentCase] = useState<TextDrillCase | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [results, setResults] = useState<TextDrillResult[]>([]);
  const [currentResult, setCurrentResult] = useState<TextDrillResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const taskStartTime = useRef<number>(0);
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const sprintStartTime = useRef<number>(0);

  const buildLink = (path: string) =>
    userEmail ? `${path}?email=${encodeURIComponent(userEmail)}` : path;

  const loadNextCase = useCallback(() => {
    const next = getNextTextDrillCase(drillConfig.tableName);
    setCurrentCase(next);
    taskStartTime.current = Date.now();
    setPhase("answering");
  }, []);

  const handleStart = useCallback(async () => {
    await fetchTextDrillCases(drillConfig.tableName, difficulty, drillConfig.categoryField, category);
    resetTextDrillSession(drillConfig.tableName);
    sessionIdRef.current = crypto.randomUUID();
    setResults([]);
    setCurrentResult(null);
    setTimeRemaining(duration);
    sprintStartTime.current = Date.now();
    loadNextCase();

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [duration, difficulty, category, loadNextCase]);

  const handleEnd = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("debrief");
  }, []);

  useEffect(() => {
    if (timeRemaining === 0 && phase === "answering" && results.length > 0) {
      setPhase("debrief");
    }
  }, [timeRemaining, phase]);

  const handleSubmit = useCallback(async (answerText: string) => {
    if (!currentCase) return;
    setIsEvaluating(true);
    setPhase("evaluating");

    const timeSpentSec = Math.round((Date.now() - taskStartTime.current) / 1000);

    const submissionId = await submitTextDrillAnswer({
      drillType: drillConfig.drillType,
      caseId: currentCase.id,
      sessionId: sessionIdRef.current,
      userEmail: userEmail || "anonymous",
      answerText,
      timeSpentSec,
    });

    let evaluation: TextDrillEvaluation | null = null;
    try {
      const { data, error } = await supabase.functions.invoke("evaluate-drill", {
        body: {
          drill_type: drillConfig.drillType,
          case_prompt: currentCase.prompt,
          answer_text: answerText,
          difficulty,
          context_info: currentCase.context_info,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
      } else {
        evaluation = data as TextDrillEvaluation;
      }
    } catch (err: any) {
      console.error("Evaluation error:", err);
      toast.error("KI-Bewertung fehlgeschlagen. Ergebnis wird ohne Score angezeigt.");
    }

    if (evaluation && submissionId) {
      await saveTextDrillEvaluation({
        submissionId,
        totalScore: evaluation.total_score,
        scoresJson: evaluation.scores,
        feedbackJson: {
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          red_flags: evaluation.red_flags,
          one_line_summary: evaluation.one_line_summary,
        },
        flagged: evaluation.flagged,
      });
    }

    const result: TextDrillResult = {
      case: currentCase,
      answerText,
      timeSpentSec,
      evaluation,
      submissionId: submissionId ?? undefined,
    };

    setResults((prev) => [...prev, result]);
    setCurrentResult(result);
    setIsEvaluating(false);
    setPhase("result");
  }, [currentCase, userEmail, difficulty]);

  const handleNext = useCallback(() => {
    if (timeRemaining <= 0) {
      setPhase("debrief");
    } else {
      loadNextCase();
    }
  }, [timeRemaining, loadNextCase]);

  const handleFinish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("debrief");
  }, []);

  // Save session on debrief
  const prevPhaseRef = useRef<TextDrillPhase>("config");
  useEffect(() => {
    if (phase === "debrief" && prevPhaseRef.current !== "debrief" && userEmail && results.length > 0) {
      const actualSeconds = Math.round((Date.now() - sprintStartTime.current) / 1000);
      const avgScore = results.filter(r => r.evaluation).length > 0
        ? Math.round(results.filter(r => r.evaluation).reduce((s, r) => s + (r.evaluation?.total_score ?? 0), 0) / results.filter(r => r.evaluation).length)
        : 0;

      saveDrillSession({
        userEmail,
        drillType: "charts" as any,
        correctCount: results.filter(r => (r.evaluation?.total_score ?? 0) >= 60).length,
        totalCount: results.length,
        accuracyPercent: avgScore,
        durationSeconds: actualSeconds,
      }).then((sessionId) => {
        saveDrillAttempts({
          userEmail,
          drillType: "charts" as any,
          sessionId,
          attempts: results.map((r) => ({
            taskType: "charts",
            isCorrect: (r.evaluation?.total_score ?? 0) >= 60,
            responseTimeMs: r.timeSpentSec * 1000,
            difficulty,
          })),
        });
      });
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleRestart = useCallback(() => {
    setPhase("config");
    setCurrentCase(null);
    setResults([]);
    setCurrentResult(null);
    setTimeRemaining(0);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {(phase === "config" || phase === "debrief") && <NavHeader showStats={false} />}
      {(phase === "answering" || phase === "evaluating" || phase === "result") && (
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <span className="font-logo text-logo text-foreground">pumpkin.</span>
        </header>
      )}

      {phase === "config" && (
        <main className="mx-auto w-full max-w-[900px] px-4 pb-12">
          <Link
            to={buildLink("/")}
            className="mt-6 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
            <span className="text-white/30">·</span>
            <span>{drillConfig.title}</span>
          </Link>

          <div className="flex items-start gap-5 pt-8 pb-10">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[14px] border border-white/[0.08] bg-[#101013] text-foreground">
              <BarChart3 className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-[34px] font-semibold leading-tight tracking-tight text-foreground">
                {drillConfig.title} Drill
              </h1>
              <div className="mt-1 text-sm text-muted-foreground">{drillConfig.subtitle}</div>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">
              Drill 05 / 06
            </div>
          </div>

          <TextDrillConfig
            config={drillConfig}
            duration={duration} onDurationChange={setDuration}
            difficulty={difficulty} onDifficultyChange={setDifficulty}
            category={category} onCategoryChange={setCategory}
            onStart={handleStart}
          />
        </main>
      )}

      {(phase === "answering" || phase === "evaluating") && (
        <main className="flex flex-1 flex-col items-center px-4 py-8">
          <div className="w-full max-w-drill rounded-2xl border border-border bg-card p-card-padding">
            <TextDrillGame
              config={drillConfig}
              currentCase={currentCase}
              timeRemaining={timeRemaining}
              totalDuration={duration}
              onSubmit={handleSubmit}
              onEnd={handleEnd}
              isEvaluating={isEvaluating}
            />
          </div>
        </main>
      )}

      {phase === "result" && currentResult && (
        <main className="flex flex-1 flex-col items-center px-4 py-8">
          <div className="w-full max-w-drill rounded-2xl border border-border bg-card p-card-padding">
            <TextDrillResultView
              config={drillConfig}
              result={currentResult}
              onNext={handleNext}
              onFinish={handleFinish}
              hasTimeLeft={timeRemaining > 0}
            />
          </div>
        </main>
      )}

      {phase === "debrief" && (
        <>
          <section className="flex flex-col items-center px-4 pt-8 pb-4">
            <Link to={buildLink("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" /> Zurück zum Dashboard
            </Link>
          </section>
          <main className="flex flex-1 flex-col items-center px-4 pb-12">
            <div className="w-full max-w-drill rounded-2xl border border-border bg-card p-card-padding">
              <TextDrillDebrief
                config={drillConfig}
                results={results}
                durationSeconds={duration}
                onRestart={handleRestart}
              />
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default ChartDrill;
