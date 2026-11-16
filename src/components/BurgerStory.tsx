"use client";

import React from "react";

export function BurgerStory() {
  return (
    <section
      id="about"
      className="reveal-section w-full bg-white text-black border-t-2 border-b-2 border-black select-none"
    >
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-[520px] sm:min-h-[580px] lg:min-h-[640px]">
        {/* ── Left Column: Feast Photography ──────────────────────────────── */}
        <div className="reveal-item relative w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-full bg-black overflow-hidden border-b-2 lg:border-b-0 lg:border-r-2 border-black">
          <img
            src="https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=1200&q=85"
            alt="Mesa con hamburguesas artesanales, papas fritas y salsas en Poto’s Burgers"
            className="w-full h-full object-cover select-none hover:scale-105 transition-transform duration-700"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* ── Right Column: Black & White Checkerboard with Floating Card ─── */}
        <div
          className="w-full h-full min-h-[460px] sm:min-h-[520px] lg:min-h-full flex items-center justify-center p-6 sm:p-10 md:p-12 lg:p-14 pb-[96px] sm:pb-[96px] lg:pb-[96px]"
          style={{
            background:
              "repeating-conic-gradient(#000000 0% 25%, #FFFFFF 0% 50%) 0 0 / 64px 64px",
          }}
        >
          {/* Peach Floating Rounded Card */}
          <div className="w-full max-w-md bg-[#FEEAE3] border-2 border-black rounded-3xl p-7 sm:p-9 md:p-10 shadow-[6px_6px_0px_0px_#000] text-center flex flex-col items-center">
            {/* Title: Big Playful Bold Heading */}
            <h2 className="reveal-item font-heading font-black text-4xl sm:text-5xl md:text-6xl uppercase tracking-wider text-black leading-[0.92] mb-5 select-none">
              <span>HORARIOS &</span>
              <br />
              <span>UBICACIÓN</span>
            </h2>

            {/* Address */}
            <div className="reveal-item font-sans text-xs sm:text-sm text-[#444] font-medium leading-relaxed mb-5">
              <p className="font-bold text-black text-sm sm:text-base">Centro Comercial Z&T</p>
              <p>4ta Carrera Sur, El Tigre 6050</p>
              <p>Anzoátegui, Venezuela</p>
            </div>

            {/* Opening Hours Schedule */}
            <div className="reveal-item w-full font-sans text-xs sm:text-sm text-[#333] font-bold border-y border-black/15 py-3.5 leading-relaxed mb-6">
              <p className="text-black uppercase tracking-wider text-[11px] font-black text-neutral-500 mb-1">
                Lunes a Domingo
              </p>
              <p className="text-base sm:text-lg text-black font-heading font-black tracking-wide">
                11:30 AM – 11:55 PM
              </p>
            </div>

            {/* Phone / WhatsApp Link in Bold Red */}
            <a
              href="https://wa.me/584149813390?text=Hola%2C%20quiero%20hacer%20un%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              className="reveal-item font-sans font-black text-lg sm:text-2xl text-[#E31B23] hover:underline inline-flex items-center gap-2 transition-transform hover:scale-105"
            >
              <span>+58 414-9813390</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BurgerStory;
