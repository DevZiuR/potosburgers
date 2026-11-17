"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

interface Review {
  id: string;
  quote: string;
  author: string;
  platform: string;
}

const reviewsList: Review[] = [
  {
    id: "francis",
    quote:
      "“Cualquier cosa del menú que pidan les va a encantar. Entre mis favoritos están los perros extra queso, las papas con pollo crispy y también la cheesy burger. Cuentan con estacionamiento, todo super limpio y la atención es otro de sus atractivos.”",
    author: "FRANCIS RECOMIENDA",
    platform: "GOOGLE",
  },
  {
    id: "juan",
    quote:
      "“Buen ambiente, excelente comida y una óptima atención del personal... La ensalada cesar no juega carrito 😁”",
    author: "JUAN FERREIRA CÁRDENAS",
    platform: "GOOGLE",
  },
  {
    id: "suzan",
    quote:
      "“El mejor sitio de comida en El Tigre, he comido en casi todos y nadie tiene el sabor de esta gente, son muy aseados y la atención es excelente. Sin duda, no tienen rival.”",
    author: "SUZAN AL OUD",
    platform: "GOOGLE",
  },
];

const GOOGLE_REVIEWS_URL =
  "https://www.google.com/search?q=potos+burger&ie=UTF-8#lrd=0x8dcd8329d14487ab:0x2891c933af31eafe,1,,,,";

export function BurgerReviews() {
  const centerCardRef = useRef<HTMLDivElement>(null);
  const [isPeekingInView, setIsPeekingInView] = useState(false);

  useEffect(() => {
    const card = centerCardRef.current;
    if (!card) return;

    if (!("IntersectionObserver" in window)) {
      setIsPeekingInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsPeekingInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="reveal-section w-full bg-black text-white select-none">
      {/* ── Top Retro Red & Cream Checkerboard Diner Strip ───────────────── */}
      <div
        className="w-full h-6 sm:h-7"
        style={{
          background:
            "repeating-conic-gradient(#E31B23 0% 25%, #EFECE6 0% 50%) 0 0 / 28px 28px",
        }}
        aria-hidden="true"
      />

      {/* ── Section Content ──────────────────────────────────────────────── */}
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 py-16 sm:py-24 md:py-28">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 sm:mb-16 md:mb-32 lg:mb-36">
          <div className="reveal-item">
            <h2
              className="font-heading uppercase text-white"
              style={{
                fontSize: "clamp(3.5rem, 8.5vw, 124px)",
                fontWeight: 900,
                lineHeight: "0.85",
                letterSpacing: "-2.16px",
                color: "#fff",
              }}
            >
              <span className="block">LO QUE DICEN</span>
              <span className="block">NUESTROS CLIENTES</span>
            </h2>
          </div>

          {/* Google Rating Pill Badge (Clickable link) */}
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver reseñas en Google"
            className="reveal-item inline-flex items-center gap-2.5 bg-white text-black px-5 py-2.5 rounded-full shadow-md w-fit hover:bg-neutral-100 hover:scale-105 transition-all cursor-pointer"
          >
            {/* Google Logo Icon */}
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.3 7.5 23.5 12 23.5z"
              />
            </svg>

            <span className="font-sans font-bold text-xs uppercase tracking-[0.14em] text-neutral-900">
              4.5 / 5 · 189 RESEÑAS
            </span>
            <span className="text-neutral-400 text-xs font-bold leading-none">↗</span>
          </a>
        </div>

        {/* ── 3 Reviews Cards Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {reviewsList.map((review, index) => {
            const isCenterCard = index === 1;
            return (
              <div
                key={review.id}
                ref={isCenterCard ? centerCardRef : undefined}
                className={`reveal-item bg-[#EFECE6] text-black rounded-2xl sm:rounded-3xl p-7 sm:p-9 flex flex-col justify-between shadow-md border-2 border-black hover:translate-y-[-4px] transition-transform duration-300 ${isCenterCard ? "relative overflow-visible mt-20 md:mt-0" : ""
                  }`}
              >
                {/* ── Peeking Mascot above the center review card ── */}
                {isCenterCard && (
                  <div className="absolute bottom-full mb-[-14px] sm:mb-[-17px] left-1/2 -translate-x-1/2 w-[130px] sm:w-[150px] md:w-[160px] h-[87px] sm:h-[100px] md:h-[107px] overflow-hidden pointer-events-none z-10">
                    <div
                      className={
                        isPeekingInView
                          ? "mascot-peeking-entrance w-full h-full"
                          : "translate-y-full w-full h-full"
                      }
                    >
                      <div
                        className={
                          isPeekingInView
                            ? "mascot-peeking-bob w-full h-full"
                            : "w-full h-full"
                        }
                      >
                        <Image
                          src="/media/graphics/peaking-over.png"
                          alt="Mascota asomándose"
                          width={1536}
                          height={1024}
                          priority={false}
                          className="w-full h-auto select-none block"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  {/* 5 Red Stars */}
                  <div className="flex items-center gap-1 mb-6 text-[#E31B23]">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 fill-[#E31B23]"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="font-sans text-neutral-900 text-sm sm:text-base leading-relaxed font-semibold mb-8">
                    {review.quote}
                  </p>
                </div>

                {/* Author & Source */}
                <div className="font-sans text-xs font-bold uppercase text-neutral-800 pt-4 border-t border-black/15 flex items-center justify-between gap-4">
                  <span className="tracking-[0.1em] leading-tight break-words min-w-0">
                    {review.author}
                  </span>
                  <span className="text-[#E31B23] font-black tracking-[0.14em] shrink-0">
                    {review.platform}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom CTA Button to View All Google Reviews ────────────────── */}
        <div className="mt-12 sm:mt-16 flex items-center justify-center">
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-black hover:bg-[#E31B23] hover:text-white font-sans font-black text-xs sm:text-sm uppercase tracking-[0.18em] px-8 py-4 rounded-full border-2 border-white shadow-[4px_4px_0px_0px_#E31B23] hover:shadow-[4px_4px_0px_0px_#FFF] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
          >
            <span>VER MÁS RESEÑAS EN GOOGLE</span>
            <span className="text-base font-black leading-none">↗</span>
          </a>
        </div>
      </div>

      {/* ── Bottom Retro Red & Cream Checkerboard Diner Strip ───────────── */}
      <div
        className="w-full h-6 sm:h-7"
        style={{
          background:
            "repeating-conic-gradient(#E31B23 0% 25%, #EFECE6 0% 50%) 0 0 / 28px 28px",
        }}
        aria-hidden="true"
      />
    </section>
  );
}

export default BurgerReviews;
