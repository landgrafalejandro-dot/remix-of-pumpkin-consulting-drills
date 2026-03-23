import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import NavHeader from "@/components/NavHeader";
import { useUserEmail } from "@/hooks/useUserEmail";
import { saveDrillSession, saveDrillAttempts } from "@/lib/sessionTracker";
import { Globe, ArrowLeft } from "lucide-react";
import MarketSizingConfig from "@/components/marketSizing/MarketSizingConfig";
import MarketSizingGame from "@/components/marketSizing/MarketSizingGame";
import MarketSizingResultView from "@/components/marketSizing/MarketSizingResult";
import MarketSizingDebrief from "@/components/marketSizing/MarketSizingDebrief";
import { SprintDuration } from "@/types/drill";
import { MarketSizingCase, MarketSizingResult, MarketSizingPhase, MarketSizingEvaluation } from "@/types/marketSizing";
import {
  fetchMarketSizingCases, getNextMarketSizingCase, resetMarketSizingSession,
  submitMarketSizingAnswer, saveMarketSizingEvaluation,
} from "@/lib/marketSizingFetcher";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MarketSizingDrill: React.FC = () => {
  const userEmail = useUserEmail();
  const [duration, setDuration] = useState<SprintDuration>(300);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [industryTag, setIndustryTag] = useState("all");
  const [phase, setPhase] = useState<MarketSizingPhase>("config");
  const [currentCase, setCurrentCase] = useState<MarketSizingCase | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [results, setResults] = useState<MarketSizingResult[]>([]);
  const [currentResult, setCurrentResult] = useState<MarketSizingResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const taskStartTime = useRef<number>(0);
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const sprintStartTime = useRef<number>(0);

  const buildLink = (path: string) =>
    userEmail ? `${path}?email=${encodeURIComponent(userEmail)}` : path;

  const loadNextCase = useCallback(() => {
    const next = getNextMarketSizingCase();
    setCurrentCase(next);
    taskStartTime.current = Date.now();
    setPhase("answering");
  }, []);

  const handleStart = useCallback(async () => {
    await fetchMarketSizingCases(difficulty, industryTag);
    resetMarketSizingSession();
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
  }, [duration, difficulty, industryTag, loadNextCase]);

  const handleEnd = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("debrief");
  }, []);

  // Auto end when timer reaches 0 and we're answering (not evaluating)
  useEffect(() => {
    if (timeRemaining === 0 && (phase === "answering") && results.length > 0) {
      setPhase("debrief");
    }
  }, [timeRemaining, phase]);

  const handleSubmit = useCallback(async (
    answerText: string, estimateValue: number | null, estimateUnit: string
  ) => {
    if (!currentCase) return;
    setIsEvaluating(true);
    setPhase("evaluating");

    const timeSpentSec = Math.round((Date.now() - taskStartTime.current) / 1000);

    // Save submission
    const submissionId = await submitMarketSizingAnswer({
      caseId: currentCase.id,
      sessionId: sessionIdRef.current,
      userEmail: userEmail || "anonymous",
      answerText,
      finalEstimateValue: estimateValue,
      finalEstimateUnit: estimateUnit,
      timeSpentSec,
    });

    // Call AI evaluation
    let evaluation: MarketSizingEvaluation | null = null;
    try {
      const { data, error } = await supabase.functions.invoke("evaluate-market-sizing", {
        body: {
          case_prompt: currentCase.prompt,
          unit_hint: currentCase.unit_hint,
          allowed_methods: currentCase.allowed_methods,
          expected_min: currentCase.expected_order_of_magnitude_min,
          expected_max: currentCase.expected_order_of_magnitude_max,
          answer_text: answerText,
          final_estimate_value: estimateValue,
          final_estimate_unit: estimateUnit,
          difficulty,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
      } else {
        evaluation = data as MarketSizingEvaluation;
      }
    } catch (err: any) {
      console.error("Evaluation error:", err);
      toast.error("KI-Bewertung fehlgeschlagen. Ergebnis wird ohne Score angezeigt.");
    }

    // Save evaluation if we have one
    if (evaluation && submissionId) {
      await saveMarketSizingEvaluation({
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

    const result: MarketSizingResult = {
      case: currentCase,
      answerText,
      finalEstimateValue: estimateValue,
      finalEstimateUnit: estimateUnit,
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
  const prevPhaseRef = useRef<MarketSizingPhase>("config");
  useEffect(() => {
    if (phase === "debrief" && prevPhaseRef.current !== "debrief" && userEmail && results.length > 0) {
      const actualSeconds = Math.round((Date.now() - sprintStartTime.current) / 1000);
      const avgScore = results.filter(r => r.evaluation).length > 0
        ? Math.round(results.filter(r => r.evaluation).reduce((s, r) => s + (r.evaluation?.total_score ?? 0), 0) / results.filter(r => r.evaluation).length)
        : 0;

      saveDrillSession({
        userEmail,
        drillType: "market_sizing" as any,
        correctCount: results.filter(r => (r.evaluation?.total_score ?? 0) >= 60).length,
        totalCount: results.length,
        accuracyPercent: avgScore,
        durationSeconds: actualSeconds,
      }).then((sessionId) => {
        saveDrillAttempts({
          userEmail,
          drillType: "market_sizing" as any,
          sessionId,
          attempts: results.map((r) => ({
            taskType: "market_sizing",
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
        <>
          <section className="flex flex-col items-center px-4 pt-8 pb-4">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Globe className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mb-2 text-center text-h2 text-foreground">Market Sizing Drill</h1>
            <p className="max-w-md text-center text-body text-secondary-foreground">
              Schätze Marktgrößen mit Struktur, Annahmen & Plausibilität. KI-gestützte Bewertung.
            </p>
            <Link to={buildLink("/")} className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" /> Zurück zum Dashboard
            </Link>
          </section>
          <main className="flex flex-1 flex-col items-center px-4 pb-12">
            <div className="w-full max-w-drill rounded-2xl border border-border bg-card p-card-padding">
              <MarketSizingConfig
                duration={duration} onDurationChange={setDuration}
                difficulty={difficulty} onDifficultyChange={setDifficulty}
                industryTag={industryTag} onIndustryTagChange={setIndustryTag}
                onStart={handleStart}
              />
            </div>
          </main>
        </>
      )}

      {(phase === "answering" || phase === "evaluating") && (
        <main className="flex flex-1 flex-col items-center px-4 py-8">
          <div className="w-full max-w-drill rounded-2xl border border-border bg-card p-card-padding">
            <MarketSizingGame
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
            <MarketSizingResultView
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
              <MarketSizingDebrief
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

export default MarketSizingDrill;
