import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { RequireAuth } from "@/components/AppShell";
import { UploadCloud, FileText, Settings2, Loader2, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

const EXAMS = [
  { id: "jee", label: "JEE Main (+4 / -1 marking)" },
  { id: "neet", label: "NEET (+4 / -1 marking)" },
  { id: "cbse", label: "CBSE Boards (No negative marking)" },
];
const COUNTS = [10, 20, 30, 50] as const;

function Dashboard() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}

function DashboardInner() {
  const [file, setFile] = React.useState<File | null>(null);
  const [exam, setExam] = React.useState("");
  const [count, setCount] = React.useState<number | "">("");
  const [dragging, setDragging] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const ready = !!file && !!exam && !!count;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    setFile(f);
    setDone(false);
  };

  const generate = async () => {
    setGenerating(true);
    setDone(false);
    await new Promise((r) => setTimeout(r, 2200));
    setGenerating(false);
    setDone(true);
  };

  return (
    <div>
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Dashboard</div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">PDF Quiz Creator</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Drop your study material, pick your exam pattern, and we'll forge a personalised mock test.
        </p>
      </header>

      <section
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed transition p-10 sm:p-14 text-center",
          dragging ? "border-foreground bg-accent/60" : "border-border bg-card hover:bg-accent/40",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="mx-auto h-14 w-14 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
          <UploadCloud className="h-7 w-7" />
        </div>
        <div className="text-lg font-medium">Drop your PDF here</div>
        <div className="text-sm text-muted-foreground mt-1">
          or <span className="underline underline-offset-4">browse your files</span>
        </div>
        <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-[12px] font-medium text-destructive">
          ⚠️ Maximum Allowed: 50 Pages & 10MB File Size
        </div>

        {file && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-6 mx-auto max-w-sm flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left"
          >
            <FileText className="h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{file.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB · PDF
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-accent"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Select Exam Type"
          value={exam}
          onChange={setExam}
          placeholder="Choose exam pattern"
          options={EXAMS.map((e) => ({ value: e.id, label: e.label }))}
        />
        <SelectField
          label="Number of Questions"
          value={count === "" ? "" : String(count)}
          onChange={(v) => setCount(v ? Number(v) : "")}
          placeholder="Choose total questions"
          options={COUNTS.map((c) => ({ value: String(c), label: `${c} Questions` }))}
        />
      </section>

      <section className="mt-8">
        <button
          disabled={!ready || generating}
          onClick={generate}
          className={cn(
            "w-full sm:w-auto h-12 px-8 rounded-xl font-medium text-sm transition inline-flex items-center justify-center gap-2",
            "bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Forging your mock test…
            </>
          ) : (
            <>
              <Settings2 className="h-4 w-4" />
              Create Mock Test
            </>
          )}
        </button>

        {done && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            Your mock test has been generated successfully.
          </div>
        )}
      </section>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full h-12 appearance-none rounded-xl border border-border bg-card px-4 pr-10 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-ring",
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </label>
  );
}