import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type GeneratedQuestion = {
  q: string;
  options: string[];
  correct: number;
};

export const createTestRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      pdfUploadId: string | null;
      title: string;
      examType: string;
      difficulty: "easy" | "medium" | "hard";
      questionCount: number;
      durationMin: number;
      questions: GeneratedQuestion[];
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: test, error: testErr } = await supabase
      .from("tests")
      .insert({
        user_id: userId,
        pdf_upload_id: data.pdfUploadId,
        title: data.title,
        exam_type: data.examType,
        difficulty: data.difficulty,
        question_count: data.questionCount,
        duration_min: data.durationMin,
      })
      .select("id")
      .single();
    if (testErr || !test) throw new Error(testErr?.message ?? "Could not create test");

    const rows = data.questions.map((q, i) => ({
      test_id: test.id,
      user_id: userId,
      position: i,
      prompt: q.q,
      options: q.options,
      correct_option: q.correct,
    }));
    const { error: qErr } = await supabase.from("test_questions").insert(rows);
    if (qErr) throw new Error(qErr.message);

    return { testId: test.id };
  });

export const submitTestAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      testId: string;
      answers: Record<number, number>;
      score: number;
      total: number;
      timeTakenSec: number;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const percent = data.total > 0 ? (data.score / data.total) * 100 : 0;
    const { error } = await supabase.from("test_attempts").insert({
      user_id: userId,
      test_id: data.testId,
      answers: data.answers,
      score: data.score,
      total: data.total,
      percent,
      time_taken_sec: data.timeTakenSec,
      completed_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type TestHistoryItem = {
  id: string;
  testId: string;
  fileName: string;
  exam: string;
  difficulty: string;
  total: number;
  correct: number;
  attempted: number;
  finishedAt: number;
};

export const listMyTestAttempts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TestHistoryItem[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("test_attempts")
      .select(
        "id, test_id, answers, score, total, completed_at, created_at, tests:test_id ( title, exam_type, difficulty )",
      )
      .eq("user_id", userId)
      .order("completed_at", { ascending: false, nullsFirst: false })
      .limit(50);
    if (error) throw new Error(error.message);

    return (data ?? []).map((row: any) => {
      const answersObj = (row.answers ?? {}) as Record<string, number>;
      return {
        id: row.id,
        testId: row.test_id,
        fileName: row.tests?.title ?? "Mock Test",
        exam: row.tests?.exam_type ?? "",
        difficulty: row.tests?.difficulty ?? "",
        total: row.total ?? 0,
        correct: row.score ?? 0,
        attempted: Object.keys(answersObj).length,
        finishedAt: new Date(row.completed_at ?? row.created_at).getTime(),
      };
    });
  });