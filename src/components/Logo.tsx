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
        className="relative z-10 h-full w-full object-contain select-none contrast-[1.15] brightness-[0.95] drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] dark:contrast-[1.2] dark:brightness-[1.18] dark:drop-shadow-[0_1px_6px_rgba(255,255,255,0.22)]"
      />
    </span>
  );
}

/**
 * Full lockup: icon + "PrepZo" wordmark from the brand asset.
 * Use on hero / splash / login surfaces.
 */
export function LogoLockup({ className, shimmer = false }: { className?: string; shimmer?: boolean }) {
  // `shimmer` retained for API compatibility but intentionally ignored — logo stays static.
  void shimmer;
  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <img
        src={lockupSrc}
        alt="PrepZo"
        draggable={false}
        className={cn(
          "h-full w-auto select-none object-contain relative z-10",
          // Premium chrome look — sharper edges, better readability in both modes
          "contrast-[1.22] brightness-[0.92] saturate-[1.05]",
          "drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)] drop-shadow-[0_4px_14px_rgba(0,0,0,0.22)]",
          "dark:contrast-[1.25] dark:brightness-[1.25] dark:saturate-100",
          "dark:drop-shadow-[0_1px_2px_rgba(255,255,255,0.18)] dark:drop-shadow-[0_6px_24px_rgba(255,255,255,0.22)]",
        )}
      />
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