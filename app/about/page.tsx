import Link from "next/link";
import { GlassCard, Badge, Micro } from "@/components/ui/Glass";
import { BIOMARKERS } from "@/lib/data/biomarkers";
import { MEDICINES } from "@/lib/data/medicines";
import { INTERACTION_RULES } from "@/lib/data/interactions";

export const metadata = {
  title: "About — SehatLens",
};

const STEPS = [
  {
    k: "01 · Ingest",
    t: "Drop any lab PDF or scan",
    d: "The parser reads your report's layout, detects the analyte table, and maps each lab's naming quirks onto SehatLens's standardized biomarker knowledge base.",
  },
  {
    k: "02 · Explain",
    t: "Plain language, graded confidence",
    d: "Each value gets a plain-language meaning, the physiology behind it, and a confidence grade. High means reference-standard; Moderate means interpret with context. We show our work.",
  },
  {
    k: "03 · Act",
    t: "Trajectories, doctors, safe doses",
    d: "Panels become trends, flagged anomalies route to verified specialists, and medicines are screened against your actual labs before you take them.",
  },
];

export default function About() {
  return (
    <div className="space-y-8">
      <div className="rise">
        <Micro>About</Micro>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-strong">
          SehatLens — your blood report, decoded
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
          Sehat (health) + Lens (clarity). Drop a blood report, and it becomes a living dashboard:
          every biomarker explained in plain language, tracked across time, screened against your
          medicines, and packaged into a one-page brief your doctor can read in 90 seconds.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <GlassCard key={s.k} className="p-5">
            <div className="micro text-[var(--accent)]">{s.k}</div>
            <div className="mt-2 font-semibold text-strong">{s.t}</div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.d}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-6">
        <Micro>How to read the confidence badges</Micro>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <Badge tone="optimal">High confidence</Badge>
            <p className="mt-2 text-sm text-muted">
              Decades of trial data and guideline consensus (e.g. HbA1c, LDL). Treat the explanation
              as close to settled medicine.
            </p>
          </div>
          <div>
            <Badge tone="borderline">Moderate confidence</Badge>
            <p className="mt-2 text-sm text-muted">
              Validated but context-dependent markers (e.g. HDL, T3, hs-CRP). Direction is useful;
              numbers alone don&apos;t decide care.
            </p>
          </div>
          <div>
            <Badge tone="neutral">Emerging</Badge>
            <p className="mt-2 text-sm text-muted">
              Promising but not yet guideline-grade. Interesting signal, not a diagnosis — always
              pair with clinical judgment.
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <Micro>What&apos;s under the hood</Micro>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          {[
            [BIOMARKERS.length, "curated biomarkers"],
            [MEDICINES.length, "medicines tracked"],
            [INTERACTION_RULES.length, "drug-lab rules"],
          ].map(([n, label]) => (
            <div key={String(label)}>
              <div className="num text-3xl text-strong">{n}</div>
              <div className="micro mt-1 text-muted">{label}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-faint">
          This is a prototype running on curated sample data. The parsing pipeline, LLM explainer,
          and doctor directory are interface-ready but simulated. Nothing here is medical advice.
        </p>
      </GlassCard>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard" className="btn-primary flex h-10 items-center px-5 text-sm">
          Open the dashboard →
        </Link>
        <Link
          href="/?upload=1"
          className="pill flex h-10 items-center px-5 text-sm"
        >
          Upload a panel
        </Link>
      </div>
    </div>
  );
}
