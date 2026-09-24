import type { Status, ReferenceRange, LabReport, BiomarkerValue } from "@/lib/types";
import { BIOMARKERS } from "@/lib/data/biomarkers";

export const getBiomarkerMeta = (id: string) =>
  BIOMARKERS.find((b) => b.id === id);

export function refRangeFor(id: string): ReferenceRange | undefined {
  return BIOMARKERS.find((b) => b.id === id)?.range;
}

/**
 * Classify a value against its reference range.
 * - inside range -> normal
 * - within 10% beyond an edge (or within a 10%-of-span cushion for edge-zero
 *   ranges like LDL) -> borderline
 * - further out -> critical
 */
export function deriveStatus(id: string, value: number): Status {
  // biome-ignore lint: placeholder marker
  const range = refRangeFor(id);
  if (!range) return "optimal";
  const { min, max } = range;
  if (value >= min && value <= max) return "optimal";

  const span = max - min;
  // For ranges starting at 0 (LDL, TG, ALT...), the cushion is 10% of the span.
  const cushion = min === 0 ? span * 0.1 : span * 0.1;

  if (value < min) return min - value <= cushion ? "borderline" : "critical";
  return value - max <= cushion ? "borderline" : "critical";
}

/** Position of value along [min,max] as 0..1, clamped; handles one-sided ranges. */
export function positionInRange(id: string, value: number): number {
  const range = refRangeFor(id);
  if (!range) return 0.5;
  const { min, max } = range;
  if (max === min) return 0.5;
  const t = (value - min) / (max - min);
  return Math.min(1, Math.max(0, t));
}

export const STATUS_LABEL: Record<Status, string> = {
  optimal: "Optimal",
  borderline: "Borderline",
  critical: "Critical",
};

/** Full-width percent string used by the trajectory tiles. */
export function fmtDelta(delta: number | null): string {
  if (delta === null) return "—";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toLocaleString("en-IN")}`;
}

/** Compact value formatting: 11400 -> 11,400 ; 1.15 -> 1.15 */
export function fmtValue(value: number): string {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

/** Distinct specialties flagged by out-of-range or borderline biomarkers. */
export function flaggedSpecialties(report: LabReport): string[] {
  const set = new Set<string>();
  for (const b of report.biomarkers) {
    if (b.status === "critical" || b.status === "borderline") {
      const meta = getBiomarkerMeta(b.id);
      meta?.linkedSpecialties.forEach((s) => set.add(s));
    }
  }
  return Array.from(set);
}

/** Count biomarkers by status in a report. */
export function statusCounts(report: LabReport) {
  const counts = { optimal: 0, borderline: 0, critical: 0 } as Record<Status, number>;
  for (const b of report.biomarkers) counts[b.status] += 1;
  return counts;
}

/** Overall worst status in a report. */
export function worstStatus(report: LabReport): Status {
  if (report.biomarkers.some((b) => b.status === "critical")) return "critical";
  if (report.biomarkers.some((b) => b.status === "borderline")) return "borderline";
  return "optimal";
}

/** Apply reference-range classification across a report's biomarkers in place. */
export function classifyReport(report: LabReport): LabReport {
  report.biomarkers.forEach((b: BiomarkerValue) => {
    b.status = deriveStatus(b.id, b.value);
  });
  return report;
}
