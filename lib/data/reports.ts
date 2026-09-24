import type { LabReport, BiomarkerValue, HistoryPoint } from "@/lib/types";

const DATES = ["2024-09-15", "2025-03-10", "2026-02-20"] as const;
const REPORT_IDS = ["rep-2024q3", "rep-2025q1", "rep-2026q1"] as const;

function mk(
  id: string,
  unit: string,
  older: number,
  prev: number,
  current: number
): BiomarkerValue {
  const h = (date: string, value: number, reportId: string): HistoryPoint => ({
    date,
    value,
    reportId,
  });
  return {
    id,
    value: current,
    unit,
    status: "optimal", // recomputed by deriveStatus at read time
    delta: current - prev,
    history: [
      h(DATES[0], older, REPORT_IDS[0]),
      h(DATES[1], prev, REPORT_IDS[1]),
      h(DATES[2], current, REPORT_IDS[2]),
    ],
  };
}

export const SAMPLE_REPORTS: LabReport[] = [
  {
    id: REPORT_IDS[2],
    label: "Full Body Checkup — Feb 2026",
    date: DATES[2],
    labName: "Metropolis Healthcare, Bengaluru",
    source: "SehatLens_Sample_A.pdf",
    isCurrent: true,
    biomarkers: [
      mk("hba1c", "%", 6.1, 5.9, 6.4),
      mk("glucose-fasting", "mg/dL", 108, 112, 126),
      mk("ldl", "mg/dL", 148, 139, 152),
      mk("hdl", "mg/dL", 44, 41, 38),
      mk("triglycerides", "mg/dL", 188, 205, 232),
      mk("creatinine", "mg/dL", 1.0, 1.1, 1.15),
      mk("egfr", "mL/min/1.73m2", 94, 92, 88),
      mk("tsh", "uIU/mL", 3.1, 3.4, 5.8),
      mk("t3", "pg/mL", 3.4, 3.2, 2.9),
      mk("vitamin-d", "ng/mL", 18, 24, 31),
      mk("b12", "pg/mL", 210, 240, 178),
      mk("hemoglobin", "g/dL", 13.9, 13.6, 13.2),
      mk("wbc", "/uL", 7800, 8100, 11400),
      mk("platelets", "/uL", 245000, 260000, 228000),
      mk("alt", "U/L", 62, 58, 74),
      mk("bilirubin", "mg/dL", 1.0, 0.9, 1.1),
      mk("hs-crp", "mg/L", 2.1, 2.4, 3.8),
      mk("ferritin", "ng/mL", 45, 52, 38),
      mk("uric-acid", "mg/dL", 6.8, 7.4, 7.9),
    ],
  },
  {
    id: REPORT_IDS[1],
    label: "Half-yearly Panel — Mar 2025",
    date: DATES[1],
    labName: "Metropolis Healthcare, Bengaluru",
    source: "SehatLens_Sample_B.pdf",
    isCurrent: false,
    biomarkers: [
      mk("hba1c", "%", 6.1, 5.9, 5.9),
      mk("glucose-fasting", "mg/dL", 108, 112, 112),
      mk("ldl", "mg/dL", 148, 139, 139),
      mk("hdl", "mg/dL", 44, 41, 41),
      mk("triglycerides", "mg/dL", 188, 205, 205),
      mk("creatinine", "mg/dL", 1.0, 1.1, 1.1),
      mk("egfr", "mL/min/1.73m2", 94, 92, 92),
      mk("tsh", "uIU/mL", 3.1, 3.4, 3.4),
      mk("t3", "pg/mL", 3.4, 3.2, 3.2),
      mk("vitamin-d", "ng/mL", 18, 24, 24),
      mk("b12", "pg/mL", 210, 240, 240),
      mk("hemoglobin", "g/dL", 13.9, 13.6, 13.6),
      mk("wbc", "/uL", 7800, 8100, 8100),
      mk("platelets", "/uL", 245000, 260000, 260000),
      mk("alt", "U/L", 62, 58, 58),
      mk("bilirubin", "mg/dL", 1.0, 0.9, 0.9),
      mk("hs-crp", "mg/L", 2.1, 2.4, 2.4),
      mk("ferritin", "ng/mL", 45, 52, 52),
      mk("uric-acid", "mg/dL", 6.8, 7.4, 7.4),
    ],
  },
  {
    id: REPORT_IDS[0],
    label: "Baseline Panel — Sep 2024",
    date: DATES[0],
    labName: "Metropolis Healthcare, Bengaluru",
    source: "SehatLens_Sample_C.pdf",
    isCurrent: false,
    biomarkers: [
      mk("hba1c", "%", 6.1, 6.1, 6.1),
      mk("glucose-fasting", "mg/dL", 108, 108, 108),
      mk("ldl", "mg/dL", 148, 148, 148),
      mk("hdl", "mg/dL", 44, 44, 44),
      mk("triglycerides", "mg/dL", 188, 188, 188),
      mk("creatinine", "mg/dL", 1.0, 1.0, 1.0),
      mk("egfr", "mL/min/1.73m2", 94, 94, 94),
      mk("tsh", "uIU/mL", 3.1, 3.1, 3.1),
      mk("t3", "pg/mL", 3.4, 3.4, 3.4),
      mk("vitamin-d", "ng/mL", 18, 18, 18),
      mk("b12", "pg/mL", 210, 210, 210),
      mk("hemoglobin", "g/dL", 13.9, 13.9, 13.9),
      mk("wbc", "/uL", 7800, 7800, 7800),
      mk("platelets", "/uL", 245000, 245000, 245000),
      mk("alt", "U/L", 62, 62, 62),
      mk("bilirubin", "mg/dL", 1.0, 1.0, 1.0),
      mk("hs-crp", "mg/L", 2.1, 2.1, 2.1),
      mk("ferritin", "ng/mL", 45, 45, 45),
      mk("uric-acid", "mg/dL", 6.8, 6.8, 6.8),
    ],
  },
];
