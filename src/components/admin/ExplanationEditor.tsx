import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, RefreshCw } from "lucide-react";

interface Explanation {
  id: string;
  task_type: string;
  difficulty: string;
  explanation_text: string;
}

const TYPE_LABELS: Record<string, string> = {
  multiplication: "Multiplikation",
  division: "Division",
  percentage: "Prozente / Brüche",
  zero_management: "Nullen-Management",
};

const DIFF_LABELS: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const DIFF_COLORS: Record<string, string> = {
  easy: "bg-success/20 text-success",
  medium: "bg-primary/20 text-primary",
  hard: "bg-destructive/20 text-destructive",
};

const ExplanationEditor: React.FC = () => {
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchExplanations = useCallback(async () => {
    const { data, error } = await supabase
      .from("mental_math_explanations")
      .select("*")
      .order("task_type")
      .order("difficulty");

    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
      return;
    }
    setExplanations((data as any[]) ?? []);
    setEdits({});
  }, [toast]);

  useEffect(() => {
    fetchExplanations();
  }, [fetchExplanations]);

  const handleSave = async (exp: Explanation) => {
    const newText = edits[exp.id];
    if (newText === undefined || newText === exp.explanation_text) return;

    setSaving(exp.id);
    const { error } = await supabase
      .from("mental_math_explanations")
      .update({ explanation_text: newText, updated_at: new Date().toISOString() } as any)
      .eq("id", exp.id);

    setSaving(null);
    if (error) {
      toast({ title: "Fehler beim Speichern", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Gespeichert" });
      fetchExplanations();
    }
  };

  // Group by task_type
  const grouped = explanations.reduce<Record<string, Explanation[]>>((acc, e) => {
    (acc[e.task_type] ??= []).push(e);
    return acc;
  }, {});

  const typeOrder = ["multiplication", "division", "percentage", "zero_management"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {explanations.length} Erklärungen geladen
        </p>
        <Button variant="ghost" size="sm" onClick={fetchExplanations}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Aktualisieren
        </Button>
      </div>

      {typeOrder.map((type) => {
        const items = grouped[type];
        if (!items) return null;

        return (
          <div key={type} className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              {TYPE_LABELS[type] || type}
            </h3>
            {items.map((exp) => {
              const currentText = edits[exp.id] ?? exp.explanation_text;
              const isDirty = edits[exp.id] !== undefined && edits[exp.id] !== exp.explanation_text;

              return (
                <div key={exp.id} className="flex gap-3 items-start">
                  <span className={`mt-1 shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${DIFF_COLORS[exp.difficulty] || "bg-muted text-muted-foreground"}`}>
                    {DIFF_LABELS[exp.difficulty] || exp.difficulty}
                  </span>
                  <Textarea
                    className="min-h-[60px] text-sm"
                    value={currentText}
                    onChange={(e) =>
                      setEdits((prev) => ({ ...prev, [exp.id]: e.target.value }))
                    }
                  />
                  <Button
                    size="sm"
                    variant={isDirty ? "default" : "ghost"}
                    disabled={!isDirty || saving === exp.id}
                    onClick={() => handleSave(exp)}
                    className="shrink-0 mt-1"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default ExplanationEditor;
