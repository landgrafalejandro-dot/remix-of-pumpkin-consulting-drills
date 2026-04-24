import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mic } from "lucide-react";
import NavHeader from "@/components/NavHeader";
import IBBotConfig from "@/components/ibBot/IBBotConfig";
import IBBotChat from "@/components/ibBot/IBBotChat";
import IBBotDebrief from "@/components/ibBot/IBBotDebrief";
import { useUserEmail } from "@/hooks/useUserEmail";
import { useIBSession } from "@/hooks/useIBSession";
import type { IBBotConfigState } from "@/types/ibBot";
import { toast } from "sonner";

const INITIAL_CONFIG: IBBotConfigState = {
  topics: [],
  rating: 12,
  company: "",
};

const IBBotPage: React.FC = () => {
  const userEmail = useUserEmail();
  const [config, setConfig] = useState<IBBotConfigState>(INITIAL_CONFIG);

  const session = useIBSession();

  const buildLink = (path: string) =>
    userEmail ? `${path}?email=${encodeURIComponent(userEmail)}` : path;

  const handleStart = async () => {
    if (config.topics.length === 0) {
      toast.error("Bitte wähle mindestens ein Schwerpunktthema.");
      return;
    }
    await session.start({
      user_email: userEmail || "anonymous",
      user_rating: config.rating,
      topics: config.topics,
      company: config.company.trim() || null,
    });
  };

  const starting = session.phase === "starting";
  const finalizing = session.phase === "finalizing";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {(session.phase === "config" || session.phase === "starting" || session.phase === "debrief") && (
        <NavHeader showStats={false} />
      )}
      {(session.phase === "chat" || session.phase === "finalizing") && (
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <span className="font-logo text-logo text-foreground">pumpkin.</span>
        </header>
      )}

      {(session.phase === "config" || session.phase === "starting") && (
        <main className="mx-auto w-full max-w-[900px] px-4 pb-12">
          <Link
            to={buildLink("/")}
            className="mt-6 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Dashboard
            <span className="text-white/30">·</span>
            <span>IB Mock Interview</span>
          </Link>

          <div className="flex items-start gap-5 pt-8 pb-10">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[14px] border border-white/[0.08] bg-[#101013]">
              <Mic className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-[34px] font-semibold leading-tight tracking-tight text-foreground">
                IB Mock Interview <span className="text-sm font-normal uppercase tracking-[0.1em] text-primary/80 align-middle">Beta</span>
              </h1>
              <div className="mt-1 text-sm text-muted-foreground">
                30-minütiges Sprach-Interview mit kritischer Bewertung deiner Antworten.
              </div>
            </div>
          </div>

          <IBBotConfig value={config} onChange={setConfig} onStart={handleStart} starting={starting} />
        </main>
      )}

      {session.phase === "chat" && session.sessionState && (
        <main className="flex flex-1 flex-col overflow-hidden">
          <IBBotChat
            transcript={session.transcript}
            sessionState={session.sessionState}
            botThinking={session.botThinking}
            onSend={session.send}
            onExit={() => {
              if (confirm("Interview wirklich beenden? Du erhältst dein Feedback.")) {
                session.endAndFinalize();
              }
            }}
          />
        </main>
      )}

      {finalizing && (
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="animate-spin text-2xl">⏳</span>
            <div className="text-sm text-muted-foreground">Feedback wird erstellt…</div>
          </div>
        </main>
      )}

      {session.phase === "debrief" && session.debriefData && (
        <main className="mx-auto w-full max-w-[900px] px-4 pb-12 pt-6">
          <IBBotDebrief
            data={session.debriefData}
            onRestart={() => {
              session.reset();
              setConfig(INITIAL_CONFIG);
            }}
            backLink={buildLink("/")}
          />
        </main>
      )}
    </div>
  );
};

export default IBBotPage;
