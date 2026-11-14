"use client";

import React, { useEffect, useState } from "react";

interface BurgerPreloaderProps {
  onComplete?: () => void;
}

export function BurgerPreloader({ onComplete }: BurgerPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<
    "loading" | "fading-logo" | "sliding-up" | "removed"
  >("loading");

  useEffect(() => {
    // Lock scroll on body while preloader is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let pageReady = false;
    const startTime = performance.now();
    const minDuration = 1200; // 1.2s min
    const maxDuration = 2500; // 2.5s max timeout

    const markPageReady = () => {
      pageReady = true;
    };

    if (typeof document !== "undefined") {
      if (document.readyState === "complete") {
        markPageReady();
      } else {
        window.addEventListener("load", markPageReady, { once: true });
      }

      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          markPageReady();
        });
      }
    }

    // Safety timeout: never block longer than 2.5s
    const maxTimer = setTimeout(() => {
      markPageReady();
    }, maxDuration);

    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const computedProgress = Math.min(
        100,
        Math.floor((elapsed / minDuration) * 100)
      );
      setProgress(computedProgress);

      if (computedProgress >= 100) {
        if (pageReady || elapsed >= maxDuration) {
          // 1. Logo scales down slightly and fades out (300ms)
          setPhase("fading-logo");

          setTimeout(() => {
            // 2. Entire overlay slides up (700ms) with cubic-bezier(0.22, 1, 0.36, 1)
            setPhase("sliding-up");

            setTimeout(() => {
              // 3. Right after overlay leaves: restore scroll, trigger hero animation, remove from DOM
              document.body.style.overflow = originalOverflow;
              if (onComplete) onComplete();
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("preloader:complete"));
              }
              setPhase("removed");
            }, 700);
          }, 300);

          return;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(maxTimer);
      if (typeof window !== "undefined") {
        window.removeEventListener("load", markPageReady);
      }
      document.body.style.overflow = originalOverflow;
    };
  }, [onComplete]);

  if (phase === "removed") return null;

  return (
    <div
      style={{
        zIndex: 99999,
        backgroundColor: "#222222",
        transition:
          phase === "sliding-up"
            ? "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)"
            : undefined,
        transform:
          phase === "sliding-up"
            ? "translate3d(0, -100%, 0)"
            : "translate3d(0, 0, 0)",
        willChange: phase === "sliding-up" ? "transform" : undefined,
      }}
      className="fixed inset-0 flex flex-col items-center justify-center select-none overflow-hidden"
    >
      <div
        style={{
          transition:
            phase === "fading-logo"
              ? "opacity 300ms ease, transform 300ms cubic-bezier(0.22, 1, 0.36, 1)"
              : undefined,
          opacity:
            phase === "fading-logo" || phase === "sliding-up" ? 0 : 1,
          transform:
            phase === "fading-logo" || phase === "sliding-up"
              ? "scale(0.95)"
              : "scale(1)",
        }}
        className="flex flex-col items-center"
      >
        {/* Logo with fade & rise 600ms cubic-bezier(0.22, 1, 0.36, 1) */}
        <div
          style={{
            animation:
              "preloaderLogoIn 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
          }}
          className="relative flex items-center justify-center"
        >
          <img
            src="/potos-logo.png"
            alt="Poto's Burgers"
            style={{ mixBlendMode: "lighten" }}
            className="w-[140px] md:w-[180px] object-contain select-none pointer-events-none"
          />
        </div>

        {/* Progress Line & Percentage Counter */}
        <div className="mt-8 flex flex-col items-center gap-3">
          {/* 2px Orange Progress Bar filling left to right */}
          <div className="w-44 sm:w-52 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              style={{
                width: `${progress}%`,
                transition: "width 80ms linear",
              }}
              className="h-full bg-[#ff5500] rounded-full"
            />
          </div>

          {/* Letter-spaced CARGANDO with % counter */}
          <div className="flex items-center gap-2 text-[11px] sm:text-xs uppercase font-sans font-bold text-[#ece9e2] tracking-[0.22em]">
            <span>CARGANDO</span>
            <span className="font-mono text-[#ff5500] font-bold tracking-normal min-w-8 text-right">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BurgerPreloader;
