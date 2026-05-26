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
        "relative inline-flex items-center justify-center h-8 w-8 shrink-0 group",
        className,
      )}
      aria-hidden
    >
      <span
        className="absolute inset-0 rounded-[22%] blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.55), transparent 70%)",
        }}
      />
      <img
        src={iconSrc}
        alt=""
        draggable={false}
        className="relative h-full w-full object-contain select-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_2px_10px_rgba(255,255,255,0.18)]"
      />
    </span>
  );
}

/**
 * Full lockup: icon + "PrepZo" wordmark from the brand asset.
 * Use on hero / splash / login surfaces.
 */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <img
      src={lockupSrc}
      alt="PrepZo"
      draggable={false}
      className={cn(
        "h-12 w-auto select-none object-contain",
        "drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_4px_22px_rgba(255,255,255,0.18)]",
        className,
      )}
    />
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