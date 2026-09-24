import type { Medicine, InteractionRule, LabReport, Doctor } from "@/lib/types";
import { MEDICINES } from "@/lib/data/medicines";
import { INTERACTION_RULES } from "@/lib/data/interactions";
import { DOCTORS } from "@/lib/data/doctors";

export const ALL_MEDICINES: Medicine[] = MEDICINES;
export const ALL_INTERACTION_RULES: InteractionRule[] = INTERACTION_RULES;
export const ALL_DOCTORS: Doctor[] = DOCTORS;

export const getMedicine = (id: string | null): Medicine | null =>
  id ? MEDICINES.find((m) => m.id === id) ?? null : null;

export const medicineById = (id: string): Medicine | undefined =>
  MEDICINES.find((m) => m.id === id);

export function evaluateInteractions(
  medicineId: string,
  dose: number,
  age: number,
  report: LabReport
): InteractionRule[] {
  const med = medicineById(medicineId);
  if (!med) return [];

  const triggered: InteractionRule[] = [];

  for (const rule of ALL_INTERACTION_RULES) {
    if (rule.medicineId !== medicineId) continue;
    const bv = report.biomarkers.find((b) => b.id === rule.labId);
    if (!bv) continue;

    let hit = false;
    if (rule.condition === "below") hit = bv.value < rule.threshold;
    else if (rule.condition === "above") hit = bv.value > rule.threshold;
    else hit = bv.value < rule.threshold || bv.value > rule.threshold;

    if (hit) triggered.push(rule);
  }

  return triggered;
}

export function searchMedicines(query: string): Medicine[] {
  const q = query.trim().toLowerCase();
  if (!q) return MEDICINES;
  return MEDICINES.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.class.toLowerCase().includes(q) ||
      m.indication.toLowerCase().includes(q)
  );
}

export function ageCompatible(med: Medicine, age: number): boolean {
  return age >= med.ageMin && age <= med.ageMax;
}

/** High-dose heuristic for the dose dial: > 2x smallest strength counts as high. */
export function isHighDose(med: Medicine, dose: number): boolean {
  const minStrength = Math.min(...med.strengths);
  return dose > minStrength * 2;
}
