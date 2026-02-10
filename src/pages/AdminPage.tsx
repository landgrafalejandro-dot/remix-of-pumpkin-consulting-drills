import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LogIn, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CsvUpload from "@/components/admin/CsvUpload";
import QuestionTable from "@/components/admin/QuestionTable";
import pumpkinLogo from "@/assets/pumpkin-logo.jpg";

const PAGE_SIZE = 20;

const AdminPage: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Add form
  const [newCategory, setNewCategory] = useState("case_math");
  const [newDifficulty, setNewDifficulty] = useState("easy");
  const [newTask, setNewTask] = useState("");
  const [saving, setSaving] = useState(false);

  // Table state
  const [questions, setQuestions] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [importing, setImporting] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoggedIn(false);
      setIsAdmin(false);
      return;
    }
    setIsLoggedIn(true);
    const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    setIsAdmin(!!data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login fehlgeschlagen", description: error.message, variant: "destructive" });
    }
  };

  const fetchQuestions = useCallback(async () => {
    let q = supabase
      .from("drill_tasks")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (difficultyFilter !== "all") q = q.eq("difficulty", difficultyFilter as any);
    if (categoryFilter !== "all") q = q.eq("category", categoryFilter as any);
    if (activeFilter !== "all") q = q.eq("active", activeFilter === "true");
    if (searchQuery.trim()) q = q.ilike("task", `%${searchQuery}%`);

    const { data, count, error } = await q;
    if (error) {
      toast({ title: "Fehler beim Laden", description: error.message, variant: "destructive" });
      return;
    }
    setQuestions(data ?? []);
    setTotalCount(count ?? 0);
  }, [page, difficultyFilter, categoryFilter, activeFilter, searchQuery, toast]);

  useEffect(() => {
    if (isAdmin) fetchQuestions();
  }, [isAdmin, fetchQuestions]);

  const handleAddTask = async () => {
    if (!newTask.trim()) {
      toast({ title: "Bitte Task eingeben", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("drill_tasks").insert({
      category: newCategory,
      difficulty: newDifficulty,
      task: newTask.trim(),
    } as any);
    setSaving(false);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Aufgabe gespeichert" });
      setNewTask("");
      fetchQuestions();
    }
  };

  const handleImport = async (rows: Record<string, string>[]) => {
    setImporting(true);
    let inserted = 0;
    let skipped = 0;
    let failed = 0;

    for (const row of rows) {
      const { error } = await supabase.from("drill_tasks").insert({
        category: row.category,
        difficulty: row.difficulty,
        task: row.task,
      } as any);
      if (error) {
        if (error.code === "23505") {
          skipped++;
        } else {
          failed++;
        }
      } else {
        inserted++;
      }
    }

    setImporting(false);
    toast({
      title: "Import abgeschlossen",
      description: `${inserted} eingefügt, ${skipped} Duplikate übersprungen, ${failed} fehlgeschlagen`,
    });
    fetchQuestions();
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-3">
            <img src={pumpkinLogo} alt="Logo" className="h-12 w-auto" />
            <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Passwort" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" /> Anmelden
            </Button>
          </form>
          <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  if (isAdmin === null) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Laden…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <h1 className="mb-4 text-2xl font-bold text-foreground">Kein Zugriff</h1>
        <p className="mb-6 text-muted-foreground">Du hast keine Admin-Berechtigung.</p>
        <Link to="/">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Zurück</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <img src={pumpkinLogo} alt="Logo" className="h-8 w-auto" />
          <h1 className="text-xl font-bold text-foreground">Aufgaben verwalten</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>Abmelden</Button>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Add task form */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Neue Aufgabe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="case_math">Case Math</SelectItem>
                  <SelectItem value="mental_math">Mental Math</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newDifficulty} onValueChange={setNewDifficulty}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Aufgabentext eingeben…"
              rows={3}
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <Button onClick={handleAddTask} disabled={saving}>
              <Plus className="mr-2 h-4 w-4" /> {saving ? "Speichere…" : "Speichern"}
            </Button>
          </CardContent>
        </Card>

        {/* CSV Import (collapsible) */}
        <Collapsible open={csvOpen} onOpenChange={setCsvOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              {csvOpen ? "▾" : "▸"} CSV Import
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <CsvUpload onImport={handleImport} importing={importing} />
          </CollapsibleContent>
        </Collapsible>

        {/* Task table */}
        <QuestionTable
          questions={questions}
          totalCount={totalCount}
          page={page}
          onPageChange={setPage}
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); setPage(0); }}
          difficultyFilter={difficultyFilter}
          onDifficultyFilterChange={(d) => { setDifficultyFilter(d); setPage(0); }}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={(c) => { setCategoryFilter(c); setPage(0); }}
          activeFilter={activeFilter}
          onActiveFilterChange={(a) => { setActiveFilter(a); setPage(0); }}
          onRefresh={fetchQuestions}
        />
      </main>
    </div>
  );
};

export default AdminPage;
