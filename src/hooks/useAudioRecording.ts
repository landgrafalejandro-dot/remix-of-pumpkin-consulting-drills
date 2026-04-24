import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type RecordingState = "idle" | "recording" | "transcribing";

export interface UseAudioRecordingOptions {
  onTranscript: (text: string) => void;
  onError?: (err: unknown) => void;
}

export interface UseAudioRecordingResult {
  state: RecordingState;
  elapsed: number;
  start: () => Promise<void>;
  stop: () => void;
}

export function useAudioRecording({
  onTranscript,
  onError,
}: UseAudioRecordingOptions): UseAudioRecordingResult {
  const [state, setState] = useState<RecordingState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        if (chunksRef.current.length === 0) {
          setState("idle");
          return;
        }

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];

        setState("transcribing");
        try {
          const buffer = await blob.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              "",
            ),
          );

          const { data, error } = await supabase.functions.invoke("transcribe-audio", {
            body: { audio_data: base64, format: "webm" },
          });

          if (error) throw error;
          if (data?.error) {
            toast.error(data.error);
          } else if (data?.transcript) {
            onTranscript(data.transcript);
            toast.success("Transkription eingefügt");
          } else {
            toast.error("Keine Transkription erhalten");
          }
        } catch (err) {
          console.error("Transcription error:", err);
          toast.error("Transkription fehlgeschlagen. Bitte versuche es erneut.");
          onError?.(err);
        }
        setState("idle");
      };

      mediaRecorder.start(1000);
      setState("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch (err) {
      console.error("Microphone error:", err);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        toast.error("Mikrofon-Zugriff verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.");
      } else {
        toast.error("Mikrofon konnte nicht gestartet werden.");
      }
      onError?.(err);
    }
  }, [onTranscript, onError]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return { state, elapsed, start, stop };
}
