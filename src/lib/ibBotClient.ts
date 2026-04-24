import { supabase } from "@/integrations/supabase/client";
import type {
  StartSessionResponse,
  IBTurnResponse,
  FinalizeResponse,
  IBTopic,
} from "@/types/ibBot";

export const SESSION_MAX_SECONDS_CLIENT = 30 * 60;

export async function startSession(input: {
  user_email: string;
  user_rating: number;
  topics: IBTopic[];
  company: string | null;
}): Promise<StartSessionResponse> {
  const { data, error } = await supabase.functions.invoke("ib-start-session", { body: input });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as StartSessionResponse;
}

export async function submitTurn(input: {
  session_id: string;
  user_transcript: string;
  input_mode: "text" | "audio";
}): Promise<IBTurnResponse> {
  const { data, error } = await supabase.functions.invoke("ib-turn", { body: input });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as IBTurnResponse;
}

export async function finalizeSession(session_id: string): Promise<FinalizeResponse> {
  const { data, error } = await supabase.functions.invoke("ib-finalize", { body: { session_id } });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as FinalizeResponse;
}
