import * as React from "react";
import { cn } from "@/lib/utils";
import iconSrc from "@/assets/prepzo-icon.png";
import lockupSrc from "@/assets/prepzo-lockup.png";

/**
 * PrepZo logo mark — premium glossy metallic icon.
 * Uses the official brand asset with subtle hover glow.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center h-8 w-8 shrink-0 group overflow-hidden rounded-[22%]",
        className,
      )}
      aria-hidden
    >
      <img
        src={iconSrc}
        alt=""
        draggable={false}
        className="relative z-10 h-full w-full object-contain select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_1px_6px_rgba(255,255,255,0.18)]"
      />
      {/* Metallic shimmer sweep — icon only */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 animate-metal-shimmer"
        style={{
          background:
            "linear-gradient(110deg, transparent 38%, rgba(255,255,255,0.55) 50%, transparent 62%)",
          mixBlendMode: "overlay",
        }}
      />
    </span>
  );
}

/**
 * Full lockup: icon + "PrepZo" wordmark from the brand asset.
 * Use on hero / splash / login surfaces.
 */
export function LogoLockup({ className, shimmer = false }: { className?: string; shimmer?: boolean }) {
  return (
    <span className={cn("relative inline-flex items-center overflow-hidden", className)}>
      <img
        src={lockupSrc}
        alt="PrepZo"
        draggable={false}
        className={cn(
          "h-full w-auto select-none object-contain relative z-10",
          "contrast-[1.08] brightness-[1.02]",
          "drop-shadow-[0_6px_22px_rgba(0,0,0,0.28)]",
          "dark:contrast-[1.15] dark:brightness-[1.15]",
          "dark:drop-shadow-[0_6px_30px_rgba(255,255,255,0.28)]",
        )}
      />
      {shimmer && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -inset-x-1 z-20 animate-metal-shimmer"
          style={{
            background:
              "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.7) 50%, transparent 65%)",
            mixBlendMode: "overlay",
          }}
        />
      )}
    </span>
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