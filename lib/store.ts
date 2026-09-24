"use client";

import { create } from "zustand";
import type { Screen, LabReport, ParseStage, Theme } from "@/lib/types";
import { SAMPLE_REPORTS } from "@/lib/data/reports";
import { classifyReport } from "@/lib/health";

interface AppState {
  theme: Theme;
  screen: Screen;
  activeReportId: string;
  patientName: string;
  // pharmacy
  medQuery: string;
  selectedMedId: string | null;
  dose: number;
  age: number;
  // find care
  specFilter: string | null;
  maxDistanceKm: number;
  minRating: number;
  // parse overlay
  parsing: boolean;
  parseStageIndex: number;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setScreen: (s: Screen) => void;
  setActiveReport: (id: string) => void;
  setMedQuery: (q: string) => void;
  selectMed: (id: string | null) => void;
  setDose: (n: number) => void;
  setAge: (n: number) => void;
  setSpecFilter: (s: string | null) => void;
  setMaxDistanceKm: (n: number) => void;
  setMinRating: (n: number) => void;
  startParse: () => void;
  advanceParse: () => void;
  finishParse: () => void;
}

export const PARSE_STAGES: ParseStage[] = [
  { key: "scan", label: "Scanning document", detail: "Reading pages, detecting tables" },
  { key: "ocr", label: "Extracting values", detail: "OCR across 4 pages of analytes" },
  { key: "match", label: "Matching biomarkers", detail: "Mapping lab names to the SehatLens KB" },
  { key: "validate", label: "Validating ranges", detail: "Cross-checking reference intervals" },
  { key: "ready", label: "Report ready", detail: "Building your dashboard" },
];

export const useApp = create<AppState>((set, get) => ({
  theme: "day",
  screen: "landing",
  activeReportId: SAMPLE_REPORTS[0].id,
  patientName: "ARNAV JOSHI",
  medQuery: "",
  selectedMedId: null,
  dose: 500,
  age: 34,
  specFilter: null,
  maxDistanceKm: 25,
  minRating: 4.0,
  parsing: false,
  parseStageIndex: 0,
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("night", theme === "night");
      document.documentElement.classList.toggle("day", theme === "day");
      try {
        localStorage.setItem("vg-theme", theme);
      } catch {
        /* private mode */
      }
    }
  },
  toggleTheme: () => get().setTheme(get().theme === "day" ? "night" : "day"),
  setScreen: (screen) => set({ screen }),
  setActiveReport: (activeReportId) => set({ activeReportId }),
  setMedQuery: (medQuery) => set({ medQuery }),
  selectMed: (selectedMedId) => set({ selectedMedId, dose: 500 }),
  setDose: (dose) => set({ dose }),
  setAge: (age) => set({ age }),
  setSpecFilter: (specFilter) => set({ specFilter }),
  setMaxDistanceKm: (maxDistanceKm) => set({ maxDistanceKm }),
  setMinRating: (minRating) => set({ minRating }),
  startParse: () => set({ parsing: true, parseStageIndex: 0 }),
  advanceParse: () => set((s) => ({ parseStageIndex: s.parseStageIndex + 1 })),
  finishParse: () => set({ parsing: false, parseStageIndex: 0, screen: "dashboard" }),
}));

/** All reports classified against the KB (memo-light: recompute per call is fine at this size). */
export function allReports(): LabReport[] {
  return SAMPLE_REPORTS.map((r) => classifyReport({ ...r, biomarkers: r.biomarkers.map((b) => ({ ...b })) }));
}

export function activeReport(): LabReport {
  const id = useApp.getState().activeReportId;
  return allReports().find((r) => r.id === id) ?? allReports()[0];
}

export function historyReports(): LabReport[] {
  return allReports().filter((r) => !r.isCurrent);
}
