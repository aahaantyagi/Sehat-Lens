"use client";

import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  CartesianGrid,
} from "recharts";
import { GlassCard, Badge, Micro } from "@/components/ui/Glass";
import { allReports, activeReport } from "@/lib/store";
import { getBiomarkerMeta, STATUS_LABEL, fmtValue, fmtDelta } from "@/lib/health";
import type { BiomarkerValue } from "@/lib/types";

const STROKE = {
  critical: "var(--critical)",
  borderline: "var(--borderline)",
  optimal: "var(--optimal)",
} as const;

export default function Trends() {
  const report = activeReport();
  const reports = allReports();

  const categories = Array.from(new Set(report.biomarkers.map((b) => getBiomarkerMeta(b.id)?.category ?? "Other")))
    .sort();

  return (
    <div className="space-y-7">
      <div className="rise">
        <Micro>Longitudinal analysis · 3 panels</Micro>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-strong">Trends over time</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Every marker charted across your panels, with the reference band shaded. Direction
          matters more than any single reading — this is the page your doctor will want to see.
        </p>
      </div>

      {categories.map((cat) => (
        <section key={cat}>
          <div className="mb-3 flex items-center gap-3">
            <Micro>{cat}</Micro>
            <div className="h-px flex-1 hairline" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {report.biomarkers
              .filter((b) => getBiomarkerMeta(b.id)?.category === cat)
              .map((b) => (
                <TrendCard key={b.id} b={b} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TrendCard({ b }: { b: BiomarkerValue }) {
  const meta = getBiomarkerMeta(b.id);
  const reports = allReports();
  const range = meta?.range;
  const min = range?.min ?? 0;
  const max = range?.max ?? 1;

  const rows = [...b.history]
    .sort((a, b2) => a.date.localeCompare(b2.date))
    .map((h) => ({
      date: new Date(h.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      value: h.value,
    }));

  // Chart domain: pad so the reference band and out-of-range points both fit.
  const values = rows.map((r) => r.value);
  const lo = Math.min(min, ...values);
  const hi = Math.max(max, ...values);
  const pad = (hi - lo) * 0.12 || 1;

  return (
    <GlassCard hover className="p-4">
      <Link href={`/dashboard/biomarker/${b.id}`} className="group block">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-strong group-hover:text-[var(--accent)]">
              {meta?.shortName ?? b.id}
            </div>
            <div className="micro mt-0.5 text-faint">{meta?.category}</div>
          </div>
          <div className="flex items-center gap-2">
            {b.delta !== null && b.delta !== 0 && (
              <span className={`num text-[11px] ${b.delta > 0 ? "st-critical" : "st-optimal"}`}>
                {fmtDelta(b.delta)}
              </span>
            )}
            <Badge tone={b.status}>{STATUS_LABEL[b.status]}</Badge>
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className={`num text-2xl leading-none st-${b.status}`}>{fmtValue(b.value)}</span>
          <span className="text-[11px] text-muted">{b.unit}</span>
          <span className="ml-auto text-[10px] text-faint">
            ref {fmtValue(min)}–{fmtValue(max)}
          </span>
        </div>

        <div className="mt-3 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 6, right: 8, left: -26, bottom: 0 }}>
              <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "var(--chart-axis)", fontSize: 9 }} stroke="var(--chart-grid)" />
              <YAxis
                domain={[lo - pad, hi + pad]}
                tick={{ fill: "var(--chart-axis)", fontSize: 9 }}
                stroke="var(--chart-grid)"
                width={44}
              />
              <ReferenceArea y1={min} y2={max} fill="var(--optimal)" fillOpacity={0.07} />
              <Tooltip
                contentStyle={{
                  background: "var(--glass-bg-strong)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 12,
                  fontSize: 11,
                  color: "var(--text-primary)",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={STROKE[b.status]}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, fill: STROKE[b.status] }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Link>
    </GlassCard>
  );
}
