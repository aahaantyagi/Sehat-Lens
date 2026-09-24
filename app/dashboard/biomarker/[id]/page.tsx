"use client";

import Link from "next/link";
import { use } from "react";
import { GlassCard, Badge, SectionHeading } from "@/components/ui/Glass";
import { activeReport } from "@/lib/store";
import { getBiomarkerMeta, positionInRange, STATUS_LABEL, fmtValue, fmtDelta } from "@/lib/health";
import type { BiomarkerValue } from "@/lib/types";

export default function BiomarkerDeepDive({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const meta = getBiomarkerMeta(id);
  const report = activeReport();
  const bv = report.biomarkers.find((b) => b.id === id);

  if (!meta || !bv) return <NotFound id={id} />;

  const pos = positionInRange(id, bv.value);
  const tone = bv.status;
  const confidenceTone: "optimal" | "borderline" =
    meta.confidence === "High" ? "optimal" : "borderline";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-muted hover:text-primary">
          ← Back to dashboard
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{meta.name}</h1>
          <Badge tone={tone}>{STATUS_LABEL[bv.status]}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted">
          {meta.category} · {meta.panel}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        {/* Left: value + gauge + history */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold st-${bv.status}`}>{fmtValue(bv.value)}</span>
              <span className="text-sm text-muted">{bv.unit}</span>
              {bv.delta !== null && (
                <span className="ml-auto text-sm text-muted">
                  {fmtDelta(bv.delta)} <span className="text-xs">vs last panel</span>
                </span>
              )}
            </div>

            {/* Range gauge */}
            <div className="mt-6">
              <div className="relative h-2.5 rounded-full bg-gradient-to-r from-[rgba(251,113,133,0.35)] via-[rgba(74,222,128,0.4)] to-[rgba(251,191,36,0.35)]">
                <div
                  className="absolute -top-1 h-4.5 w-4.5 -translate-x-1/2 rounded-full border-2 border-base bg-white shadow"
                  style={{ left: `${pos * 100}%`, height: 18, width: 18 }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted">
                <span>{fmtValue(meta.range.min)} {meta.range.alt ? `(M) · ${meta.range.alt.min} (F)` : ""}</span>
                <span>{fmtValue(meta.range.max)}</span>
              </div>
              <div className="mt-1 text-xs text-muted">Reference range {fmtValue(meta.range.min)}–{fmtValue(meta.range.max)} {meta.unit}</div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">History</div>
            <table className="mt-3 w-full text-sm">
              <tbody>
                {[...bv.history].reverse().map((h, i) => (
                  <tr key={h.date} className={i === 0 ? "text-primary" : "text-muted"}>
                    <td className="py-1.5">
                      {new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-1.5 text-right font-mono">{fmtValue(h.value)}</td>
                    {i === 0 && <td className="pl-2 text-xs">current</td>}
                    {i > 0 && <td />}
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </div>

        {/* Right: explanation stack */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold">What this means, plainly</h2>
              <Badge tone={confidenceTone}>
                ✓ Confidence: {meta.confidence}
              </Badge>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-primary/90">{meta.layExplanation}</p>
            <p className="mt-2 border-l-2 border-[rgba(102,224,179,0.3)] pl-3 text-xs leading-relaxed text-muted">
              {meta.confidenceNote}
            </p>
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="font-semibold">The physiology behind it</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-primary/90">{meta.mechanism}</p>
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="font-semibold">Diet & lifestyle adjustments</h2>
            <ul className="mt-3 space-y-2.5">
              {meta.adjustments.map((a, i) => (
                <li key={i} className="flex gap-3 text-sm text-primary/90">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                  {a}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="font-semibold">Specialists for this marker</h2>
            <p className="mt-1 text-sm text-muted">
              If this stays out of range after lifestyle work, these are the doctors to see:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {meta.linkedSpecialties.map((s) => (
                <Link key={s} href={`/find-care?spec=${encodeURIComponent(s)}`}>
                  <Badge tone="accent">{s} →</Badge>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function NotFound({ id }: { id: string }) {
  return (
    <div className="glass mt-10 p-10 text-center">
      <div className="text-lg font-semibold">Unknown biomarker “{id}”</div>
      <Link href="/dashboard" className="mt-3 inline-block text-sm text-[var(--color-accent)]">
        ← Back to dashboard
      </Link>
    </div>
  );
}
