import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TASK_TYPES: Record<string, string[]> = {
  case_math: ["profitability", "investment_roi", "break_even", "market_sizing"],
  mental_math: ["multiplication", "percentage", "division", "zero_management"],
};

interface DrillTask {
  id: string;
  category: string;
  difficulty: string;
  task_type: string | null;
  task: string;
  active: boolean;
  created_at: string;
}

interface QuestionTableProps {
  questions: DrillTask[];
  totalCount: number;
  page: number;
  onPageChange: (p: number) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  difficultyFilter: string;
  onDifficultyFilterChange: (d: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (c: string) => void;
  taskTypeFilter: string;
  onTaskTypeFilterChange: (t: string) => void;
  activeFilter: string;
  onActiveFilterChange: (a: string) => void;
  onRefresh: () => void;
}

const PAGE_SIZE = 20;

const QuestionTable: React.FC<QuestionTableProps> = ({
  questions, totalCount, page, onPageChange,
  searchQuery, onSearchChange,
  difficultyFilter, onDifficultyFilterChange,
  categoryFilter, onCategoryFilterChange,
  taskTypeFilter, onTaskTypeFilterChange,
  activeFilter, onActiveFilterChange,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<DrillTask | null>(null);
  const [editForm, setEditForm] = useState({ category: "", difficulty: "", task_type: "", task: "" });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleToggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from("drill_tasks").update({ active: !active } as any).eq("id", id);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      onRefresh();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("drill_tasks").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Gelöscht" });
      onRefresh();
    }
    setDeleteId(null);
  };

  const openEdit = (q: DrillTask) => {
    setEditTask(q);
    setEditForm({ category: q.category, difficulty: q.difficulty, task_type: q.task_type ?? "", task: q.task });
  };

  const handleSaveEdit = async () => {
    if (!editTask) return;
    const { error } = await supabase.from("drill_tasks").update({
      category: editForm.category,
      difficulty: editForm.difficulty,
      task_type: editForm.task_type || null,
      task: editForm.task,
    } as any).eq("id", editTask.id);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Gespeichert" });
      onRefresh();
    }
    setEditTask(null);
  };

  const editTaskTypes = TASK_TYPES[editForm.category] ?? [];

  // Collect all task types for filter
  const allTaskTypes = [...new Set(Object.values(TASK_TYPES).flat())];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Suche in Aufgaben…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Kategorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            <SelectItem value="case_math">Case Math</SelectItem>
            <SelectItem value="mental_math">Mental Math</SelectItem>
          </SelectContent>
        </Select>
        <Select value={taskTypeFilter} onValueChange={onTaskTypeFilterChange}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Aufgabentyp" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            {allTaskTypes.map((t) => (
              <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={onDifficultyFilterChange}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Stufen</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
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

      <p className="text-sm text-muted-foreground">{totalCount} Aufgaben gefunden</p>

      <div className="rounded-lg border border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="min-w-[300px]">Task</TableHead>
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
                  <TableCell>{q.category}</TableCell>
                  <TableCell className="text-xs">{q.task_type?.replace(/_/g, " ") ?? "–"}</TableCell>
                  <TableCell className="capitalize">{q.difficulty}</TableCell>
                  <TableCell className="max-w-[400px] truncate">{q.task}</TableCell>
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
      <Dialog open={!!editTask} onOpenChange={() => setEditTask(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Aufgabe bearbeiten</DialogTitle>
            <DialogDescription>Änderungen werden direkt gespeichert.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select value={editForm.category} onValueChange={(v) => setEditForm((p) => ({ ...p, category: v, task_type: "" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="case_math">Case Math</SelectItem>
                  <SelectItem value="mental_math">Mental Math</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editTaskTypes.length > 0 && (
              <div>
                <label className="text-sm font-medium text-foreground">Type</label>
                <Select value={editForm.task_type} onValueChange={(v) => setEditForm((p) => ({ ...p, task_type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Aufgabentyp…" /></SelectTrigger>
                  <SelectContent>
                    {editTaskTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
              <label className="text-sm font-medium text-foreground">Task</label>
              <Textarea
                rows={4}
                value={editForm.task}
                onChange={(e) => setEditForm((p) => ({ ...p, task: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTask(null)}>Abbrechen</Button>
            <Button onClick={handleSaveEdit}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionTable;
