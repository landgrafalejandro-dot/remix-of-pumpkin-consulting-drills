import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type CaseMathQ = Tables<"case_math_questions">;
type MentalMathQ = Tables<"mental_math_questions">;

interface QuestionTableProps {
  module: "case_math" | "mental_math";
  questions: (CaseMathQ | MentalMathQ)[];
  totalCount: number;
  page: number;
  onPageChange: (p: number) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  difficultyFilter: string;
  onDifficultyFilterChange: (d: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (c: string) => void;
  activeFilter: string;
  onActiveFilterChange: (a: string) => void;
  onRefresh: () => void;
}

const PAGE_SIZE = 20;

const QuestionTable: React.FC<QuestionTableProps> = ({
  module, questions, totalCount, page, onPageChange,
  searchQuery, onSearchChange,
  difficultyFilter, onDifficultyFilterChange,
  categoryFilter, onCategoryFilterChange,
  activeFilter, onActiveFilterChange,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState<(CaseMathQ | MentalMathQ) | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  const tableName = module === "case_math" ? "case_math_questions" : "mental_math_questions";
  const categoryField = module === "case_math" ? "category" : "task_type";
  const categories = module === "case_math"
    ? ["profitability", "investment_roi", "break_even", "market_sizing"]
    : ["multiplication", "percentage", "division", "zero_management"];

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleToggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from(tableName).update({ active: !active }).eq("id", id);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      onRefresh();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from(tableName).delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Gelöscht" });
      onRefresh();
    }
    setDeleteId(null);
  };

  const openEdit = (q: CaseMathQ | MentalMathQ) => {
    setEditQuestion(q);
    setEditForm({
      question: q.question,
      answer_value: String(q.answer_value),
      answer_display: q.answer_display ?? "",
      tolerance: String(q.tolerance),
      tags: q.tags ?? "",
      explanation: q.explanation ?? "",
      difficulty: q.difficulty,
      [categoryField]: (q as any)[categoryField],
      ...("answer_unit" in q ? { answer_unit: (q as CaseMathQ).answer_unit ?? "" } : {}),
      ...("number_format" in q ? { number_format: (q as MentalMathQ).number_format ?? "" } : {}),
      ...("time_limit_sec" in q ? { time_limit_sec: String((q as MentalMathQ).time_limit_sec ?? "") } : {}),
    });
  };

  const handleSaveEdit = async () => {
    if (!editQuestion) return;
    const updates: Record<string, any> = {
      question: editForm.question,
      answer_value: Number(editForm.answer_value),
      answer_display: editForm.answer_display || null,
      tolerance: Number(editForm.tolerance) || 0,
      tags: editForm.tags || null,
      explanation: editForm.explanation || null,
      difficulty: editForm.difficulty as any,
      [categoryField]: editForm[categoryField] as any,
    };
    if (module === "case_math") {
      updates.answer_unit = editForm.answer_unit || null;
    } else {
      updates.number_format = editForm.number_format || null;
      updates.time_limit_sec = editForm.time_limit_sec ? Number(editForm.time_limit_sec) : null;
    }

    const { error } = await supabase.from(tableName).update(updates).eq("id", editQuestion.id);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Gespeichert" });
      onRefresh();
    }
    setEditQuestion(null);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Suche in Fragen & Tags…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={difficultyFilter} onValueChange={onDifficultyFilterChange}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Stufen</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Kategorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={activeFilter} onValueChange={onActiveFilterChange}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="true">Aktiv</SelectItem>
            <SelectItem value="false">Inaktiv</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">{totalCount} Aufgaben gefunden</p>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Difficulty</TableHead>
              <TableHead>{module === "case_math" ? "Category" : "Task Type"}</TableHead>
              <TableHead className="min-w-[250px]">Question</TableHead>
              <TableHead>Answer</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Keine Aufgaben gefunden.
                </TableCell>
              </TableRow>
            ) : (
              questions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="capitalize">{q.difficulty}</TableCell>
                  <TableCell>{(q as any)[categoryField]}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{q.question}</TableCell>
                  <TableCell>{q.answer_display || q.answer_value}</TableCell>
                  <TableCell>
                    <Switch checked={q.active} onCheckedChange={() => handleToggleActive(q.id, q.active)} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(q.created_at).toLocaleDateString("de-DE")}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(q)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(q.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Seite {page + 1} von {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aufgabe löschen?</DialogTitle>
            <DialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Abbrechen</Button>
            <Button variant="destructive" onClick={handleDelete}>Löschen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editQuestion} onOpenChange={() => setEditQuestion(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aufgabe bearbeiten</DialogTitle>
            <DialogDescription>Änderungen werden direkt gespeichert.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Difficulty</label>
              <Select value={editForm.difficulty} onValueChange={(v) => setEditForm((p) => ({ ...p, difficulty: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">{module === "case_math" ? "Category" : "Task Type"}</label>
              <Select value={editForm[categoryField]} onValueChange={(v) => setEditForm((p) => ({ ...p, [categoryField]: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Question</label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
                value={editForm.question}
                onChange={(e) => setEditForm((p) => ({ ...p, question: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Answer Value</label>
                <Input type="number" value={editForm.answer_value} onChange={(e) => setEditForm((p) => ({ ...p, answer_value: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Answer Display</label>
                <Input value={editForm.answer_display} onChange={(e) => setEditForm((p) => ({ ...p, answer_display: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Tolerance</label>
                <Input type="number" step="0.01" value={editForm.tolerance} onChange={(e) => setEditForm((p) => ({ ...p, tolerance: e.target.value }))} />
              </div>
              {module === "case_math" && (
                <div>
                  <label className="text-sm font-medium text-foreground">Unit</label>
                  <Input value={editForm.answer_unit ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, answer_unit: e.target.value }))} />
                </div>
              )}
              {module === "mental_math" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground">Number Format</label>
                    <Input value={editForm.number_format ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, number_format: e.target.value }))} />
                  </div>
                </>
              )}
            </div>
            {module === "mental_math" && (
              <div>
                <label className="text-sm font-medium text-foreground">Time Limit (sec)</label>
                <Input type="number" value={editForm.time_limit_sec ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, time_limit_sec: e.target.value }))} />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground">Tags</label>
              <Input value={editForm.tags} onChange={(e) => setEditForm((p) => ({ ...p, tags: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Explanation</label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={2}
                value={editForm.explanation}
                onChange={(e) => setEditForm((p) => ({ ...p, explanation: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditQuestion(null)}>Abbrechen</Button>
            <Button onClick={handleSaveEdit}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionTable;
