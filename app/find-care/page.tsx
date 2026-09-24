"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { GlassCard, Badge, SectionHeading, Pill } from "@/components/ui/Glass";
import { activeReport, useApp } from "@/lib/store";
import { matchDoctors, SPECIALTIES_FROM_DOCTORS } from "@/lib/findcare";
import { flaggedSpecialties } from "@/lib/health";

const MapView = dynamic(() => import("@/components/findcare/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted">
      Loading map…
    </div>
  ),
});

export default function FindCare() {
  const report = activeReport();
  const { specFilter, setSpecFilter, maxDistanceKm, setMaxDistanceKm, minRating, setMinRating } = useApp();
  const doctors = useMemo(
    () => matchDoctors(report, specFilter, maxDistanceKm, minRating),
    [report.id, specFilter, maxDistanceKm, minRating]
  );
  const flagged = flaggedSpecialties(report);
  const specialties = SPECIALTIES_FROM_DOCTORS();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Geo-specialist care finder"
        title="Doctors matched to your flagged anomalies"
        right={
          <Link
            href={`/brief/${report.id}`}
            className="btn-primary px-4 py-2 text-sm"
          >
            Doctor Consultation Brief ↓
          </Link>
        }
      />

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-muted">Specialty:</span>
            <Pill active={specFilter === null} onClick={() => setSpecFilter(null)}>
              All
            </Pill>
            {specialties.map((s) => (
              <Pill key={s} active={specFilter === s} onClick={() => setSpecFilter(s)}>
                {flagged.includes(s) ? "★ " : ""}
                {s}
              </Pill>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-muted">
            Within {maxDistanceKm} km
            <input
              type="range"
              min={5}
              max={40}
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="w-28 accent-[var(--color-accent)]"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-muted">
            Rating ≥ {minRating.toFixed(1)}
            <input
              type="range"
              min={3.5}
              max={5}
              step={0.1}
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-24 accent-[var(--color-accent)]"
            />
          </label>
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        {/* Map */}
        <GlassCard className="overflow-hidden p-0">
          <div className="h-[420px] w-full">
            <MapView doctors={doctors} maxDistanceKm={maxDistanceKm} />
          </div>
        </GlassCard>

        {/* Doctor list */}
        <div className="space-y-3">
          {doctors.length === 0 && (
            <GlassCard className="p-6 text-sm text-muted">
              No doctors match these filters. Widen distance or lower the rating bar.
            </GlassCard>
          )}
          {doctors.map((d) => (
            <GlassCard key={d.id} hover className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{d.name}</span>
                    {d.verified && <Badge tone="accent">✓ Verified</Badge>}
                    {d.matched && <Badge tone="borderline">Matches your flags</Badge>}
                  </div>
                  <div className="mt-0.5 text-sm text-muted">
                    {d.specialty} · {d.clinic}, {d.area}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
                    <span>★ {d.rating} ({d.reviews})</span>
                    <span>{d.experience} yrs exp</span>
                    <span>₹{d.fee} consult</span>
                    <span>{d.distanceKm.toFixed(1)} km</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs text-[var(--color-accent)]">{d.nextSlot}</div>
                  <div className="mt-2 max-w-[110px] text-[10px] text-muted">{d.languages.join(" · ")}</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
