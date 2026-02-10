import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CsvUpload from "./CsvUpload";
import QuestionTable from "./QuestionTable";
import type { Tables } from "@/integrations/supabase/types";

type CaseMathQ = Tables<"case_math_questions">;
type MentalMathQ = Tables<"mental_math_questions">;

const PAGE_SIZE = 20;

interface AdminModuleTabProps {
  module: "case_math" | "mental_math";
}

const AdminModuleTab: React.FC<AdminModuleTabProps> = ({ module }) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<(CaseMathQ | MentalMathQ)[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [importing, setImporting] = useState(false);

  const tableName = module === "case_math" ? "case_math_questions" as const : "mental_math_questions" as const;
  const categoryField = module === "case_math" ? "category" : "task_type";

  const fetchCaseMath = useCallback(async () => {
    let q = supabase
      .from("case_math_questions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (difficultyFilter !== "all") q = q.eq("difficulty", difficultyFilter as any);
    if (categoryFilter !== "all") q = q.eq("category", categoryFilter as any);
    if (activeFilter !== "all") q = q.eq("active", activeFilter === "true");
    if (searchQuery.trim()) q = q.or(`question.ilike.%${searchQuery}%,tags.ilike.%${searchQuery}%`);
    return q;
  }, [page, difficultyFilter, categoryFilter, activeFilter, searchQuery]);

  const fetchMentalMath = useCallback(async () => {
    let q = supabase
      .from("mental_math_questions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (difficultyFilter !== "all") q = q.eq("difficulty", difficultyFilter as any);
    if (categoryFilter !== "all") q = q.eq("task_type", categoryFilter as any);
    if (activeFilter !== "all") q = q.eq("active", activeFilter === "true");
    if (searchQuery.trim()) q = q.or(`question.ilike.%${searchQuery}%,tags.ilike.%${searchQuery}%`);
    return q;
  }, [page, difficultyFilter, categoryFilter, activeFilter, searchQuery]);

  const fetchQuestions = useCallback(async () => {
    const { data, count, error } = module === "case_math"
      ? await fetchCaseMath()
      : await fetchMentalMath();
    if (error) {
      toast({ title: "Fehler beim Laden", description: error.message, variant: "destructive" });
      return;
    }
    setQuestions((data ?? []) as (CaseMathQ | MentalMathQ)[]);
    setTotalCount(count ?? 0);
  }, [module, fetchCaseMath, fetchMentalMath, toast]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleImport = async (rows: Record<string, string>[]) => {
    setImporting(true);
    let inserted = 0;
    let skipped = 0;
    let failed = 0;

    for (const row of rows) {
      const base: Record<string, any> = {
        module: row.module || (module === "case_math" ? "case_math" : "mental_math"),
        difficulty: row.difficulty as any,
        question: row.question,
        answer_value: Number(row.answer_value),
        answer_display: row.answer_display || null,
        tolerance: Number(row.tolerance) || 0,
        tags: row.tags || null,
        explanation: row.explanation || null,
        active: row.active === "" || row.active === "true" || row.active === "1" ? true : false,
      };

      if (module === "case_math") {
        base.category = row.category as any;
        base.answer_unit = row.answer_unit || null;
      } else {
        base.task_type = row.task_type as any;
        base.number_format = row.number_format || null;
        base.time_limit_sec = row.time_limit_sec ? Number(row.time_limit_sec) : null;
      }

      const { error } = await supabase.from(tableName).insert(base as any);
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

  return (
    <div className="space-y-8">
      <CsvUpload module={module} onImport={handleImport} importing={importing} />
      <QuestionTable
        module={module}
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
    </div>
  );
};

export default AdminModuleTab;
