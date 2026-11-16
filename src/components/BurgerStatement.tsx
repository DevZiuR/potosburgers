"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function BurgerStatement() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const scaleLines = () => {
      if (!containerRef.current) return;
      const targetWidth = containerRef.current.clientWidth;
      if (targetWidth <= 0) return;

      const isDesktop = window.innerWidth >= 900;
      const line1 = containerRef.current.querySelector<HTMLElement>(".line-sabor");
      const line2 = containerRef.current.querySelector<HTMLElement>(".line-limites");

      if (line1) {
        line1.style.fontSize = "100px";
        const w1 = line1.getBoundingClientRect().width;
        if (w1 > 0) {
          const fontSize1 = (targetWidth / w1) * 100;
          line1.style.fontSize = `${fontSize1}px`;

          if (line2) {
            if (isDesktop) {
              // On desktop, match line 1 font size so SABOR SIN and LÍMITES share the exact scale,
              // leaving ~440px on the right for the mascot
              line2.style.fontSize = `${fontSize1}px`;
            } else {
              // Under 900px, scale LÍMITES to span container cleanly
              line2.style.fontSize = "100px";
              const w2 = line2.getBoundingClientRect().width;
              if (w2 > 0) {
                line2.style.fontSize = `${(targetWidth / w2) * 100}px`;
              }
            }
          }
        }
      }
    };

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

  // IntersectionObserver for entrance animation
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black text-white py-14 sm:py-20 md:py-24 overflow-x-hidden border-t-2 border-b-2 border-black flex flex-col items-center justify-center text-center select-none"
    >
      {/* ── Edge-to-Edge Poster Typography Container (2vw padding on each side) ── */}
      <div className="w-full px-[2vw] overflow-visible">
        <div ref={containerRef} className="w-full flex flex-col items-center">
          <h2 className="w-full select-none flex flex-col items-center">
            {/* Line 1: SABOR SIN */}
            <div className="w-full flex justify-center leading-[0.82] overflow-hidden">
              <span className="line-sabor inline-block whitespace-nowrap tracking-[-0.01em] font-heading font-black uppercase text-white">
                SABOR SIN
              </span>
            </div>

            {/* Line 2: LÍMITES + Pointing Mascot */}
            <div className="w-full flex flex-col min-[900px]:flex-row items-end min-[900px]:items-center min-[900px]:justify-between leading-[0.82] overflow-visible">
              <div className="w-full min-[900px]:w-auto flex justify-center min-[900px]:justify-start">
                <span className="line-limites inline-block whitespace-nowrap tracking-[-0.01em] font-heading font-black uppercase text-[#E31B23]">
                  LÍMITES
                </span>
              </div>

              {/* ── Mascot pointing left ── */}
              <div className="w-full min-[900px]:w-auto flex justify-end shrink-0 mt-3 min-[900px]:mt-0">
                <div className="w-[220px] min-[900px]:w-[340px] lg:w-[400px] xl:w-[440px] max-w-[90vw] min-[900px]:max-w-[32vw] translate-y-[8px]">
                  <div
                    className={
                      isInView
                        ? "mascot-pointing-entrance"
                        : "opacity-0 translate-x-[40px]"
                    }
                  >
                    <div className="mascot-pointing-sway">
                      <div className="mascot-pointing-hover cursor-pointer">
                        <Image
                          src="/media/graphics/pointing-left.png"
                          alt="Mascota de Poto's Burgers señalando"
                          width={1230}
                          height={1278}
                          priority={false}
                          className="w-full h-auto select-none drop-shadow-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
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
