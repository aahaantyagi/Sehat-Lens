export type Theme = "day" | "night";

export type Status = "optimal" | "borderline" | "critical";

export type Trend = "up" | "down" | "flat";

export interface ReferenceRange {
  min: number;
  max: number;
  alt?: { label: string; min: number; max: number };
}

export interface HistoryPoint {
  date: string;
  value: number;
  reportId: string;
}

export interface BiomarkerValue {
  id: string;
  value: number;
  unit: string;
  status: Status;
  delta: number | null;
  history: HistoryPoint[];
}

export interface LabReport {
  id: string;
  label: string;
  date: string;
  labName: string;
  source: string;
  isCurrent: boolean;
  biomarkers: BiomarkerValue[];
}

export interface BiomarkerMeta {
  id: string;
  name: string;
  shortName: string;
  category: string;
  panel: string;
  unit: string;
  range: ReferenceRange;
  alt?: { label: string; min: number; max: number };
  layExplanation: string;
  mechanism: string;
  adjustments: string[];
  confidence: "High" | "Moderate" | "Emerging";
  confidenceNote: string;
  linkedSpecialties: string[];
}

export interface Medicine {
  id: string;
  name: string;
  class: string;
  forms: string[];
  strengths: number[];
  unit: string;
  indication: string;
  otc: boolean;
  rxRequired: boolean;
  ageMin: number;
  ageMax: number;
  standardDose: string;
  interactionLabs: string[];
  notes: string[];
}

export interface InteractionRule {
  id: string;
  medicineId: string;
  labId: string;
  severity: "caution" | "warning" | "danger";
  condition: "below" | "above" | "outside";
  threshold: number;
  message: string;
  action: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  area: string;
  city: string;
  rating: number;
  reviews: number;
  experience: number;
  fee: number;
  languages: string[];
  verified: boolean;
  lat: number;
  lng: number;
  nextSlot: string;
}

export interface ParseStage {
  key: string;
  label: string;
  detail: string;
}

export type Screen = "landing" | "dashboard" | "deep-dive" | "find-care" | "pharmacy";
