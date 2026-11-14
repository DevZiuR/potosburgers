"use client";

import React, { useState } from "react";
import { playClickSound, initAudioContext } from "@/utils/soundEffects";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const faqList: FaqItem[] = [
  {
    id: "pedidos",
    question: "01. ¿Cómo puedo realizar un pedido?",
    answer:
      "Puedes consultar nuestro menú y realizar tu pedido directamente con nosotros a través de WhatsApp (+58 414-9813390). ¡Te atendemos de inmediato para que disfrutes sin demoras!",
  },
  {
    id: "delivery",
    question: "02. ¿Realizan entregas a domicilio?",
    answer:
      "¡Sí! Contamos con servicio de delivery rápido para toda la zona de El Tigre y sectores cercanos. Escríbenos por WhatsApp con tu ubicación para coordinar el envío hasta tu puerta.",
  },
  {
    id: "retiro",
    question: "03. ¿Puedo retirar mi pedido directamente en el local?",
    answer:
      "¡Por supuesto! Puedes hacer tu pedido por WhatsApp con anticipación y pasar a retirarlo listo, caliente y crujiente directamente en nuestras instalaciones en el Centro Comercial Z&T.",
  },
  {
    id: "personalizar",
    question: "04. ¿Puedo personalizar mi hamburguesa o agregar extras?",
    answer:
      "¡Claro que sí! Puedes complementar tu pedido a tu gusto con queso extra fundido, tocineta crujiente, carne adicional, salsas de la casa y todos los agregados disponibles.",
  },
  {
    id: "ubicacion-horarios",
    question: "05. ¿Dónde están ubicados y cuáles son sus horarios?",
    answer:
      "Estamos ubicados en el Centro Comercial Z&T (4ta Carrera Sur, El Tigre, Anzoátegui). Abrimos todos los días, de lunes a domingo, desde las 11:30 AM hasta las 11:55 PM.",
  },
  {
    id: "reservaciones",
    question: "06. ¿Aceptan reservaciones?",
    answer:
      "¡Sí! Disponemos de dos ambientes cómodos y climatizados para disfrutar. Escríbenos con anticipación por WhatsApp para coordinar la disponibilidad de tu mesa o celebración.",
  },
];

export function BurgerFaq() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    initAudioContext();
    playClickSound();
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="reveal-section w-full bg-[#EFECE6] text-black pt-6 sm:pt-10 pb-16 sm:pb-24 md:pb-28 select-none">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
        {/* ── Section Header ────────────────────────────────────────────── */}
        <div className="reveal-item flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 mb-10 sm:mb-14">
          <h2 className="font-heading font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[-0.03em] uppercase text-black leading-[0.85]">
            Preguntas Frecuentes
          </h2>

          <span className="font-sans text-xs sm:text-[13px] font-bold uppercase tracking-[0.2em] text-black/80">
            PREGUNTAS ANTES DEL PRIMER BOCADO
          </span>
        </div>

        {/* ── Accordion List ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:gap-3.5">
          {faqList.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="reveal-item w-full bg-black text-white rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200 border-2 border-black shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between text-left gap-4 hover:bg-neutral-950 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-sans text-base sm:text-lg md:text-xl font-medium tracking-tight text-white select-none">
                    {item.question}
                  </span>

                  <span
                    className={`text-xl sm:text-2xl font-light leading-none text-white/80 transition-transform duration-200 select-none flex-shrink-0 ${isOpen ? "rotate-45" : "rotate-0"
                      }`}
                  >
                    +
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 sm:px-8 pb-6 sm:pb-7 pt-1 border-t border-white/10 animate-fadeIn">
                    <p className="font-sans text-neutral-300 text-sm sm:text-base leading-relaxed font-normal">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BurgerFaq;
