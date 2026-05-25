import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Premium PrepZo mark — glossy monochrome with metallic silver gradient,
 * rounded-square container, custom stylized "P", and a sparkle accent.
 * Auto-adapts to light/dark surfaces.
 */
export function LogoMark({ className }: { className?: string }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-8 w-8", className)}
      aria-hidden
    >
      <defs>
        {/* Glossy dark body */}
        <linearGradient id={`pz-body-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2A2A2D" />
          <stop offset="45%" stopColor="#0E0E10" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        {/* Top sheen */}
        <linearGradient id={`pz-sheen-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* Metallic silver for the P */}
        <linearGradient id={`pz-metal-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#E6E8EC" />
          <stop offset="65%" stopColor="#A8AEB8" />
          <stop offset="100%" stopColor="#F4F5F7" />
        </linearGradient>
        {/* Sparkle */}
        <radialGradient id={`pz-spark-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id={`pz-glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer subtle ring for contrast on any bg */}
      <rect x="1.25" y="1.25" width="37.5" height="37.5" rx="10.5"
        fill="none" stroke="#ffffff" strokeOpacity="0.08" />

      {/* Body */}
      <rect x="2" y="2" width="36" height="36" rx="10" fill={`url(#pz-body-${id})`} />
      {/* Top gloss */}
      <rect x="2" y="2" width="36" height="18" rx="10" fill={`url(#pz-sheen-${id})`} />
      {/* Inner bevel */}
      <rect x="2.75" y="2.75" width="34.5" height="34.5" rx="9.25"
        fill="none" stroke="#ffffff" strokeOpacity="0.10" />

      {/* Stylized P */}
      <g filter={`url(#pz-glow-${id})`}>
        <path
          d="M13.5 29V11.4h8.1c3.55 0 5.95 2.25 5.95 5.6 0 3.35-2.4 5.6-5.95 5.6H17.6V29h-4.1zm4.1-9.55h3.45c1.55 0 2.55-.85 2.55-2.45s-1-2.45-2.55-2.45H17.6v4.9z"
          fill={`url(#pz-metal-${id})`}
        />
      </g>

      {/* Sparkle accent */}
      <g transform="translate(28.5 11)">
        <circle r="3.2" fill={`url(#pz-spark-${id})`} />
        <path
          d="M0 -2.2 L0.55 -0.55 L2.2 0 L0.55 0.55 L0 2.2 L-0.55 0.55 L-2.2 0 L-0.55 -0.55 Z"
          fill="#ffffff"
        />
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight">PrepZo</span>
    </div>
  );
}