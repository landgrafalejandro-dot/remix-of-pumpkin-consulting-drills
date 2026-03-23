import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RubricItem {
  key: string;
  label: string;
  max: number;
  description: string;
}

const RUBRICS: Record<string, RubricItem[]> = {
  frameworks: [
    { key: "framework_choice", label: "Framework-Wahl", max: 25, description: "Richtiges Framework gewählt? Passt es zum Szenario?" },
    { key: "structure_mece", label: "Struktur & MECE", max: 25, description: "MECE-Struktur? Logisch aufgebaut? Klare Äste/Ebenen?" },
    { key: "completeness", label: "Vollständigkeit", max: 25, description: "Alle relevanten Aspekte abgedeckt? Wichtige Punkte nicht vergessen?" },
    { key: "prioritization", label: "Priorisierung", max: 15, description: "Priorisierung der wichtigsten Hebel? Fokus auf Key Issues?" },
    { key: "communication", label: "Kommunikation", max: 10, description: "Klar, strukturiert, auf den Punkt?" },
  ],
  charts: [
    { key: "data_reading", label: "Daten-Ablesung", max: 25, description: "Daten korrekt abgelesen? Werte richtig interpretiert?" },
    { key: "trend_analysis", label: "Trend-Analyse", max: 25, description: "Trends und Muster erkannt? Veränderungen identifiziert?" },
    { key: "business_implications", label: "Business-Implikationen", max: 25, description: "Business-relevante Schlussfolgerungen gezogen?" },
    { key: "depth_of_analysis", label: "Analysetiefe", max: 15, description: "Tiefe der Analyse? Vergleiche, Ursachen, Zusammenhänge?" },
    { key: "communication", label: "Kommunikation", max: 10, description: "Klar und strukturiert kommuniziert?" },
  ],
  creativity: [
    { key: "originality", label: "Originalität", max: 25, description: "Originalität und Kreativität der Lösung?" },
    { key: "feasibility", label: "Machbarkeit", max: 25, description: "Machbarkeit und Realisierbarkeit?" },
    { key: "business_impact", label: "Business Impact", max: 25, description: "Business-Relevanz und Impact?" },
    { key: "structure", label: "Struktur", max: 15, description: "Strukturierte Darstellung der Idee?" },
    { key: "communication", label: "Kommunikation", max: 10, description: "Klar und überzeugend kommuniziert?" },
  ],
};

function buildSystemPrompt(drillType: string, difficulty: string): string {
  const rubric = RUBRICS[drillType];
  if (!rubric) throw new Error(`Unknown drill type: ${drillType}`);

  const rubricText = rubric
    .map((r, i) => `${String.fromCharCode(65 + i)}) ${r.label} (0-${r.max}): ${r.description}`)
    .join("\n");

  const drillLabel =
    drillType === "frameworks" ? "Framework-Analyse" :
    drillType === "charts" ? "Diagramm-Interpretation" :
    "Kreativitätsübung";

  const scoringAnchors =
    drillType === "frameworks" ? `
SCORING-ANKER (für Konsistenz – wende diese IMMER gleich an):
- Framework-Wahl: Richtiges Framework klar benannt = 20-25. Passendes Framework aber nicht benannt = 12-19. Falsches/kein Framework = 0-11.
- Struktur & MECE: 3+ MECE-Äste mit Unterpunkten = 20-25. 2-3 Äste, teilweise MECE = 12-19. Keine klare Struktur = 0-11.
- Vollständigkeit: Alle wesentlichen Aspekte abgedeckt = 20-25. Wichtigste Punkte da, Lücken = 12-19. Nur oberflächlich = 0-11.
- Priorisierung: Klare Priorisierung mit Begründung = 12-15. Priorisierung ohne Begründung = 6-11. Keine Priorisierung = 0-5.
- Kommunikation: Klar und prägnant = 8-10. Verständlich = 4-7. Unstrukturiert = 0-3.` :
    drillType === "charts" ? `
SCORING-ANKER (für Konsistenz – wende diese IMMER gleich an):
- Daten-Ablesung: Zahlen korrekt gelesen und benannt = 20-25. Größtenteils korrekt = 12-19. Falsche/fehlende Werte = 0-11.
- Trend-Analyse: Trends erkannt und quantifiziert = 20-25. Trends erkannt ohne Quantifizierung = 12-19. Trends nicht erkannt = 0-11.
- Business-Implikationen: Konkrete Handlungsempfehlungen = 20-25. Allgemeine Schlussfolgerungen = 12-19. Keine Implikationen = 0-11.
- Analysetiefe: Vergleiche, Ursachen, Zusammenhänge = 12-15. Grundlegende Analyse = 6-11. Nur Beschreibung = 0-5.
- Kommunikation: Klar und prägnant = 8-10. Verständlich = 4-7. Unstrukturiert = 0-3.` : `
SCORING-ANKER (für Konsistenz – wende diese IMMER gleich an):
- Originalität: Unerwarteter, kreativer Ansatz = 20-25. Solide Idee mit eigenem Dreh = 12-19. Naheliegend/generisch = 0-11.
- Machbarkeit: Konkret umsetzbar mit klaren Schritten = 20-25. Grundsätzlich machbar = 12-19. Unrealistisch = 0-11.
- Business Impact: Quantifizierter Impact = 20-25. Qualitativer Impact erklärt = 12-19. Kein Impact genannt = 0-11.
- Struktur: Logisch aufgebaut mit allen Aspekten = 12-15. Grundstruktur erkennbar = 6-11. Unstrukturiert = 0-5.
- Kommunikation: Überzeugend und klar = 8-10. Verständlich = 4-7. Unklar = 0-3.`;

  const difficultyGuidance =
    difficulty === "easy" ? "Schwierigkeit: EINFACH. Sei großzügig – ein grundlegend richtiger Ansatz verdient 60+ Punkte. Erwarte keine Tiefe." :
    difficulty === "medium" ? "Schwierigkeit: MITTEL. Erwarte solide Struktur und mehrere Aspekte. 50+ Punkte bei erkennbar gutem Ansatz." :
    "Schwierigkeit: SCHWER. Erwarte Tiefe, Nuancen und Priorisierung. Aber auch hier: 40+ Punkte bei erkennbarem, strukturiertem Ansatz.";

  return `Du bist ein fairer, konsistenter Bewertungsassistent für ${drillLabel}-Übungen im Consulting-Interview-Training.

WICHTIGE REGELN:
- Bewerte NUR nach der folgenden Rubrik und den Scoring-Ankern.
- Erfinde KEINE Fakten. Nutze KEINE externen Zahlen oder Studien.
- Prüfe nur: Logik, Struktur, Qualität der Argumentation, interne Konsistenz.
- Sei FAIR und KONSISTENT: Gleiche Qualität = gleiche Punkte, immer.
- Wenn du unsicher bist ob die Qualität ausreicht, setze flagged=true.

RUBRIK (0-100 Punkte):
${rubricText}
${scoringAnchors}

${difficultyGuidance}

FEEDBACK-REGELN:
- Jede Stärke muss konkret benennen, WAS gut war (z.B. "Gute MECE-Struktur mit 4 klar abgegrenzten Ästen").
- Jedes Improvement muss konkret und UMSETZBAR sein. NICHT: "Struktur verbessern". SONDERN: "Füge einen Ast für externe Faktoren (Markt, Wettbewerb) hinzu."
- Gib maximal 2-3 Improvements – fokussiere auf die wichtigsten.
- one_line_summary: Ein Satz der dem User hilft, den nächsten Versuch besser zu machen.`;
}

function buildToolSchema(drillType: string) {
  const rubric = RUBRICS[drillType];
  if (!rubric) throw new Error(`Unknown drill type: ${drillType}`);

  const scoreProperties: Record<string, any> = {};
  const requiredScores: string[] = [];
  for (const r of rubric) {
    scoreProperties[r.key] = {
      type: "number",
      description: `0-${r.max}`,
    };
    requiredScores.push(r.key);
  }

  return {
    type: "function",
    function: {
      name: "submit_evaluation",
      description: "Submit the structured evaluation of the drill answer",
      parameters: {
        type: "object",
        properties: {
          total_score: {
            type: "number",
            description: "Total score 0-100",
          },
          scores: {
            type: "object",
            properties: scoreProperties,
            required: requiredScores,
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
            description: "True if evaluation is uncertain about quality",
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
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    const body = await req.json();
    const {
      drill_type,
      case_prompt,
      answer_text,
      difficulty,
      context_info,
    } = body;

    if (!drill_type || !case_prompt || !answer_text) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: drill_type, case_prompt, answer_text" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!RUBRICS[drill_type]) {
      return new Response(
        JSON.stringify({ error: `Unknown drill_type: ${drill_type}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = buildSystemPrompt(drill_type, difficulty || "medium");

    const contextBlock = context_info
      ? `\nKONTEXT / HINWEISE:\n${context_info}`
      : "";

    const userPrompt = `AUFGABE: ${case_prompt}${contextBlock}

ANTWORT DES USERS:
${answer_text}

Bewerte diese Antwort strikt nach der Rubrik.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "anthropic/claude-sonnet-4.6",
          temperature: 0,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [buildToolSchema(drill_type)],
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
    console.error("evaluate-drill error:", e);
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
