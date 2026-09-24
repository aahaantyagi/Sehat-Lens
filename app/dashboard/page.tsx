"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { GlassCard, Badge, Micro } from "@/components/ui/Glass";
import { allReports, activeReport, historyReports, useApp } from "@/lib/store";
import {
  getBiomarkerMeta,
  statusCounts,
  worstStatus,
  STATUS_LABEL,
  fmtValue,
  fmtDelta,
  positionInRange,
  flaggedSpecialties,
} from "@/lib/health";
import { searchMedicines, evaluateInteractions, getMedicine } from "@/lib/interactions";
import { doctorsWithDistance } from "@/lib/findcare";
import type { BiomarkerValue, Status } from "@/lib/types";

const MiniMap = dynamic(() => import("@/components/findcare/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-muted">Loading map…</div>
  ),
});

const SEV_ORDER = { danger: 0, warning: 1, caution: 2 };

const CHART_COLORS: Record<string, string> = {
  hba1c: "#f59e0b",
  ldl: "#f43f5e",
  tsh: "#38bdf8",
  triglycerides: "#a78bfa",
};

export default function Dashboard() {
  const report = activeReport();
  const counts = statusCounts(report);
  const worst = worstStatus(report);
  const [peekId, setPeekId] = useState<string | null>(null);
  const categories = Array.from(
    new Set(report.biomarkers.map((b) => getBiomarkerMeta(b.id)?.category ?? "Other"))
  ).sort();
  const peeked = peekId ? report.biomarkers.find((b) => b.id === peekId) : null;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <Micro>Command center · {new Date(report.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</Micro>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-strong">Health Dashboard</h1>
        </div>
        <ReportSwitcher />
      </div>

      {/* ===== BENTO ROW 1 ===== */}
      <div className="grid grid-cols-12 gap-5">
        {/* Card 1: Executive Triage & Triad Engine */}
        <GlassCard className="col-span-12 p-6 lg:col-span-7">
          <Micro>Executive triage</Micro>
          <div className="mt-3 flex flex-wrap items-stretch gap-x-8 gap-y-4">
            <HeadlineStat n={counts.critical} label="Out of range" tone="critical" />
            <HeadlineStat n={counts.borderline} label="Borderline" tone="borderline" />
            <HeadlineStat n={counts.optimal} label="Optimal" tone="optimal" />
          </div>

          <TriadEngine report={report} />
        </GlassCard>

        {/* Card 2: Trajectory visualizer */}
        <GlassCard className="col-span-12 p-6 lg:col-span-5">
          <div className="flex items-center justify-between">
            <Micro>Longitudinal visualizer</Micro>
            <span className="text-[10px] text-faint">3 panels</span>
          </div>
          <TrajectoryChart />
        </GlassCard>

        {/* Card 3: Specialist care routing */}
        <GlassCard variant="soft" className="col-span-12 p-5 lg:col-span-4">
          <CareRoutingTile />
        </GlassCard>

        {/* Card 4: Safe-dose portal */}
        <GlassCard variant="soft" className="col-span-12 p-5 lg:col-span-4">
          <SafeDoseTile />
        </GlassCard>

        {/* Card 5: SBAR brief generator */}
        <GlassCard variant="soft" className="col-span-12 flex flex-col p-5 lg:col-span-4">
          <BriefTile />
        </GlassCard>
      </div>

      {/* Peek overlay — pop-out detail instead of inline expansion */}
      {peeked && <BiomarkerPeek b={peeked} onClose={() => setPeekId(null)} />}

      {/* ===== TELEMETRY — grouped by category ===== */}
      <section className="space-y-8 pt-2">
        {categories.map((cat) => {
          const group = report.biomarkers.filter(
            (b) => getBiomarkerMeta(b.id)?.category === cat
          );
          return (
            <div key={cat}>
              <div className="mb-3 flex items-center gap-3">
                <Micro>{cat}</Micro>
                <div className="h-px flex-1 hairline" />
                <span className="text-[10px] text-faint">{group.length} markers</span>
              </div>
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.map((b) => (
                  <TelemetryCard key={b.id} b={b} onPeek={() => setPeekId(b.id)} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function HeadlineStat({ n, label, tone }: { n: number; label: string; tone: Status }) {
  return (
    <div>
      <div className={`num text-5xl leading-none st-${tone}`}>{n}</div>
      <div className="micro mt-2 text-muted">{label}</div>
    </div>
  );
}

function TriadEngine({ report }: { report: ReturnType<typeof activeReport> }) {
  const [open, setOpen] = useState(false);
  const triadIds = ["hba1c", "ldl", "glucose-fasting"];
  const triad = triadIds
    .map((id) => ({ bv: report.biomarkers.find((b) => b.id === id), meta: getBiomarkerMeta(id) }))
    .filter((x) => x.bv && x.meta);
  const worst = worstStatus(report);

  return (
    <div className="mt-6">
      <div
        className={`rounded-2xl border p-4 ${
          worst === "critical"
            ? "border-[color-mix(in_srgb,var(--critical)_35%,transparent)] bg-[var(--critical-bg)]"
            : worst === "borderline"
            ? "border-[color-mix(in_srgb,var(--borderline)_35%,transparent)] bg-[var(--borderline-bg)]"
            : "border-[color-mix(in_srgb,var(--optimal)_30%,transparent)] bg-[var(--optimal-bg)]"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={worst === "optimal" ? "optimal" : worst === "borderline" ? "borderline" : "critical"}>
            ● RAG Triad
          </Badge>
          {triad.map(({ bv, meta }) => (
            <Link key={bv!.id} href={`/dashboard/biomarker/${bv!.id}`}>
              <Badge tone={bv!.status === "optimal" ? "optimal" : bv!.status === "borderline" ? "borderline" : "critical"}>
                {meta!.shortName} <span className="num">{fmtValue(bv!.value)}</span>
              </Badge>
            </Link>
          ))}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-strong"
        >
          Clinical correlation
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <div className={`drawer ${open ? "open" : ""}`}>
          <div className="drawer-inner">
            <p className="pt-3 text-[13px] leading-relaxed text-muted">
              {worst === "optimal"
                ? "All three metabolic drivers sit inside their reference bands. The lipid–glucose axis shows no compound strain."
                : "HbA1c, LDL, and fasting glucose form a compound metabolic signal: sustained glycation damages endothelium while elevated LDL particles lodge in the injured walls, and rising fasting glucose suggests the liver is leaking glucose overnight under insulin resistance. Read together, the triad outranks any single value — each mechanism amplifies the next. This is the pattern to bring to a physician first, with the trajectory chart as context."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrajectoryChart() {
  const reports = allReports();
  const current = activeReport();
  const history = historyReports();
  const trendIds = ["hba1c", "ldl", "tsh"];

  const rows = [...history.map((r) => r.date), current.date]
    .sort((a, b) => a.localeCompare(b))
    .map((date) => {
      const row: Record<string, string | number> = {
        date: new Date(date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      };
      for (const id of trendIds) {
        const found = reports
          .flatMap((r) => r.biomarkers.find((b) => b.id === id)?.history ?? [])
          .find((h) => h.date === date);
        if (found) row[id] = found.value;
      }
      return row;
    });

  return (
    <div className="mt-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--chart-axis)", fontSize: 10 }}
              stroke="var(--chart-grid)"
            />
            <YAxis tick={{ fill: "var(--chart-axis)", fontSize: 10 }} stroke="var(--chart-grid)" />
            <Tooltip
              contentStyle={{
                background: "var(--glass-bg-strong)",
                border: "1px solid var(--glass-border)",
                borderRadius: 12,
                fontSize: 12,
                backdropFilter: "blur(24px)",
                color: "var(--text-primary)",
              }}
            />
            {trendIds.map((id) => (
              <Line
                key={id}
                type="monotone"
                dataKey={id}
                name={getBiomarkerMeta(id)?.shortName ?? id}
                stroke={CHART_COLORS[id]}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, fill: CHART_COLORS[id] }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {trendIds.map((id) => (
          <span key={id} className="inline-flex items-center gap-1.5 text-[11px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: CHART_COLORS[id] }} />
            {getBiomarkerMeta(id)?.shortName}
          </span>
        ))}
      </div>
    </div>
  );
}

function CareRoutingTile() {
  const report = activeReport();
  const flagged = flaggedSpecialties(report);
  const docs = useMemo(() => {
    return doctorsWithDistance()
      .filter((d) => flagged.includes(d.specialty))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [report.id]);
  const top = docs[0];
  const rest = docs.length - 1;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <Micro>Specialist care routing</Micro>
        {top && <Badge tone="accent">{top.specialty}</Badge>}
      </div>

      <div className="mt-3 h-36 overflow-hidden rounded-xl border hairline">
        <MiniMap
          doctors={docs.slice(0, 8).map((d) => ({ ...d, matched: true }))}
          maxDistanceKm={25}
        />
      </div>

      {top ? (
        <div className="mt-3 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-strong">{top.name}</div>
              <div className="text-xs text-muted">
                {top.clinic} · {top.area}
              </div>
            </div>
            <Badge tone="optimal">✓ Verified</Badge>
          </div>
          <div className="mt-2 flex gap-3 text-[11px] text-muted">
            <span>★ {top.rating}</span>
            <span>{top.distanceKm.toFixed(1)} km</span>
            <span>{top.nextSlot}</span>
          </div>
          {rest > 0 && (
            <div className="mt-1 text-[11px] text-faint">+{rest} more matched specialists</div>
          )}
          <Link href="/find-care" className="btn-primary mt-4 inline-flex h-9 items-center px-4 text-[13px]">
            Locate Care →
          </Link>
        </div>
      ) : (
        <p className="mt-3 flex-1 text-sm text-muted">
          No flagged anomalies — no specialist routing needed.
        </p>
      )}
    </div>
  );
}

function SafeDoseTile() {
  const report = activeReport();
  const [q, setQ] = useState("");
  const [selId, setSelId] = useState<string | null>(null);
  const results = useMemo(() => searchMedicines(q).slice(0, 5), [q]);
  const med = getMedicine(selId);
  const flags = med ? evaluateInteractions(med.id, med.strengths[0], 34, report) : [];
  const sevTone = { caution: "borderline", warning: "critical", danger: "critical" } as const;

  return (
    <div className="flex h-full flex-col">
      <Micro>Safe-dose portal</Micro>
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setSelId(null);
        }}
        placeholder="Search a medicine…"
        className="mt-3 w-full rounded-full border hairline bg-white/30 px-4 py-2 text-sm outline-none placeholder:text-faint focus:border-[var(--accent-border)] night:bg-white/5"
        style={{ color: "var(--text-strong)" }}
      />

      {!med && results.length > 0 && (
        <div className="mt-2 space-y-1">
          {results.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelId(m.id)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-white/30 night:hover:bg-white/5"
              style={{ color: "var(--text-primary)" }}
            >
              <span>{m.name}</span>
              <span className="text-[10px] text-faint">{m.rxRequired ? "Rx" : "OTC"}</span>
            </button>
          ))}
        </div>
      )}

      {med && (
        <div className="mt-3 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-strong">{med.name}</div>
            <Badge tone={med.rxRequired ? "critical" : "optimal"}>{med.rxRequired ? "Rx" : "OTC"}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted">{med.indication}</p>

          <div className="mt-3 space-y-2">
            {flags.length === 0 && (
              <div className="rounded-xl border p-2.5 text-xs" style={{ borderColor: "color-mix(in srgb, var(--optimal) 30%, transparent)", background: "var(--optimal-bg)", color: "var(--optimal)" }}>
                ● No conflicts with your current panel.
              </div>
            )}
            {flags
              .sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity])
              .slice(0, 2)
              .map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl border p-2.5 text-xs"
                  style={{
                    borderColor: "color-mix(in srgb, var(--critical) 32%, transparent)",
                    background: "var(--critical-bg)",
                    color: "var(--critical)",
                  }}
                >
                  ● {f.message.split(".")[0]}.
                </div>
              ))}
          </div>

          <Link
            href={`/pharmacy?med=${med.id}`}
            className="mt-3 inline-block text-xs font-semibold"
            style={{ color: "var(--accent)" }}
          >
            Full safe-dose check →
          </Link>
        </div>
      )}
    </div>
  );
}

function BriefTile() {
  const report = activeReport();
  const counts = statusCounts(report);
  return (
    <div className="flex h-full flex-col">
      <Micro>SBAR brief generator</Micro>
      <div className="mt-3 flex-1">
        <div className="text-sm font-semibold leading-snug text-strong">
          One dense page your doctor can read in 90 seconds.
        </div>
        <ul className="mt-3 space-y-1.5 text-xs text-muted">
          <li className="flex gap-2"><span className="st-critical">●</span> {counts.critical} critical · {counts.borderline} borderline findings</li>
          <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>●</span> 3-panel trend per flagged marker</li>
          <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>●</span> Medication–lab screening summary</li>
        </ul>
      </div>
      <Link
        href={`/brief/${report.id}`}
        className="btn-primary mt-4 flex h-10 items-center justify-center text-sm"
      >
        Generate 1-Page Consultation Brief
      </Link>
      <Link
        href={`/brief/${report.id}`}
        className="mt-2 text-center text-[11px] text-faint hover:text-muted"
      >
        Preview · Print to PDF
      </Link>
    </div>
  );
}

function TelemetryCard({ b, onPeek }: { b: BiomarkerValue; onPeek: () => void }) {
  const meta = getBiomarkerMeta(b.id);
  const range = meta?.range;
  const pct =
    range && range.max > range.min
      ? Math.min(100, Math.max(0, ((b.value - range.min) / (range.max - range.min)) * 100))
      : 50;
  const tone = b.status as "optimal" | "borderline" | "critical";

  return (
    <GlassCard hover className="group h-fit cursor-pointer p-4" onClick={onPeek}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-strong">{meta?.shortName ?? b.id}</div>
          <div className="micro mt-0.5 text-faint">{meta?.category}</div>
        </div>
        <Badge tone={tone}>{STATUS_LABEL[b.status]}</Badge>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`num text-[26px] leading-none st-${tone}`}>{fmtValue(b.value)}</span>
        <span className="text-[11px] text-muted">{b.unit}</span>
        {b.delta !== null && b.delta !== 0 && (
          <span className={`num ml-auto text-[11px] ${b.delta > 0 ? "st-critical" : "st-optimal"}`}>
            {fmtDelta(b.delta)}
          </span>
        )}
      </div>

      {/* Segmented reference range bar */}
      <div className="mt-3">
        <div className="flex h-1.5 gap-[2px]">
          {Array.from({ length: 24 }).map((_, i) => {
            const seg = i / 24;
            const passed = seg <= pct / 100;
            return (
              <span
                key={i}
                className="flex-1 rounded-[1px]"
                style={{
                  background: passed
                    ? tone === "critical"
                      ? "var(--critical)"
                      : tone === "borderline"
                      ? "var(--borderline)"
                      : "var(--optimal)"
                    : "var(--hairline)",
                  opacity: passed ? 0.35 + 0.65 * (seg / Math.max(0.01, pct / 100)) : 1,
                }}
              />
            );
          })}
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-faint">
          <span className="num">{fmtValue(range?.min ?? 0)}</span>
          <span className="num">{fmtValue(range?.max ?? 0)}</span>
        </div>
      </div>

      {/* Peek hint — appears on hover */}
      <div className="pointer-events-none mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[var(--accent)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        Quick look
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M7 17L17 7M9 7h8v8" />
        </svg>
      </div>
    </GlassCard>
  );
}

/* ---------- BiomarkerPeek — compact glass pop-out overlay ---------- */

function BiomarkerPeek({ b, onClose }: { b: BiomarkerValue; onClose: () => void }) {
  const meta = getBiomarkerMeta(b.id);
  const range = meta?.range;
  const pct =
    range && range.max > range.min
      ? Math.min(100, Math.max(0, ((b.value - range.min) / (range.max - range.min)) * 100))
      : 50;
  const tone = b.status as "optimal" | "borderline" | "critical";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
      style={{ background: "rgba(8, 20, 40, 0.45)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
    >
      <div
        className="glass-strong rise relative w-full max-w-md rounded-3xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="pill absolute right-4 top-4 flex h-8 w-8 items-center justify-center !px-0 text-muted transition-colors hover:text-strong"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <Micro>{meta?.category}</Micro>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <h3 className="text-xl font-bold tracking-tight text-strong">{meta?.name ?? b.id}</h3>
          <Badge tone={tone}>{STATUS_LABEL[b.status]}</Badge>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className={`num text-4xl leading-none st-${tone}`}>{fmtValue(b.value)}</span>
          <span className="text-xs text-muted">{b.unit}</span>
          {b.delta !== null && b.delta !== 0 && (
            <span className={`num ml-auto text-xs ${b.delta > 0 ? "st-critical" : "st-optimal"}`}>
              {fmtDelta(b.delta)} vs last panel
            </span>
          )}
        </div>

        {/* Reference range bar with position marker */}
        <div className="mt-5">
          <div className="relative h-2.5 rounded-full" style={{ background: "var(--hairline)" }}>
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${pct}%`,
                background: tone === "critical" ? "var(--critical)" : tone === "borderline" ? "var(--borderline)" : "var(--optimal)",
                opacity: 0.85,
              }}
            />
            <div
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              style={{
                left: `${pct}%`,
                borderColor: "var(--glass-border)",
                background: tone === "critical" ? "var(--critical)" : tone === "borderline" ? "var(--borderline)" : "var(--optimal)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-faint">
            <span className="num">{fmtValue(range?.min ?? 0)}</span>
            <span className="micro">Your position</span>
            <span className="num">{fmtValue(range?.max ?? 0)}</span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: "var(--hairline)", background: "var(--glass-bg-soft)" }}>
          <div className="flex items-center justify-between">
            <Micro>Interpretation</Micro>
            <Badge tone={meta?.confidence === "High" ? "optimal" : "borderline"}>
              {meta?.confidence} confidence
            </Badge>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">{meta?.layExplanation}</p>
          <div className="mt-3">
            <Micro>First move</Micro>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{meta?.adjustments[0]}</p>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Link
            href={`/dashboard/biomarker/${b.id}`}
            className="btn-primary flex h-10 flex-1 items-center justify-center text-[13px]"
          >
            Open full deep-dive →
          </Link>
          <button onClick={onClose} className="pill flex h-10 items-center px-4 text-[13px] text-muted">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportSwitcher() {
  const reports = allReports();
  const current = activeReport();
  const setActiveReport = useApp((s) => s.setActiveReport);
  return (
    <div className="flex gap-1 rounded-full border hairline p-1" style={{ background: "var(--glass-bg-soft)" }}>
      {reports.map((r) => (
        <button
          key={r.id}
          onClick={() => setActiveReport(r.id)}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${
            r.id === current.id ? "pill-active" : "text-muted hover:text-strong"
          }`}
        >
          {new Date(r.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}
        </button>
      ))}
    </div>
  );
}
