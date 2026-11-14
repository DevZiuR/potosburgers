"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";

export function BurgerStatement() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scaleLinesRef = useRef<() => void>(() => {});

  useEffect(() => {
    const scaleLines = () => {
      if (!containerRef.current) return;
      const targetWidth = containerRef.current.clientWidth;
      if (targetWidth <= 0) return;

      const lines =
        containerRef.current.querySelectorAll<HTMLElement>(".fit-line");
      lines.forEach((line) => {
        // Skip hidden lines (e.g. inactive responsive layout)
        if (line.offsetParent === null) return;

        // Reset to base size to measure natural aspect ratio
        line.style.fontSize = "100px";
        const measuredWidth = line.getBoundingClientRect().width;
        if (measuredWidth > 0) {
          // Scale font-size so the line matches container width exactly
          const targetFontSize = (targetWidth / measuredWidth) * 100;
          line.style.fontSize = `${targetFontSize}px`;
        }
      });
    };

    scaleLinesRef.current = scaleLines;

    // Initial scale
    scaleLines();

    // Scale after web fonts load
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        scaleLines();
      });
    }

    // Scale on window resize
    const handleResize = () => {
      scaleLines();
    };
    window.addEventListener("resize", handleResize);

    const rafId = requestAnimationFrame(scaleLines);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="w-full bg-black text-white py-14 sm:py-20 md:py-24 overflow-x-hidden border-t-2 border-b-2 border-black flex flex-col items-center justify-center text-center select-none">
      {/* ── Eyebrow Badge (Matches Reference: ✦ SINCE 2024 · REAL INGREDIENTS · SIGNATURE FLAVOR ✦) ── */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 text-neutral-400 font-sans text-xs sm:text-sm font-bold uppercase tracking-[0.2em] mb-4 sm:mb-6 select-none">
        <span>✦</span>
        <span>SINCE 2024</span>
        <span>·</span>
        <span>REAL INGREDIENTS</span>
        <span>·</span>
        <span>SIGNATURE FLAVOR</span>
        <span>✦</span>
      </div>

      {/* ── Edge-to-Edge Poster Typography Container (2vw padding on each side) ── */}
      <div className="w-full px-[2vw] overflow-x-hidden">
        <div ref={containerRef} className="w-full flex flex-col items-center">
          <h2 className="w-full select-none flex flex-col items-center">
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex justify-center leading-[0.82] overflow-hidden">
                <span className="fit-line inline-block whitespace-nowrap tracking-[-0.01em] font-heading font-black uppercase text-white">
                  SABOR SIN
                </span>
              </div>
              <div className="w-full flex justify-center leading-[0.82] overflow-hidden">
                <span className="fit-line inline-flex items-center justify-center whitespace-nowrap tracking-[-0.01em] font-heading font-black uppercase text-white gap-[0.14em]">
                  <span className="text-[#E31B23]">LÍMITES</span>
                  <img
                    src="/potos-logo.png"
                    alt="Poto's Burgers"
                    onLoad={() => scaleLinesRef.current()}
                    className="inline-block h-[0.80em] w-[0.80em] object-contain rounded-full shadow-lg shrink-0"
                  />
                </span>
              </div>
            </div>
          </h2>
        </div>
      </div>

      {/* ── Bottom Action Button (Matches Screenshot: VIEW ALL ↗) ── */}
      <div className="mt-8 sm:mt-12 flex items-center justify-center">
        <Link
          href="#menu"
          className="inline-flex items-center gap-2.5 px-8 py-3 rounded-full border border-white/50 hover:border-white text-white font-heading font-black text-xs sm:text-sm uppercase tracking-[0.16em] hover:bg-white hover:text-black transition-all duration-200"
        >
          <span>VIEW ALL</span>
          <span className="text-sm">↗</span>
        </Link>
      </div>
    </section>
  );
}

export default BurgerStatement;
