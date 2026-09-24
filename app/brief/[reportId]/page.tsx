"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { GlassCard, Badge } from "@/components/ui/Glass";
import { allReports } from "@/lib/store";
import { getBiomarkerMeta, STATUS_LABEL, fmtValue } from "@/lib/health";
import { evaluateInteractions } from "@/lib/interactions";
import { LOGO_MARK } from "@/components/chrome/BriefLogo";

export default function DoctorBrief() {
  const params = useParams<{ reportId: string }>();
  const reportId = params?.reportId;
  const reports = allReports();
  const report = reports.find((r) => r.id === reportId) ?? reports[0];
  const [copied, setCopied] = useState(false);

  const flagged = report.biomarkers.filter(
    (b) => b.status === "critical" || b.status === "borderline"
  );
  const medsChecked = useMemo(
    () =>
      ["metformin", "atorvastatin", "ibuprofen", "levothyroxine"]
        .map((id) => ({ id, flags: evaluateInteractions(id, 500, 40, report) }))
        .filter((x) => x.flags.length > 0),
    [report.id]
  );

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "SehatLens — Doctor Consultation Brief", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="mx-auto max-w-[820px] px-4 py-8">
      {/* Toolbar */}
      <div className="no-print mb-4 flex items-center justify-between">
        <a href="/dashboard" className="text-sm text-muted hover:text-primary">
          ← Dashboard
        </a>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="btn-primary px-4 py-2 text-sm"
          >
            ⬇ Download (Print to PDF)
          </button>
          <button
            onClick={share}
            className="rounded-full border hairline px-4 py-2 text-sm text-muted hover:text-primary"
          >
            {copied ? "Link copied ✓" : "Share"}
          </button>
        </div>
      </div>

      {/* The brief */}
      <div className="print-page rounded-2xl bg-white p-8 text-black shadow-2xl sm:p-10">
        <div className="flex items-start justify-between border-b-2 border-black pb-4">
          <div>
            <div className="flex items-center gap-2">
              <LOGO_MARK />
              <span className="text-xl font-bold tracking-tight">
                Sehat<span className="font-light">Lens</span>
              </span>
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Doctor Consultation Brief · One page · Auto-generated from patient's parsed reports
            </div>
          </div>
          <div className="text-right text-[11px] leading-tight text-neutral-600">
            <div className="font-semibold text-black">{report.label}</div>
            <div>{report.labName}</div>
            <div>Collected: {new Date(report.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
            <div>Report ID: {report.id}</div>
          </div>
        </div>

        {/* Executive snapshot */}
        <div className="mt-4 grid grid-cols-4 gap-3 text-center">
          {[
            ["Out of range", flagged.filter((b) => b.status === "critical").length],
            ["Borderline", flagged.filter((b) => b.status === "borderline").length],
            ["In range", report.biomarkers.length - flagged.length],
            ["Total markers", report.biomarkers.length],
          ].map(([label, n]) => (
            <div key={String(label)} className="border border-neutral-300 py-2">
              <div className="text-2xl font-bold">{n}</div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-600">{label}</div>
            </div>
          ))}
        </div>

        {/* Flagged findings */}
        <div className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em]">Flagged findings requiring attention</h2>
          <table className="mt-2 w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-neutral-400 text-left text-[10px] uppercase tracking-wider text-neutral-600">
                <th className="py-1.5">Biomarker</th>
                <th className="py-1.5">Value</th>
                <th className="py-1.5">Reference</th>
                <th className="py-1.5">Status</th>
                <th className="py-1.5">Trend (3 panels)</th>
                <th className="py-1.5">Significance</th>
              </tr>
            </thead>
            <tbody>
              {flagged.map((b) => {
                const meta = getBiomarkerMeta(b.id);
                return (
                  <tr key={b.id} className="border-b border-neutral-200 align-top">
                    <td className="py-1.5 font-semibold">{meta?.name ?? b.id}</td>
                    <td className="py-1.5 font-mono">
                      {fmtValue(b.value)} {b.unit}
                    </td>
                    <td className="py-1.5 font-mono text-neutral-600">
                      {fmtValue(meta?.range.min ?? 0)}–{fmtValue(meta?.range.max ?? 0)}
                    </td>
                    <td className="py-1.5">
                      <span className={b.status === "critical" ? "font-bold text-rose-700" : "font-semibold text-amber-700"}>
                        {STATUS_LABEL[b.status]}
                      </span>
                    </td>
                    <td className="py-1.5 text-neutral-700">
                      {b.history.map((h) => fmtValue(h.value)).join(" → ")}
                    </td>
                    <td className="py-1.5 text-[11px] text-neutral-700">{meta?.layExplanation.split(". ")[0]}.</td>
                  </tr>
                );
              })}
              {flagged.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-3 text-center text-neutral-500">
                    All markers within reference ranges.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Trajectory snapshots (sparkline-ish inline bars) */}
        <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
          {flagged.slice(0, 6).map((b) => {
            const meta = getBiomarkerMeta(b.id);
            const min = meta?.range.min ?? 0;
            const max = meta?.range.max ?? 1;
            const pts = b.history.map((h) => {
              const t = (h.value - min) / (max - min || 1);
              return Math.min(1, Math.max(0, t));
            });
            return (
              <div key={b.id} className="text-[10px]">
                <div className="flex justify-between font-semibold">
                  <span>{meta?.shortName}</span>
                  <span className="font-mono font-normal">{fmtValue(b.value)}</span>
                </div>
                <div className="mt-0.5 flex h-2 gap-[2px]">
                  {pts.map((t, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        background:
                          t > 1 || t < 0
                            ? "#e11d48"
                            : t > 0.85 || t < 0.15
                            ? "#f59e0b"
                            : "#10b981",
                        opacity: 0.35 + 0.65 * (i / Math.max(1, pts.length - 1)),
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Medication considerations */}
        <div className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em]">Medication–lab considerations (screened)</h2>
          {medsChecked.length === 0 ? (
            <p className="mt-1 text-[12px] text-neutral-600">
              Common medications screened against this panel show no lab conflicts.
            </p>
          ) : (
            <ul className="mt-1.5 space-y-1 text-[12px]">
              {medsChecked.map(({ id, flags }) => (
                <li key={id} className="flex gap-2">
                  <span className="font-semibold capitalize">{id}</span>
                  <span className="text-neutral-700">
                    — {flags.map((f) => f.message.split(".")[0]).join("; ")}.
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-1.5 text-[10px] text-neutral-500">
            Screened against curated drug–lab rules (metformin, statins, NSAIDs, levothyroxine). Not a prescription record.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-end justify-between border-t-2 border-black pt-3 text-[10px] text-neutral-600">
          <div>
            Generated by SehatLens · Patient-derived summary for consultation use only.
            <br />
            Not a diagnosis. Reference ranges vary by lab and methodology.
          </div>
          <div className="text-right">
            <div className="font-semibold text-black">sehatlens.app/brief/{report.id}</div>
            <div>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
