import type { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
  hover = false,
  variant = "default",
  style,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  variant?: "default" | "strong" | "soft";
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const v = variant === "strong" ? "glass-strong" : variant === "soft" ? "glass-soft" : "glass";
  return (
    <div onClick={onClick} style={style} className={`${v} ${hover ? "glass-hover" : ""} ${className}`}>
      {children}
    </div>
  );
}

export type BadgeTone = "optimal" | "borderline" | "critical" | "accent" | "neutral";

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return <span className={`badge badge-${tone} ${className}`}>{children}</span>;
}

export function Micro({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`micro text-muted ${className}`}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="micro mb-1.5 text-muted">{eyebrow}</div>}
        <h2 className="text-xl font-semibold tracking-tight text-strong">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function Pill({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button onClick={onClick} className={`pill ${active ? "pill-active" : ""}`}>
      {children}
    </button>
  );
}
