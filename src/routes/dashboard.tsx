import { createFileRoute, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { RequireAuth } from "@/components/AppShell";
import {
  UploadCloud,
  FileText,
  Sparkles,
  Loader2,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGuestGate } from "@/components/GuestGate";
import { useNotifications } from "@/lib/notifications";
import { useServerFn } from "@tanstack/react-start";
import {
  createPdfUploadRecord,
  failPdfUpload,
  finalizePdfUpload,
} from "@/lib/pdfs.functions";
import { supabase } from "@/integrations/supabase/client";
import { PDF_MAX_BYTES, isValidPdfFile } from "@/lib/pdf-config";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

const EXAMS = [
  { id: "jee", label: "JEE" },
  { id: "neet", label: "NEET" },
  { id: "cbse", label: "CBSE" },
];
const COUNTS = [10, 20, 30, 50] as const;
const DIFFICULTIES = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

const MAX_BYTES = PDF_MAX_BYTES;

function Dashboard() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}

function DashboardInner() {
  const router = useRouter();
  const { ensureFullAccess } = useGuestGate();
  const { notify } = useNotifications();
  const createRecord = useServerFn(createPdfUploadRecord);
  const finalize = useServerFn(finalizePdfUpload);
  const markFailed = useServerFn(failPdfUpload);
  const [file, setFile] = React.useState<File | null>(null);
  const [pdfId, setPdfId] = React.useState<string | null>(null);
  const [exam, setExam] = React.useState("");
  const [count, setCount] = React.useState<number | "">("");
  const [difficulty, setDifficulty] = React.useState("");
  const [dragging, setDragging] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const xhrRef = React.useRef<XMLHttpRequest | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const ready = !!file && !!pdfId && !uploading && !!exam && !!count && !!difficulty;

  const resetFile = () => {
    if (xhrRef.current) {
      try { xhrRef.current.abort(); } catch {}
      xhrRef.current = null;
    }
    setFile(null);
    setPdfId(null);
    setProgress(0);
    setUploading(false);
    setUploadError(null);
  };

  async function uploadFile(f: File) {
    setFile(f);
    setUploading(true);
    setProgress(0);
    setUploadError(null);
    setPdfId(null);

    let createdId: string | null = null;
    try {
      const record = await createRecord({
        data: { title: f.name, size_bytes: f.size },
      });
      createdId = record.pdfId;

      // Per-user signed upload URL — RLS scopes to {auth.uid()}/ prefix.
      const { data: signed, error: signErr } = await supabase.storage
        .from(record.bucket)
        .createSignedUploadUrl(record.storage_path);
      if (signErr || !signed) throw new Error(signErr?.message ?? "Could not start upload");

      // XHR PUT so we get real progress events. fetch() in browsers does
      // not expose upload progress on a request body.
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open("PUT", signed.signedUrl, true);
        xhr.setRequestHeader("Content-Type", "application/pdf");
        xhr.setRequestHeader("x-upsert", "false");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.min(99, (e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          xhrRef.current = null;
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed (${xhr.status})`));
        };
        xhr.onerror = () => {
          xhrRef.current = null;
          reject(new Error("Network error during upload"));
        };
        xhr.onabort = () => {
          xhrRef.current = null;
          reject(new Error("Upload cancelled"));
        };
        xhr.send(f);
      });

      const row = await finalize({ data: { pdfId: createdId } });
      setPdfId(row.id);
      setProgress(100);
      setUploading(false);
      toast.success("PDF uploaded successfully.");
      notify({
        type: "system",
        title: "PDF uploaded",
        body: `${f.name} is ready for mock test generation.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploading(false);
      setUploadError(message);
      toast.error(message);
      if (createdId) {
        try {
          await markFailed({ data: { pdfId: createdId, reason: message } });
        } catch {}
      }
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!ensureFullAccess("Uploading PDFs is a member feature.")) return;
    const f = files[0];
    const check = isValidPdfFile(f);
    if (!check.ok) {
      toast.error(check.reason);
      return;
    }
    void uploadFile(f);
  };

  const retryUpload = () => {
    if (file) void uploadFile(file);
  };

  const generate = async () => {
    if (!ensureFullAccess("Generating mock tests is a member feature.")) return;
    if (!pdfId) {
      toast.error("Please wait for the PDF upload to finish.");
      return;
    }
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1600));
    const config = {
      pdfId,
      fileName: file!.name,
      exam,
      count: Number(count),
      difficulty,
      startedAt: Date.now(),
    };
    sessionStorage.setItem("prepzo.test.config", JSON.stringify(config));
    setGenerating(false);
    notify({
      type: "test",
      title: "Mock test generated",
      body: `${config.count} ${difficulty} questions ready — ${exam.toUpperCase()}.`,
    });
    router.navigate({ to: "/test" });
  };

  return (
    <div>
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Dashboard
        </div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
          Generate a Mock Test
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Drop your study material, choose your exam pattern, and PrepZo will craft a
          personalised quiz instantly.
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[1.5fr_1fr] lg:gap-6 lg:items-start">
        <div>
      {/* Upload */}
      <section
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer rounded-3xl border-2 border-dashed transition p-10 sm:p-14 text-center overflow-hidden",
          dragging
            ? "border-foreground bg-accent/70 scale-[1.005]"
            : "border-border bg-card hover:bg-accent/40",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="relative mx-auto h-16 w-16 rounded-2xl bg-foreground/5 flex items-center justify-center mb-4">
          <UploadCloud className={cn("h-8 w-8 transition", dragging && "animate-bounce")} />
          <span className="absolute inset-0 rounded-2xl bg-foreground/10 blur-xl opacity-50 animate-pulse-glow" />
        </div>
        <div className="text-lg font-medium">Drop your PDF here</div>
        <div className="text-sm text-muted-foreground mt-1">
          or <span className="underline underline-offset-4">browse your files</span>
        </div>

        {file && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-6 mx-auto max-w-md text-left rounded-2xl border border-border bg-background px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB · PDF
                </div>
              </div>
              {!uploading && (
                <button
                  onClick={resetFile}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-accent"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {!uploading && progress === 100 && (
                <CheckCircle2 className="h-4 w-4 text-foreground" />
              )}
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1.5 text-[10px] text-muted-foreground text-right">
              {uploading
                ? `Uploading… ${Math.round(progress)}%`
                : uploadError
                ? "Upload failed"
                : "Ready"}
            </div>
            {uploadError && !uploading && (
              <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-destructive">
                <span className="truncate">{uploadError}</span>
                <button
                  onClick={retryUpload}
                  className="shrink-0 rounded-md border border-destructive/40 px-2 py-1 text-[11px] hover:bg-destructive/10"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Warning */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-[12px] text-destructive">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <span className="leading-relaxed">
          <strong className="font-semibold">NOTE:</strong> PDF must be under 10MB and maximum 50
          pages for optimal quiz generation.
        </span>
      </div>
        </div>

      {/* Configuration */}
      <section className="mt-8 lg:mt-0 rounded-3xl border border-border bg-card p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="h-4 w-4" />
          <h2 className="text-base font-semibold tracking-tight">Test Configuration</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-1 gap-4">
          <SelectField
            label="Exam Type"
            value={exam}
            onChange={setExam}
            placeholder="Select exam"
            options={EXAMS.map((e) => ({ value: e.id, label: e.label }))}
          />
          <SelectField
            label="Number of Questions"
            value={count === "" ? "" : String(count)}
            onChange={(v) => setCount(v ? Number(v) : "")}
            placeholder="Select count"
            options={COUNTS.map((c) => ({ value: String(c), label: `${c} Questions` }))}
          />
          <SelectField
            label="Difficulty"
            value={difficulty}
            onChange={setDifficulty}
            placeholder="Select level"
            options={DIFFICULTIES.map((d) => ({ value: d.id, label: d.label }))}
          />
        </div>

        <div className="mt-7">
          <button
            disabled={!ready || generating || uploading}
            onClick={generate}
            className={cn(
              "group relative w-full sm:w-auto h-12 px-8 rounded-2xl font-medium text-sm transition inline-flex items-center justify-center gap-2 overflow-hidden",
              "bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-[1px]",
            )}
          >
            <span
              aria-hidden
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none"
              style={{
                background:
                  "linear-gradient(110deg, transparent 30%, color-mix(in oklab, var(--color-background) 35%, transparent) 50%, transparent 70%)",
                backgroundSize: "200% 100%",
                animation: "prepzo-shimmer 1.6s linear infinite",
              }}
            />
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Forging your mock test…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                Generate Mock Test
              </>
            )}
          </button>
        </div>
      </section>
      </div>
    </div>
  );
}

function SelectField({
  label, value, onChange, options, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
        {label}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full h-12 appearance-none rounded-xl border border-border bg-background px-4 pr-10 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-ring transition",
          )}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <svg
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60"
          viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </label>
  );
}