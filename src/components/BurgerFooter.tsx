"use client";

import React from "react";
import Link from "next/link";

export function BurgerFooter() {
  return (
    <footer className="reveal-section w-full bg-white border-t-2 border-black select-none">
      {/* ── Main Split Footer ──────────────────────────────────────────────── */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 border-b-2 border-black">
        {/* ── Left Column: Red-and-White Striped Diner Frame (8 cols on lg) ──── */}
        <div
          className="lg:col-span-8 p-4 sm:p-6 lg:p-8 border-b-2 lg:border-b-0 lg:border-r-2 border-black flex items-center justify-center"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #E31B23 0px, #E31B23 22px, #FFFFFF 22px, #FFFFFF 44px)",
          }}
        >
          {/* Peach Inner Rounded Box */}
          <div className="w-full bg-[#FEEAE3] border-2 border-black rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 shadow-[6px_6px_0px_0px_#000]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-stretch">
              {/* Photo: footer.png — bigger, prominent full-height display */}
              <div className="reveal-item md:col-span-6 lg:col-span-7 relative w-full h-[340px] sm:h-[400px] md:h-full min-h-[340px] md:min-h-[460px] lg:min-h-[500px] rounded-2xl border-2 border-black overflow-hidden bg-black shadow-[4px_4px_0px_0px_#000]">
                <img
                  src="/media/footer.png"
                  alt="Cliente disfrutando una hamburguesa en Poto’s Burgers"
                  className="w-full h-full object-cover select-none hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Stacked Information Cards */}
              <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between gap-4 sm:gap-5">
                {/* Card 1: ESTAMOS ABIERTOS (WE'RE OPEN) */}
                <div className="reveal-item bg-white rounded-2xl border-2 border-black p-5 sm:p-6 flex flex-col justify-center shadow-[4px_4px_0px_0px_#000] flex-1">
                  <h3 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wider text-black mb-3">
                    ESTAMOS ABIERTOS
                  </h3>
                  <div className="font-sans text-sm sm:text-base text-[#333] space-y-1.5 font-semibold leading-relaxed">
                    <p className="text-[#E31B23] font-bold uppercase tracking-wider text-xs">Lunes a Domingo</p>
                    <p className="text-base sm:text-lg font-heading font-black">11:30 AM – 11:55 PM</p>
                  </div>
                </div>

                {/* Card 2: CONTACTO (CONTACT) */}
                <div className="reveal-item bg-[#E31B23] rounded-2xl border-2 border-black p-5 sm:p-6 flex flex-col justify-center shadow-[4px_4px_0px_0px_#000] flex-1 text-white">
                  <h3 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wider text-white mb-2">
                    CONTACTO
                  </h3>
                  <div className="space-y-1.5 font-sans mb-3 text-white">
                    <p className="text-sm sm:text-base font-bold text-white">
                      <a
                        href="mailto:contacto@potosburgers.com"
                        className="text-white hover:underline inline-flex items-center gap-1.5"
                      >
                        <span className="text-white">contacto@potosburgers.com</span>
                      </a>
                    </p>
                    <p className="text-white text-xs sm:text-sm font-semibold">
                      Centro Comercial Z&T, El Tigre, Anzoátegui
                    </p>
                  </div>
                  <a
                    href="tel:+584149813390"
                    className="font-sans font-black text-base sm:text-xl text-white hover:underline inline-flex items-center gap-2"
                  >
                    <span>+58 414-9813390</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Interactive Menu, Actions & Socials (4 cols on lg) ──── */}
        <div className="lg:col-span-4 flex flex-col bg-white">
          {/* Top Row: Purple (LLÁMANOS) & Blue (EMAIL) Split Blocks */}
          <div className="reveal-item w-full grid grid-cols-2 border-b-2 border-black">
            {/* LLÁMANOS */}
            <a
              href="tel:+584149813390"
              className="bg-[#843CB5] hover:bg-[#7633a3] text-white border-r-2 border-black py-5 sm:py-6 px-4 flex items-center justify-center text-center font-heading font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-wider transition-colors"
            >
              LLÁMANOS
            </a>

            {/* WHATSAPP */}
            <a
              href="https://wa.me/584149813390?text=Hola%2C%20quiero%20hacer%20un%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0057B7] hover:bg-[#004ca0] text-white py-5 sm:py-6 px-4 flex items-center justify-center text-center font-heading font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-wider transition-colors"
            >
              WHATSAPP
            </a>
          </div>

          {/* Middle Nav Rows - Distributed evenly with zero dead space */}
          <div className="reveal-item flex flex-col flex-1">
            <Link
              href="#locations"
              className="w-full flex-1 py-4.5 sm:py-6 px-6 sm:px-8 border-b-2 border-black font-heading font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-wider text-black hover:bg-[#FAF9F5] hover:pl-8 sm:hover:pl-10 transition-all flex items-center"
            >
              NUESTRO LOCAL
            </Link>

            <a
              href="https://wa.me/584149813390?text=Hola%2C%20quiero%20hacer%20un%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex-1 py-4.5 sm:py-6 px-6 sm:px-8 border-b-2 border-black font-heading font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-wider text-black hover:bg-[#FAF9F5] hover:pl-8 sm:hover:pl-10 transition-all flex items-center"
            >
              PEDIR ONLINE
            </a>

            <Link
              href="#contact"
              className="w-full flex-1 py-4.5 sm:py-6 px-6 sm:px-8 border-b-2 border-black font-heading font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-wider text-black hover:bg-[#FAF9F5] hover:pl-8 sm:hover:pl-10 transition-all flex items-center"
            >
              RESERVAS
            </Link>

            <Link
              href="#contact"
              className="w-full flex-1 py-4.5 sm:py-6 px-6 sm:px-8 border-b-2 border-black font-heading font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-wider text-black hover:bg-[#FAF9F5] hover:pl-8 sm:hover:pl-10 transition-all flex items-center"
            >
              EVENTOS Y PEDIDOS
            </Link>
          </div>

          {/* Bottom Social Media Bar: Bigger icons, WhatsApp & Instagram only */}
          <div className="reveal-item bg-[#FEEAE3] py-7 sm:py-9 px-6 sm:px-8 flex items-center justify-center sm:justify-start gap-5">
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/584149813390?text=Hola%2C%20quiero%20hacer%20un%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white border-2 border-black flex items-center justify-center text-[#E31B23] hover:bg-[#E31B23] hover:text-white transition-all shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] cursor-pointer"
            >
              <svg className="w-8 h-8 sm:w-9 sm:h-9 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.77.828 2.791.828 3.18 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm9.969 5.766c0 5.518-4.482 10-10 10-1.741 0-3.376-.452-4.805-1.241l-5.195 1.36 1.385-5.059c-.879-1.487-1.385-3.217-1.385-5.06 0-5.518 4.482-10 10-10 5.518 0 10 4.482 10 10z" />
              </svg>
            </a>

            {/* Instagram Button */}
            <a
              href="https://www.instagram.com/potosburgers"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white border-2 border-black flex items-center justify-center text-[#E31B23] hover:bg-[#E31B23] hover:text-white transition-all shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] cursor-pointer"
            >
              <svg className="w-8 h-8 sm:w-9 sm:h-9 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Bottom Copyright Bar with Matching Red Logo Design Effect ──────── */}
      <div className="w-full bg-white px-6 sm:px-10 lg:px-14 py-5 sm:py-6 flex flex-col md:flex-row items-center justify-between gap-4 font-sans">
        {/* Left: Red block logo with exact header styling and bigger font */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
          <Link
            href="/"
            className="bg-[#E31B23] border-2 border-black px-5 sm:px-7 py-2 sm:py-2.5 inline-flex items-center justify-center hover:bg-[#d0171e] transition-all shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] select-none group"
          >
            <span className="font-heading font-black italic uppercase tracking-wider text-white text-2xl sm:text-3xl md:text-4xl flex items-center gap-1.5">
              <span>POTO’S</span>
              <span className="text-white text-xl sm:text-2xl leading-none">*</span>
              <span>BURGERS</span>
            </span>
          </Link>
          <span className="text-xs sm:text-sm text-[#555] font-bold">
            © {new Date().getFullYear()} · El sabor que manda en El Tigre
          </span>
        </div>

        {/* Right: Admin Panel Link */}
        <div className="flex items-center gap-4 text-xs sm:text-sm text-[#555] font-semibold">
          <a
            href="#/admin"
            className="text-neutral-500 hover:text-[#FF5500] hover:underline transition-colors inline-flex items-center gap-1 font-bold"
          >
            <span className="text-xs">⚙️</span>
            <span>Panel del dueño</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default BurgerFooter;
