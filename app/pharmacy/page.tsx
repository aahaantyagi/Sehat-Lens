"use client";

import { useMemo, useState } from "react";
import { GlassCard, Badge, Micro, SectionHeading, Pill } from "@/components/ui/Glass";
import { activeReport, useApp } from "@/lib/store";
import {
  ALL_MEDICINES,
  getMedicine,
  searchMedicines,
  evaluateInteractions,
  ageCompatible,
  isHighDose,
} from "@/lib/interactions";
import { getBiomarkerMeta } from "@/lib/health";

const SEV_TONE = { caution: "borderline", warning: "critical", danger: "critical" } as const;
const SEV_ORDER = { danger: 0, warning: 1, caution: 2 };

export default function Pharmacy() {
  const report = activeReport();
  const { medQuery, setMedQuery, selectedMedId, selectMed, dose, setDose, age, setAge } = useApp();
  const [unit, setUnit] = useState(false);

  const results = useMemo(() => searchMedicines(medQuery), [medQuery]);
  const med = getMedicine(selectedMedId);

  // Dose snapping when a new medicine is selected
  const handleSelect = (id: string) => {
    selectMed(id);
    const m = getMedicine(id);
    if (m) setDose(m.strengths[0]);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Smart pharmacy & safe-dose portal"
        title="Check a medicine against your labs"
        right={
          <input
            value={medQuery}
            onChange={(e) => setMedQuery(e.target.value)}
            placeholder="Search tablet or syrup…"
            className="w-56 rounded-full border px-4 py-2 text-sm outline-none placeholder:text-muted"
            style={{ borderColor: "var(--hairline)", background: "var(--glass-bg-soft)", color: "var(--text-strong)" }}
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        {/* Medicine cards */}
        <div>
          {results.length === 0 && (
            <GlassCard className="p-6 text-sm text-muted">
              No medicines match “{medQuery}”. Try “metformin”, “iron”, or “paracetamol”.
            </GlassCard>
          )}
          <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
            {results.map((m) => (
              <MedicineCard
                key={m.id}
                medId={m.id}
                selected={m.id === selectedMedId}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>

        {/* Detail + dose dial */}
        <div className="space-y-4">
          {!med && (
            <GlassCard className="p-6 text-sm text-muted">
              Select a medicine to set dose and age, and see how it intersects with your latest panel.
            </GlassCard>
          )}
          {med && (
            <>
              <GlassCard className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-bold">{med.name}</div>
                    <div className="text-xs text-muted">{med.class}</div>
                  </div>
                  {med.rxRequired ? <Badge tone="critical">Prescription only</Badge> : <Badge tone="optimal">Over the counter</Badge>}
                </div>

                <p className="mt-3 text-sm text-primary/90">{med.indication}</p>
                <div className="mt-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-muted">
                  Typical: {med.standardDose}
                </div>

                {/* Dose dial */}
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>Dose</span>
                      <span className="font-mono text-sm text-primary">
                        {dose} {med.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={med.strengths[0]}
                      max={med.strengths[med.strengths.length - 1]}
                      step={med.strengths.length > 1 ? med.strengths[1] - med.strengths[0] : med.strengths[0]}
                      value={dose}
                      onChange={(e) => setDose(Number(e.target.value))}
                      className="w-full accent-[var(--color-accent)]"
                    />
                    <div className="flex justify-between text-[10px] text-muted">
                      {med.strengths.map((s) => (
                        <span key={s}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>Age</span>
                      <span className="font-mono text-sm text-primary">{age} yrs</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full accent-[var(--color-accent)]"
                    />
                  </div>
                </div>

                {/* Age / dose warnings */}
                <div className="mt-4 space-y-2">
                  {!ageCompatible(med, age) && (
                    <div className="rounded-xl border border-[rgba(251,146,60,0.35)] bg-[rgba(251,146,60,0.1)] p-3 text-sm text-[var(--color-warning)]">
                      ⚠ Age {age} is outside this medicine's studied range ({med.ageMin}–{med.ageMax} yrs). Paediatric or geriatric dosing needs a doctor.
                    </div>
                  )}
                  {isHighDose(med, dose) && (
                    <div className="rounded-xl border border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.08)] p-3 text-sm text-[var(--color-caution)]">
                      ⚠ {dose} {med.unit} is on the higher end for this medicine. Confirm the strength on your prescription.
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Interaction banners */}
              <InteractionBanners medId={med.id} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MedicineCard({
  medId,
  selected,
  onSelect,
}: {
  medId: string;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const report = activeReport();
  const dose = useApp((s) => s.dose);
  const age = useApp((s) => s.age);
  const [open, setOpen] = useState(false);
  const m = getMedicine(medId)!;
  const flags = evaluateInteractions(medId, dose, age, report);
  const worst = flags.length
    ? flags.sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity])[0].severity
    : null;

  return (
    <GlassCard
      hover
      className={`h-fit cursor-pointer p-4 ${selected ? "ring-1" : ""}`}
      style={
        selected
          ? ({ "--tw-ring-color": "var(--accent-border)", background: "var(--accent-bg)" } as React.CSSProperties)
          : undefined
      }
    >
      <div onClick={() => setOpen(!open)}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-semibold text-strong">{m.name}</div>
            <div className="text-[11px] text-muted">{m.class}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {m.rxRequired ? <Badge tone="critical">Rx</Badge> : <Badge tone="optimal">OTC</Badge>}
            {worst && <Badge tone={SEV_TONE[worst]}>{worst === "danger" ? "⚠ Lab clash" : "Lab note"}</Badge>}
          </div>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{m.indication}</p>
        <div className="mt-2 text-xs text-muted">
          {m.strengths.join(" · ")} {m.unit}
        </div>
      </div>

      {/* Expandable detailed overview */}
      <div className={`drawer ${open ? "open" : ""}`}>
        <div className="drawer-inner">
          <div
            className="mt-4 rounded-xl border p-3"
            style={{ borderColor: "var(--hairline)", background: "var(--glass-bg-soft)" }}
          >
            <Micro>Overview</Micro>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{m.indication}</p>
            <div className="mt-2.5">
              <Micro>Typical dosing</Micro>
              <p className="mt-1 text-xs text-muted">{m.standardDose}</p>
            </div>
            <div className="mt-2.5">
              <Micro>Age range</Micro>
              <p className="mt-1 text-xs text-muted">
                {m.ageMin}–{m.ageMax} years · {m.forms.join(", ")}
              </p>
            </div>
            {m.notes.length > 0 && (
              <div className="mt-2.5">
                <Micro>Good to know</Micro>
                <ul className="mt-1 space-y-1">
                  {m.notes.slice(0, 2).map((n, i) => (
                    <li key={i} className="flex gap-1.5 text-xs text-muted">
                      <span style={{ color: "var(--accent)" }}>·</span> {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={() => onSelect(medId)}
              className="mt-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all hover:-translate-y-px"
              style={{
                borderColor: "var(--accent-border)",
                background: "var(--accent-bg)",
                color: "var(--accent)",
              }}
            >
              {selected ? "Checking this one" : "Run safe-dose check"}
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white"
                style={{ background: "var(--accent)" }}
              >
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function InteractionBanners({ medId }: { medId: string }) {
  const report = activeReport();
  const dose = useApp((s) => s.dose);
  const age = useApp((s) => s.age);
  const flags = evaluateInteractions(medId, dose, age, report);

  if (flags.length === 0) {
    return (
      <GlassCard className="border-[rgba(74,222,128,0.3)] p-5">
        <div className="flex items-center gap-2 text-sm text-[var(--color-normal)]">
          <span className="dot-normal h-2 w-2 rounded-full" />
          No lab conflicts found in your active report.
        </div>
        <p className="mt-2 text-xs text-muted">
          Checked against {report.biomarkers.length} biomarkers from {report.label}. Still shows your doctor the full picture — this prototype covers curated rules only.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-2">
      {flags
        .sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity])
        .map((f) => {
          const lab = getBiomarkerMeta(f.labId);
          const bv = report.biomarkers.find((b) => b.id === f.labId);
          return (
            <div
              key={f.id}
              className={`rounded-xl border p-4 ${
                f.severity === "danger"
                  ? "border-[rgba(244,63,94,0.45)] bg-[rgba(244,63,94,0.1)]"
                  : f.severity === "warning"
                  ? "border-[rgba(251,146,60,0.4)] bg-[rgba(251,146,60,0.08)]"
                  : "border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.07)]"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                {f.severity === "danger" ? "⛔" : f.severity === "warning" ? "⚠" : "ℹ"}{" "}
                {f.severity === "danger" ? "Do not combine" : f.severity === "warning" ? "Consult your doctor" : "Monitor"}
                <span className="text-xs font-normal text-muted">
                  · {lab?.shortName} {bv ? `(${bv.value} ${bv.unit})` : ""}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-primary/90">{f.message}</p>
              <p className="mt-1 text-xs text-muted">{f.action}</p>
            </div>
          );
        })}
    </div>
  );
}
