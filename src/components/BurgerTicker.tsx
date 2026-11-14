"use client";

import React from "react";

const burgerNamesSpanish = [
  "HAMBURGUESAS",
  "PERROS CALIENTES",
  "PIZZAS",
  "PAPAS LOCAS",
  "PARRILLAS",
  "ALMUERZOS",
  "POSTRES",
  "BEBIDAS",
];

export function BurgerTicker() {
  return (
    <div className="w-full overflow-hidden select-none">
      {/* ── Marquee Bar: Pitch Black with Spanish Burger Names ─────────── */}
      <div className="w-full bg-black py-3 sm:py-3.5 border-t border-white/10 overflow-hidden flex items-center">
        <div className="flex w-max animate-marquee items-center whitespace-nowrap will-change-transform">
          {/* First sequence */}
          <div className="flex items-center gap-6 sm:gap-8 px-3">
            {burgerNamesSpanish.map((name, index) => (
              <React.Fragment key={`b1-${index}`}>
                <span className="font-heading font-black text-lg sm:text-xl md:text-2xl tracking-[-0.01em] text-[#EFECE6] uppercase">
                  {name}
                </span>
                <span className="text-[#EFECE6] text-sm sm:text-base leading-none select-none">
                  ✦
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Duplicate sequence for seamless infinite loop */}
          <div className="flex items-center gap-6 sm:gap-8 px-3" aria-hidden="true">
            {burgerNamesSpanish.map((name, index) => (
              <React.Fragment key={`b2-${index}`}>
                <span className="font-heading font-black text-lg sm:text-xl md:text-2xl tracking-[-0.01em] text-[#EFECE6] uppercase">
                  {name}
                </span>
                <span className="text-[#EFECE6] text-sm sm:text-base leading-none select-none">
                  ✦
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Retro Red & Cream Checkerboard Diner Strip ─────────────────── */}
      <div
        className="w-full h-6 sm:h-7"
        style={{
          background:
            "repeating-conic-gradient(#E31B23 0% 25%, #EFECE6 0% 50%) 0 0 / 28px 28px",
        }}
        aria-hidden="true"
      />
    </div>
  );
}

export default BurgerTicker;
