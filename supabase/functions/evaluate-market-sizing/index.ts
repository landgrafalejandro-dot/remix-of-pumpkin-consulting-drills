import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json();
    const {
      case_prompt,
      unit_hint,
      allowed_methods,
      expected_min,
      expected_max,
      answer_text,
      final_estimate_value,
      final_estimate_unit,
      difficulty,
    } = body;

    const rangeInfo =
      expected_min != null && expected_max != null
        ? `Erwartete Größenordnung: ${expected_min} bis ${expected_max} (${final_estimate_unit}).`
        : "Keine erwartete Größenordnung vorhanden. Bewerte Plausibilität nur qualitativ und setze flagged=true wenn unsicher.";

    const systemPrompt = `Du bist ein strikter Bewertungsassistent für Market-Sizing-Übungen im Consulting-Interview-Training.

WICHTIGE REGELN:
- Bewerte NUR nach der folgenden Rubrik. Erfinde KEINE Fakten.
- Behaupte NICHT, die "wahre" Marktgröße zu kennen.
- Nutze KEINE externen Zahlen oder Studien.
- Prüfe nur: Logik, Struktur, Einheiten, interne Konsistenz und Größenordnung (wenn Range gegeben).
- Wenn du unsicher bist ob die Größenordnung stimmt, setze flagged=true.

RUBRIK (0-100 Punkte):
A) Struktur & MECE (0-30): Klare Methode (top-down/bottom-up/mixed)? Logisch und MECE? Nachvollziehbare Schritte?
B) Annahmenqualität (0-20): Explizit genannt? Plausibel? Keine falschen Datenquellen behauptet?
C) Mathematische Konsistenz (0-20): Rechenlogik korrekt? Einheiten konsistent? Keine widersprüchlichen Zwischenergebnisse?
D) Plausibilität / Sanity Check (0-20): Größenordnung sinnvoll? Mindestens ein Sanity Check? Vergleiche/Anker genutzt?
E) Kommunikation (0-10): Klar, kurz, strukturiert? Finale Antwort eindeutig (Zahl + Einheit + Zeitraum)?

Schwierigkeit der Aufgabe: ${difficulty}
Bei "easy" sei nachsichtiger bei Segmentierung; bei "hard" erwarte mehrere Segmente und Sensitivitäten.`;

    const userPrompt = `AUFGABE: ${case_prompt}
Einheit: ${unit_hint || "nicht angegeben"}
Erlaubte Methoden: ${allowed_methods}
${rangeInfo}

ANTWORT DES USERS:
${answer_text}

FINALE SCHÄTZUNG: ${final_estimate_value} ${final_estimate_unit}

Bewerte diese Antwort strikt nach der Rubrik.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "submit_evaluation",
                description:
                  "Submit the structured evaluation of the market sizing answer",
                parameters: {
                  type: "object",
                  properties: {
                    total_score: {
                      type: "number",
                      description: "Total score 0-100",
                    },
                    scores: {
                      type: "object",
                      properties: {
                        structure_mece: {
                          type: "number",
                          description: "0-30",
                        },
                        assumptions: { type: "number", description: "0-20" },
                        math_consistency: {
                          type: "number",
                          description: "0-20",
                        },
                        plausibility_sanity: {
                          type: "number",
                          description: "0-20",
                        },
                        communication: {
                          type: "number",
                          description: "0-10",
                        },
                      },
                      required: [
                        "structure_mece",
                        "assumptions",
                        "math_consistency",
                        "plausibility_sanity",
                        "communication",
                      ],
                      additionalProperties: false,
                    },
                    strengths: {
                      type: "array",
                      items: { type: "string" },
                      description: "Max 3 strengths",
                    },
                    improvements: {
                      type: "array",
                      items: { type: "string" },
                      description: "Max 3 improvements",
                    },
                    red_flags: {
                      type: "array",
                      items: { type: "string" },
                      description: "Optional red flags",
                    },
                    flagged: {
                      type: "boolean",
                      description:
                        "True if evaluation is uncertain about plausibility",
                    },
                    one_line_summary: {
                      type: "string",
                      description: "One sentence summary of the evaluation",
                    },
                  },
                  required: [
                    "total_score",
                    "scores",
                    "strengths",
                    "improvements",
                    "flagged",
                    "one_line_summary",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "submit_evaluation" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Bitte versuche es gleich noch mal.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits aufgebraucht. Bitte Credits aufladen.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI evaluation failed" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      console.error("No tool call in AI response:", JSON.stringify(aiResult));
      return new Response(
        JSON.stringify({ error: "AI did not return structured evaluation" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let evaluation;
    try {
      evaluation =
        typeof toolCall.function.arguments === "string"
          ? JSON.parse(toolCall.function.arguments)
          : toolCall.function.arguments;
    } catch {
      console.error("Failed to parse tool call arguments:", toolCall.function.arguments);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI evaluation" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate-market-sizing error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
