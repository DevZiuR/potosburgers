"use client";

import React, { useState } from "react";

export function BurgerContact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="contact" className="w-full bg-[#EFECE6] text-black pt-16 sm:pt-24 md:pt-28 select-none">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* ── Left Column: Contact Information ──────────────────────────── */}
          <div className="lg:col-span-6 flex flex-col justify-center pt-2 sm:pt-6">
            <h2 className="font-heading font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[-0.03em] uppercase text-black leading-[0.85] mb-6 sm:mb-8 select-none">
              CONTACTA CON LA COCINA
            </h2>

            <div className="space-y-3 font-sans text-sm sm:text-base text-neutral-800">
              <p className="font-medium tracking-wide">
                <span>4ta Carrera Sur, CC Z&T, El Tigre 6050, Anzoátegui</span>
                <span className="mx-2 text-neutral-400">·</span>
                <span>Lun–Dom 11:30am – 11:55pm</span>
              </p>

              <p className="font-bold text-black tracking-wide pt-1">
                <a
                  href="tel:+584149813390"
                  className="hover:text-[#E31B23] transition-colors text-lg sm:text-xl font-heading font-black tracking-wider"
                >
                  0414-9813390
                </a>
              </p>
            </div>
          </div>

          {/* ── Right Column: Dark Form Card ──────────────────────────────── */}
          <div className="lg:col-span-6">
            <div className="w-full bg-black text-white rounded-3xl p-7 sm:p-10 md:p-12 shadow-2xl border border-black flex flex-col">
              <h3 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight uppercase text-white leading-tight mb-7 sm:mb-8 select-none">
                RESERVAS, PRENSA O HAMBRE FEROZ — HABLEMOS.
              </h3>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Name Input */}
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Nombre"
                    className="w-full rounded-full px-5 py-3.5 bg-[#EFECE6] text-black placeholder:text-neutral-500 font-sans text-sm font-medium outline-none border border-transparent focus:border-neutral-400 transition-colors"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    className="w-full rounded-full px-5 py-3.5 bg-[#EFECE6] text-black placeholder:text-neutral-500 font-sans text-sm font-medium outline-none border border-transparent focus:border-neutral-400 transition-colors"
                  />
                </div>

                {/* Message Textarea */}
                <div>
                  <textarea
                    rows={4}
                    required
                    placeholder="Mensaje"
                    className="w-full rounded-2xl px-5 py-3.5 bg-[#EFECE6] text-black placeholder:text-neutral-500 font-sans text-sm font-medium outline-none border border-transparent focus:border-neutral-400 transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-[#E31B23] hover:bg-[#c9141c] text-white font-sans font-bold text-xs uppercase tracking-[0.16em] px-8 py-3.5 rounded-full transition-all duration-200 hover:scale-105 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span>{submitted ? "¡MENSAJE ENVIADO!" : "ENVIAR MENSAJE"}</span>
                    <span className="text-sm font-bold leading-none">→</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>


    </section>
  );
}

export default BurgerContact;
