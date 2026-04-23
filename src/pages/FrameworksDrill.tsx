import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import NavHeader from "@/components/NavHeader";
import { useUserEmail } from "@/hooks/useUserEmail";
import { saveDrillSession, saveDrillAttempts } from "@/lib/sessionTracker";
import { ListTree, ArrowLeft } from "lucide-react";
import TextDrillConfig from "@/components/textDrill/TextDrillConfig";
import FrameworkBuilder from "@/components/frameworkBuilder/FrameworkBuilder";
import FrameworkIntroModal from "@/components/frameworkBuilder/FrameworkIntroModal";
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
  drillType: "frameworks",
  title: "Frameworks",
  subtitle: "Wähle das passende Framework und baue eine strukturierte Analyse.",
  icon: "ListTree",
  tableName: "framework_cases",
  categoryField: "category",
  categoryLabel: "Kategorie",
  categories: [
    { value: "profitability", label: "Profitability" },
    { value: "market_entry", label: "Market Entry" },
    { value: "growth", label: "Growth" },
    { value: "ma", label: "M&A" },
    { value: "pricing", label: "Pricing" },
    { value: "operations", label: "Operations" },
  ],
  difficultyOptions: [
    { value: "easy", label: "Einfach", desc: "1 Framework, klares Szenario" },
    { value: "medium", label: "Mittel", desc: "Kombinierte Frameworks" },
    { value: "hard", label: "Schwer", desc: "Mehrstufig, Trade-offs" },
  ],
  hintText: "Wähle das passende Framework und baue eine strukturierte Analyse. Die KI bewertet deine Antwort nach fester Rubrik.",
  startButtonText: "Case starten \u2192",
  rubricLabels: [
    { key: "framework_choice", label: "Framework-Wahl", max: 25 },
    { key: "structure_mece", label: "Struktur & MECE", max: 30 },
    { key: "completeness", label: "Vollständigkeit", max: 25 },
    { key: "prioritization", label: "Priorisierung", max: 20 },
  ],
  placeholder: "",
  structureGuide: [
    "2–4 Hauptäste anlegen — MECE aufteilen",
    "Je Ast Stichpunkte eintragen",
    "Unteräste hinzufügen für tiefere Analyse",
    "Wichtigste Hebel zuerst ausarbeiten",
  ],
  sprintMode: false,
  timeReferenceMinutes: 5,
};

const FrameworksDrill: React.FC = () => {
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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const sprintStartTime = useRef<number>(0);

  const isSprint = drillConfig.sprintMode !== false;
  const [introOpen, setIntroOpen] = useState(false);
  const INTRO_STORAGE_KEY = "frameworksDrill.intro.seen";

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
    setElapsedSeconds(0);
    sprintStartTime.current = Date.now();

    // Show intro modal on first ever start
    try {
      if (!localStorage.getItem(INTRO_STORAGE_KEY)) {
        setIntroOpen(true);
        localStorage.setItem(INTRO_STORAGE_KEY, "1");
      }
    } catch {
      // localStorage may be unavailable (private mode) — silently skip
    }

    loadNextCase();

    if (isSprint) {
      // Sprint mode: countdown timer
      setTimeRemaining(duration);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Quality mode: count up silently
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.round((Date.now() - sprintStartTime.current) / 1000));
      }, 1000);
    }
  }, [duration, difficulty, category, loadNextCase, isSprint]);

  const handleEnd = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("debrief");
  }, []);

  useEffect(() => {
    if (isSprint && timeRemaining === 0 && phase === "answering" && results.length > 0) {
      setPhase("debrief");
    }
  }, [timeRemaining, phase, isSprint]);

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
          reference_solution: currentCase.reference_solution,
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
    if (isSprint && timeRemaining <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase("debrief");
    } else {
      loadNextCase();
    }
  }, [timeRemaining, loadNextCase, isSprint]);

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
        drillType: "frameworks" as any,
        correctCount: results.filter(r => (r.evaluation?.total_score ?? 0) >= 60).length,
        totalCount: results.length,
        accuracyPercent: avgScore,
        durationSeconds: actualSeconds,
      }).then((sessionId) => {
        saveDrillAttempts({
          userEmail,
          drillType: "frameworks" as any,
          sessionId,
          attempts: results.map((r) => ({
            taskType: "frameworks",
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
      <FrameworkIntroModal
        open={introOpen}
        onClose={() => setIntroOpen(false)}
        rubricLabels={drillConfig.rubricLabels}
        structureGuide={drillConfig.structureGuide}
      />
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
              <ListTree className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mb-2 text-center text-h2 text-foreground">{drillConfig.title} Drill</h1>
            <p className="max-w-md text-center text-body text-secondary-foreground">
              {drillConfig.subtitle}
            </p>
            <Link to={buildLink("/")} className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" /> Zurück zum Dashboard
            </Link>
          </section>
          <main className="flex flex-1 flex-col items-center px-4 pb-12">
            <div className="w-full max-w-drill rounded-2xl border border-border bg-card p-card-padding">
              <TextDrillConfig
                config={drillConfig}
                duration={duration} onDurationChange={setDuration}
                difficulty={difficulty} onDifficultyChange={setDifficulty}
                category={category} onCategoryChange={setCategory}
                onStart={handleStart}
              />
            </div>
          </main>
        </>
      )}

      {(phase === "answering" || phase === "evaluating") && (
        <main className="flex flex-1 flex-col items-center px-4 py-8">
          <div className="w-full max-w-drill rounded-2xl border border-border bg-card p-card-padding">
            <FrameworkBuilder
              config={drillConfig}
              currentCase={currentCase}
              timeRemaining={timeRemaining}
              totalDuration={duration}
              onSubmit={handleSubmit}
              onEnd={handleEnd}
              isEvaluating={isEvaluating}
              onOpenIntro={() => setIntroOpen(true)}
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

export default FrameworksDrill;
