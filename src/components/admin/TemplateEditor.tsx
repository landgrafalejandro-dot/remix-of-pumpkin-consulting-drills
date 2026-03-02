import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, RefreshCw, Plus, Trash2, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Template {
  id: string;
  task_type: string;
  difficulty: string;
  match_rule: string;
  explanation_text: string;
  priority: number;
  active: boolean;
}

type ModuleTab = "mental_math" | "case_math";

const MODULE_CONFIG: Record<ModuleTab, {
  table: "mental_math_explanation_templates" | "case_math_explanation_templates";
  types: string[];
  typeLabels: Record<string, string>;
}> = {
  mental_math: {
    table: "mental_math_explanation_templates",
    types: ["multiplication", "division", "percentage", "zero_management"],
    typeLabels: {
      multiplication: "Multiplikation",
      division: "Division",
      percentage: "Prozente / Brüche",
      zero_management: "Nullen-Management",
    },
  },
  case_math: {
    table: "case_math_explanation_templates",
    types: ["profitability", "investment_roi", "break_even"],
    typeLabels: {
      profitability: "Profitabilität",
      investment_roi: "Investment (ROI)",
      break_even: "Break-even",
    },
  },
};

const DIFF_LABELS: Record<string, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };
const DIFF_COLORS: Record<string, string> = {
  easy: "bg-success/20 text-success",
  medium: "bg-primary/20 text-primary",
  hard: "bg-destructive/20 text-destructive",
};
const DIFFICULTIES = ["easy", "medium", "hard"];

const TemplateEditor: React.FC = () => {
  const [module, setModule] = useState<ModuleTab>("mental_math");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [edits, setEdits] = useState<Record<string, Partial<Template>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterDiff, setFilterDiff] = useState("all");
  const [previewText, setPreviewText] = useState("");
  const [matchResults, setMatchResults] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const config = MODULE_CONFIG[module];

  const [newType, setNewType] = useState(config.types[0]);
  const [newDiff, setNewDiff] = useState("easy");
  const [newRule, setNewRule] = useState("");
  const [newText, setNewText] = useState("");
  const [newPriority, setNewPriority] = useState(10);
  const [adding, setAdding] = useState(false);

  const fetchTemplates = useCallback(async () => {
    const { data, error } = await supabase
      .from(config.table)
      .select("*")
      .order("task_type")
      .order("difficulty")
      .order("priority", { ascending: false });

    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
      return;
    }
    setTemplates((data as Template[]) ?? []);
    setEdits({});
  }, [config.table, toast]);

  useEffect(() => {
    fetchTemplates();
    setFilterType("all");
    setFilterDiff("all");
    setPreviewText("");
    setNewType(MODULE_CONFIG[module].types[0]);
  }, [module, fetchTemplates]);

  const testMatch = (rule: string, text: string): boolean => {
    const trimmed = rule.trim();
    if (trimmed.startsWith("contains:")) {
      return text.toLowerCase().includes(trimmed.slice("contains:".length).trim().toLowerCase());
    }
    if (trimmed.startsWith("regex:")) {
      try { return new RegExp(trimmed.slice("regex:".length).trim(), "i").test(text); } catch { return false; }
    }
    return false;
  };

  useEffect(() => {
    if (!previewText.trim()) { setMatchResults({}); return; }
    const results: Record<string, boolean> = {};
    for (const t of templates) {
      const rule = edits[t.id]?.match_rule ?? t.match_rule;
      results[t.id] = testMatch(rule, previewText);
    }
    setMatchResults(results);
  }, [previewText, templates, edits]);

  const getEdited = (t: Template): Template => ({ ...t, ...edits[t.id] });
  const isDirty = (t: Template): boolean => {
    const e = edits[t.id];
    if (!e) return false;
    return Object.entries(e).some(([k, v]) => v !== t[k as keyof Template]);
  };

  const updateField = (id: string, field: keyof Template, value: any) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSave = async (t: Template) => {
    const e = edits[t.id];
    if (!e) return;
    setSaving(t.id);
    const { error } = await supabase
      .from(config.table)
      .update({
        match_rule: e.match_rule ?? t.match_rule,
        explanation_text: e.explanation_text ?? t.explanation_text,
        priority: e.priority ?? t.priority,
        active: e.active ?? t.active,
      } as any)
      .eq("id", t.id);
    setSaving(null);
    if (error) { toast({ title: "Fehler", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Gespeichert" }); fetchTemplates(); }
  };

  const handleAdd = async () => {
    if (!newRule.trim() || !newText.trim()) {
      toast({ title: "Regel und Text sind Pflicht", variant: "destructive" });
      return;
    }
    setAdding(true);
    const { error } = await supabase.from(config.table).insert({
      task_type: newType, difficulty: newDiff, match_rule: newRule.trim(),
      explanation_text: newText.trim(), priority: newPriority,
    } as any);
    setAdding(false);
    if (error) { toast({ title: "Fehler", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Template erstellt" }); setNewRule(""); setNewText(""); setNewPriority(10); fetchTemplates(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from(config.table).delete().eq("id", id);
    if (error) { toast({ title: "Fehler", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Gelöscht" }); fetchTemplates(); }
  };

  const filtered = templates.filter((t) => {
    if (filterType !== "all" && t.task_type !== filterType) return false;
    if (filterDiff !== "all" && t.difficulty !== filterDiff) return false;
    return true;
  });

  const grouped = filtered.reduce<Record<string, Template[]>>((acc, t) => {
    (acc[t.task_type] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Module Tabs */}
      <Tabs value={module} onValueChange={(v) => setModule(v as ModuleTab)}>
        <TabsList>
          <TabsTrigger value="mental_math">Mental Math</TabsTrigger>
          <TabsTrigger value="case_math">Case Math</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters + Preview */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Typ</label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Typen</SelectItem>
              {config.types.map((t) => (
                <SelectItem key={t} value={t}>{config.typeLabels[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Schwierigkeit</label>
          <Select value={filterDiff} onValueChange={setFilterDiff}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d} value={d}>{DIFF_LABELS[d]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Eye className="h-3 w-3" /> Vorschau: Aufgabentext eingeben
          </label>
          <Input placeholder="z.B. Umsatz: €120, Kosten: €70" value={previewText} onChange={(e) => setPreviewText(e.target.value)} />
        </div>
        <Button variant="ghost" size="sm" onClick={fetchTemplates}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Aktualisieren
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} von {templates.length} Templates
        {previewText.trim() && ` · ${Object.values(matchResults).filter(Boolean).length} Treffer`}
      </p>

      {/* Add new template */}
      <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Neues Template</h4>
        <div className="flex flex-wrap gap-2">
          <Select value={newType} onValueChange={setNewType}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {config.types.map((t) => (
                <SelectItem key={t} value={t}>{config.typeLabels[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={newDiff} onValueChange={setNewDiff}>
            <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d} value={d}>{DIFF_LABELS[d]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input className="w-[80px]" type="number" placeholder="Prio" value={newPriority} onChange={(e) => setNewPriority(Number(e.target.value))} />
        </div>
        <Input placeholder='Match-Regel, z.B. "contains: Gewinn" oder "regex: Marge"' value={newRule} onChange={(e) => setNewRule(e.target.value)} />
        <Textarea className="min-h-[50px] text-sm" placeholder="Erklärungstext…" value={newText} onChange={(e) => setNewText(e.target.value)} />
        <Button size="sm" onClick={handleAdd} disabled={adding}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> {adding ? "Erstelle…" : "Template hinzufügen"}
        </Button>
      </div>

      {/* Template list grouped by type */}
      {config.types.map((type) => {
        const items = grouped[type];
        if (!items || items.length === 0) return null;
        return (
          <div key={type} className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">{config.typeLabels[type] || type}</h3>
            <div className="space-y-2">
              {items.map((t) => {
                const edited = getEdited(t);
                const dirty = isDirty(t);
                const matches = matchResults[t.id];
                return (
                  <div key={t.id} className={`rounded-md border p-3 space-y-2 transition-colors ${matches === true ? "border-success/50 bg-success/5" : matches === false && previewText.trim() ? "opacity-50" : "border-border"}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${DIFF_COLORS[t.difficulty] || "bg-muted text-muted-foreground"}`}>{DIFF_LABELS[t.difficulty]}</span>
                      <span className="text-xs text-muted-foreground">Prio:</span>
                      <Input className="w-[60px] h-7 text-xs" type="number" value={edited.priority} onChange={(e) => updateField(t.id, "priority", Number(e.target.value))} />
                      <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-xs text-muted-foreground">Aktiv</span>
                        <Switch checked={edited.active} onCheckedChange={(v) => updateField(t.id, "active", v)} />
                      </div>
                    </div>
                    <Input className="text-xs font-mono" value={edited.match_rule} onChange={(e) => updateField(t.id, "match_rule", e.target.value)} placeholder="contains: Gewinn" />
                    <Textarea className="min-h-[40px] text-sm" value={edited.explanation_text} onChange={(e) => updateField(t.id, "explanation_text", e.target.value)} />
                    <div className="flex gap-1.5">
                      <Button size="sm" variant={dirty ? "default" : "ghost"} disabled={!dirty || saving === t.id} onClick={() => handleSave(t)}>
                        <Save className="mr-1 h-3.5 w-3.5" /> Speichern
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TemplateEditor;
