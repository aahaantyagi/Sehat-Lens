"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassCard, Badge } from "@/components/ui/Glass";
import { useApp, PARSE_STAGES } from "@/lib/store";

export default function Landing() {
  return (
    <div className="space-y-20 pb-10">
      <Hero />
      <BentoPreviews />
      <TrustStrip />
    </div>
  );
}

function Hero() {
  return (
    <section className="grid items-center gap-10 pt-10 lg:grid-cols-[1.1fr_1fr]">
      <div className="rise">
        <Badge tone="accent">Prototype · Sample data only</Badge>
        <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
          Your blood report,
          <br />
          <span className="text-[var(--color-accent)]">decoded.</span>
        </h1>
        <p className="mt-5 max-w-md text-lg text-muted">
          Drop a PDF or scan of your lab report. SehatLens reads it, explains every number
          in plain language, tracks your trajectories, and tells your doctor the whole story
          in one page.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <span className="dot-normal pulse-dot h-2 w-2 rounded-full" /> No signup in this prototype
          </span>
          <span>·</span>
          <span>~19 biomarkers</span>
          <span>·</span>
          <span>3 historical panels</span>
        </div>
      </div>
      <IngestDock />
    </section>
  );
}

function IngestDock() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { parsing, parseStageIndex, startParse, advanceParse, finishParse } = useApp();

  const begin = useCallback(() => {
    startParse();
  }, [startParse]);

  // Advance the simulated pipeline while parsing.
  useEffect(() => {
    if (!parsing) return;
    if (parseStageIndex >= PARSE_STAGES.length - 1) {
      const t = setTimeout(() => {
        finishParse();
        router.push("/dashboard");
      }, 650);
      return () => clearTimeout(t);
    }
    const t = setTimeout(advanceParse, 750);
    return () => clearTimeout(t);
  }, [parsing, parseStageIndex, advanceParse, finishParse, router]);

  if (parsing) return <ParseOverlay />;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        begin();
      }}
      className={`glass scanline relative flex h-72 flex-col items-center justify-center gap-3 overflow-hidden text-center transition-colors ${
        dragOver ? "border-[rgba(102,224,179,0.6)] bg-[rgba(102,224,179,0.06)]" : ""
      }`}
    >
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 16V4m0 0l-4 4m4-4l4 4"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 14v3a3 3 0 003 3h10a3 3 0 003-3v-3"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <div className="text-lg font-semibold">Drop your blood report</div>
      <div className="max-w-[240px] text-sm text-muted">
        PDF or scanned report. Any lab, any format — parsing runs in your browser here.
      </div>
      <button
        onClick={() => fileRef.current?.click()}
        className="btn-primary mt-1 px-4 py-1.5 text-sm"
      >
        Browse files
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={() => begin()}
      />
      <button
        onClick={begin}
        className="mt-3 text-xs text-muted underline underline-offset-4 hover:text-primary"
      >
        No report handy? Load a sample panel instead
      </button>
    </div>
  );
}

function ParseOverlay() {
  const { parseStageIndex } = useApp();
  return (
    <div className="glass flex h-72 flex-col justify-center gap-5 p-6">
      <div className="text-sm uppercase tracking-[0.2em] text-muted">Parsing report</div>
      {PARSE_STAGES.map((s, i) => {
        const done = i < parseStageIndex;
        const active = i === parseStageIndex;
        return (
          <div key={s.key} className="flex items-center gap-3">
            <span
              className={`h-2 w-2 rounded-full ${
                done ? "dot-normal" : active ? "dot-borderline pulse-dot" : "bg-white/15"
              }`}
            />
            <div className="flex-1">
              <div className={`text-sm ${done || active ? "text-primary" : "text-muted"}`}>
                {s.label}
              </div>
              {active && <div className="text-xs text-muted">{s.detail}</div>}
            </div>
            {done && <span className="text-xs text-[var(--color-normal)]">done</span>}
          </div>
        );
      })}
      <div className="h-1 overflow-hidden rounded bg-white/8">
        <div
          className="h-full bg-[var(--color-accent)] transition-all duration-500"
          style={{ width: `${((parseStageIndex + 1) / PARSE_STAGES.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

function BentoPreviews() {
  const tiles = [
    {
      title: "Bento dashboard",
      desc: "Every biomarker as a color-coded tile with trend arrows against your last panels.",
      href: "/dashboard",
      cta: "Open dashboard",
      accent: "var(--color-normal)",
    },
    {
      title: "Deep-dives",
      desc: "Plain-language explanations, physiology, and food/lifestyle fixes per marker.",
      href: "/dashboard/biomarker/hba1c",
      cta: "Peek HbA1c",
      accent: "var(--color-borderline)",
    },
    {
      title: "Specialist finder",
      desc: "Verified doctors near you, matched to exactly the anomalies on your report.",
      href: "/find-care",
      cta: "Find specialists",
      accent: "rgba(96,165,250,0.9)",
    },
    {
      title: "Safe-dose pharmacy",
      desc: "Check any medicine against your latest labs before you take it.",
      href: "/pharmacy",
      cta: "Check a medicine",
      accent: "var(--color-critical)",
    },
  ];
  return (
    <section>
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">What SehatLens does with it</h2>
        <span className="hidden text-xs text-muted sm:block">All pages live — click through</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.title} href={t.href} className="group">
            <GlassCard hover className="flex h-full flex-col p-5">
              <span
                className="mb-4 inline-block h-1.5 w-10 rounded-full"
                style={{ background: t.accent }}
              />
              <div className="font-semibold">{t.title}</div>
              <p className="mt-1.5 flex-1 text-sm text-muted">{t.desc}</p>
              <span className="mt-4 text-sm text-[var(--color-accent)] opacity-80 transition-opacity group-hover:opacity-100">
                {t.cta} →
              </span>
            </GlassCard>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="glass p-6">
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          {
            k: "01 — Read",
            v: "Table detection + OCR map your lab's format onto 19 biomarkers with validated reference ranges.",
          },
          {
            k: "02 — Explain",
            v: "Each number gets a plain-language meaning, the physiology behind it, and graded confidence.",
          },
          {
            k: "03 — Act",
            v: "Trajectories, matched specialists, a printable doctor brief, and lab-aware medicine checks.",
          },
        ].map((s) => (
          <div key={s.k}>
            <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">{s.k}</div>
            <p className="mt-2 text-sm text-muted">{s.v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
