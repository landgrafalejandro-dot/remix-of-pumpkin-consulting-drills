import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  startSession as apiStart,
  submitTurn as apiTurn,
  finalizeSession as apiFinalize,
  SESSION_MAX_SECONDS_CLIENT,
} from "@/lib/ibBotClient";
import type {
  ChatTurn,
  FinalizeResponse,
  IBTopic,
  SessionState,
} from "@/types/ibBot";

export type IBPhase = "config" | "starting" | "chat" | "finalizing" | "debrief";

export interface UseIBSession {
  phase: IBPhase;
  transcript: ChatTurn[];
  sessionState: SessionState | null;
  botThinking: boolean;
  latestBotAudioUrl: string | null;
  debriefData: FinalizeResponse | null;
  start: (input: { user_email: string; user_rating: number; topics: IBTopic[]; company: string | null }) => Promise<void>;
  send: (text: string, mode: "text" | "audio") => Promise<void>;
  endAndFinalize: () => Promise<void>;
  reset: () => void;
}

export function useIBSession(): UseIBSession {
  const [phase, setPhase] = useState<IBPhase>("config");
  const [transcript, setTranscript] = useState<ChatTurn[]>([]);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [botThinking, setBotThinking] = useState(false);
  const [latestBotAudioUrl, setLatestBotAudioUrl] = useState<string | null>(null);
  const [debriefData, setDebriefData] = useState<FinalizeResponse | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanupTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => () => cleanupTimer(), []);

  // Client-side countdown ticker mirroring backend time
  const activeSessionId = sessionState?.session_id;
  useEffect(() => {
    if (phase !== "chat" || !activeSessionId) return;
    cleanupTimer();
    timerRef.current = setInterval(() => {
      setSessionState((prev) => {
        if (!prev) return prev;
        const started = new Date(prev.started_at).getTime();
        const elapsed = Math.floor((Date.now() - started) / 1000);
        const remaining = Math.max(0, SESSION_MAX_SECONDS_CLIENT - elapsed);
        if (remaining === prev.time_remaining_sec) return prev;
        return { ...prev, time_remaining_sec: remaining };
      });
    }, 1000);
    return () => cleanupTimer();
  }, [phase, activeSessionId]);

  const start = useCallback<UseIBSession["start"]>(async (input) => {
    setPhase("starting");
    try {
      const resp = await apiStart(input);
      setSessionState(resp.session_state);
      setTranscript([
        {
          id: `bot-${resp.session_state.session_id}-intro`,
          role: "bot",
          text: resp.intro_text,
          audio_url: resp.intro_audio_url,
          created_at: new Date().toISOString(),
        },
      ]);
      setLatestBotAudioUrl(resp.intro_audio_url);
      setPhase("chat");
    } catch (err) {
      console.error("startSession failed:", err);
      toast.error(err instanceof Error ? err.message : "Start fehlgeschlagen");
      setPhase("config");
    }
  }, []);

  const finalize = useCallback(async (session_id: string) => {
    setPhase("finalizing");
    try {
      const data = await apiFinalize(session_id);
      setDebriefData(data);
      setPhase("debrief");
    } catch (err) {
      console.error("finalize failed:", err);
      toast.error(err instanceof Error ? err.message : "Feedback konnte nicht erstellt werden");
      setPhase("chat");
    }
  }, []);

  const send = useCallback<UseIBSession["send"]>(async (text, mode) => {
    if (!sessionState) return;
    setBotThinking(true);
    const userTurn: ChatTurn = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      created_at: new Date().toISOString(),
    };
    setTranscript((prev) => [...prev, userTurn]);

    try {
      const resp = await apiTurn({
        session_id: sessionState.session_id,
        user_transcript: text,
        input_mode: mode,
      });

      const botTurn: ChatTurn = {
        id: `bot-${Date.now()}-${resp.session_state.turn_index}`,
        role: "bot",
        text: resp.bot_response_text,
        audio_url: resp.bot_audio_url,
        created_at: new Date().toISOString(),
      };
      setTranscript((prev) => [...prev, botTurn]);
      setLatestBotAudioUrl(resp.bot_audio_url);
      setSessionState(resp.session_state);

      if (resp.session_ended_reason) {
        await finalize(sessionState.session_id);
      }
    } catch (err) {
      console.error("submitTurn failed:", err);
      toast.error(err instanceof Error ? err.message : "Fehler beim Senden");
    } finally {
      setBotThinking(false);
    }
  }, [sessionState, finalize]);

  const endAndFinalize = useCallback<UseIBSession["endAndFinalize"]>(async () => {
    if (!sessionState) {
      setPhase("config");
      return;
    }
    cleanupTimer();
    await finalize(sessionState.session_id);
  }, [sessionState, finalize]);

  const reset = useCallback<UseIBSession["reset"]>(() => {
    cleanupTimer();
    setPhase("config");
    setTranscript([]);
    setSessionState(null);
    setBotThinking(false);
    setLatestBotAudioUrl(null);
    setDebriefData(null);
  }, []);

  return {
    phase,
    transcript,
    sessionState,
    botThinking,
    latestBotAudioUrl,
    debriefData,
    start,
    send,
    endAndFinalize,
    reset,
  };
}
