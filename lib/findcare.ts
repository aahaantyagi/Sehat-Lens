import type { Doctor, LabReport } from "@/lib/types";
import { DOCTORS, SPECIALTIES } from "@/lib/data/doctors";
import { flaggedSpecialties } from "@/lib/health";

export type DoctorWithDistance = Doctor & { distanceKm: number };
export type MatchedDoctor = DoctorWithDistance & { matched: boolean };

/** Haversine distance in km (prototype: straight-line, not driving distance). */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Mock user location: MG Road / Trinity area, central Bengaluru. */
export const USER_LOCATION = { lat: 12.9716, lng: 77.5946 };

export function doctorsWithDistance(): DoctorWithDistance[] {
  return DOCTORS.map((d) => ({
    ...d,
    distanceKm: distanceKm(USER_LOCATION, { lat: d.lat, lng: d.lng }),
  }));
}

/** Specialists matched to flagged anomalies first, then the rest. */
export function matchDoctors(
  report: LabReport,
  specFilter: string | null,
  maxDistanceKm: number,
  minRating: number
): MatchedDoctor[] {
  const flagged = new Set(flaggedSpecialties(report));
  const all = doctorsWithDistance()
    .filter((d) => d.distanceKm <= maxDistanceKm && d.rating >= minRating)
    .filter((d) => (specFilter ? d.specialty === specFilter : true))
    .map((d) => ({ ...d, matched: flagged.has(d.specialty) }));

  return all.sort((a, b) => Number(b.matched) - Number(a.matched) || a.distanceKm - b.distanceKm);
}

export const SPECIALTIES_FROM_DOCTORS = () => SPECIALTIES;
