"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { activeReport } from "@/lib/store";

export function LogoMark({ size = 24, stroke = "var(--accent)" }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="2" y="2" width="28" height="28" rx="9" stroke={stroke} strokeWidth="2" />
      <circle cx="16" cy="16" r="6.5" stroke={stroke} strokeWidth="2" />
      <line x1="16" y1="2.5" x2="16" y2="8" stroke={stroke} strokeWidth="2" />
      <line x1="16" y1="24" x2="16" y2="29.5" stroke={stroke} strokeWidth="2" />
      <line x1="2.5" y1="16" x2="8" y2="16" stroke={stroke} strokeWidth="2" />
      <line x1="24" y1="16" x2="29.5" y2="16" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

export function Logo({ size = 24 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="text-[17px] font-bold tracking-tight text-strong">
        Sehat<span className="font-light">Lens</span>
      </span>
    </span>
  );
}

const NAV = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trends", label: "Trends" },
  { href: "/find-care", label: "Find Care" },
  { href: "/pharmacy", label: "Pharmacy" },
  { href: "/about", label: "About" },
];

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useApp((s) => s.theme);
  const setTheme = useApp((s) => s.setTheme);
  const toggleTheme = useApp((s) => s.toggleTheme);
  const patientName = useApp((s) => s.patientName);
  const report = activeReport();

  // Sync store theme with the class the no-FOUC script applied on load.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("vg-theme");
    } catch {
      /* private mode */
    }
    const t = stored === "night" ? "night" : "day";
    if (t !== useApp.getState().theme) setTheme(t);
  }, [setTheme]);

  const isBrief = pathname?.startsWith("/brief");
  if (isBrief) return <>{children}</>;

  return (
    <div className="atmosphere">
      {/* Floating capsule header */}
      <header className="no-print sticky top-3 z-40 mx-auto max-w-6xl px-4">
        <div className="glass-strong flex h-12 items-center justify-between gap-3 rounded-full px-3 pl-4">
          <Link href="/" aria-label="SehatLens home" className="shrink-0">
            <Logo />
          </Link>

          {/* Page navigation */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((n) => {
              const active = n.href === "/" ? pathname === "/" : pathname?.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                      : "text-muted hover:text-strong"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          {/* Active panel badge — only when nav is collapsed (or always on wide) */}
          <Link
            href="/dashboard"
            className="badge badge-accent hidden truncate xl:inline-flex"
            title={`${report.labName} · ${new Date(report.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
          >
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--accent)" }} />
            <span className="truncate">
              {report.labName.split(",")[0].toUpperCase()} • {new Date(report.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === "day" ? "Switch to night sky" : "Switch to day sky"}
              className="pill flex h-8 w-8 items-center justify-center !px-0"
              title={theme === "day" ? "Night Sky" : "Day Sky"}
            >
              {theme === "day" ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              )}
            </button>

            {/* Upload new panel */}
            <button
              onClick={() => router.push("/?upload=1")}
              className="btn-primary flex h-8 items-center gap-1.5 px-3.5 text-[13px]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="hidden sm:inline">Upload New Panel</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>
        </div>

        {/* Mobile nav row */}
        <nav className="mt-2 flex gap-1 overflow-x-auto pb-1 lg:hidden [&::-webkit-scrollbar]:hidden">
          {NAV.map((n) => {
            const active = n.href === "/" ? pathname === "/" : pathname?.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-xl transition-colors ${
                  active
                    ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)]"
                    : "text-muted hover:text-strong"
                }`}
                style={{ borderColor: "var(--hairline)", background: "var(--glass-bg-soft)" }}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="no-print mx-auto max-w-6xl px-4 pb-16 pt-5">{children}</main>
    </div>
  );
}
