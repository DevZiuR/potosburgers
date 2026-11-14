"use client";

import React from "react";

export function BurgerGallery() {
  return (
    <section id="gallery" className="reveal-section w-full bg-[#EFECE6] text-black select-none">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 pt-6 sm:pt-10 pb-6 sm:pb-10">
        {/* ── Heading Block ──────────────────────────────────────────────── */}
        <div className="reveal-item mb-8 sm:mb-12">
          <h2 className="font-heading font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[-0.03em] uppercase text-black leading-[0.90]">
            LO QUE SALE DE LA COCINA
          </h2>
          <p className="font-sans text-[#444444] text-base sm:text-lg md:text-xl font-normal mt-3 sm:mt-4 max-w-2xl">
            Hamburguesas, pizzas y parrillas, tal como las sirven.
          </p>
        </div>

        {/* ── Photo Grid Layout (Matches Reference Image) ────────────────── */}
        <div className="flex flex-col gap-5 sm:gap-6 lg:gap-8">
          {/* ── Top Row: 2 Asymmetric Cards (Left 60%, Right 40%) ────────── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 lg:gap-8">
            {/* Card 1: 1.png (Eating Burger, wide) */}
            <div className="reveal-item md:col-span-7 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black aspect-[16/10] group shadow-md border-2 border-black">
              <img
                src="/media/1.png"
                alt="Hamburguesa artesanal Poto's Burgers"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none"
              />
            </div>

            {/* Card 2: 2.png (Artwork) */}
            <div className="reveal-item md:col-span-5 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black aspect-[16/10] md:aspect-auto group shadow-md border-2 border-black">
              <img
                src="/media/2.png"
                alt="Cuadro Poto's Burgers"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none"
              />
            </div>
          </div>

          {/* ── Bottom Row: 3 Equal Cards ────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {/* Card 3: 3.png (Girl eating burger) */}
            <div className="reveal-item relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black aspect-square sm:aspect-[4/3] md:aspect-square group shadow-md border-2 border-black">
              <img
                src="/media/3.png"
                alt="Comida en Poto's Burgers"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none"
              />
            </div>

            {/* Card 4: Black Typography Card */}
            <div className="reveal-item rounded-2xl sm:rounded-3xl bg-black text-white p-7 sm:p-9 md:p-10 flex flex-col justify-between aspect-square sm:aspect-[4/3] md:aspect-square shadow-md border-2 border-black select-none">
              <div>
                <h3 className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl tracking-[-0.03em] uppercase text-white leading-[0.88] mb-4">
                  <span className="block text-white">CADA PLATO</span>
                  <span className="block text-[#FF5500]">SALE COMO</span>
                  <span className="block text-white">LO PIDES</span>
                </h3>
              </div>

              <p className="font-sans text-neutral-400 text-xs sm:text-sm md:text-[15px] leading-relaxed font-normal">
                Sabor auténtico y calidad en cada bocado.
              </p>
            </div>

            {/* Card 5: 4.png (Macro melted cheese & bacon) */}
            <div className="reveal-item relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black aspect-square sm:aspect-[4/3] md:aspect-square group shadow-md border-2 border-black">
              <img
                src="/media/4.png"
                alt="Detalle smash burger con queso fundido"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BurgerGallery;
