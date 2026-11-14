"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { playClickSound, initAudioContext } from "@/utils/soundEffects";
import {
  getCartCount,
  subscribeCartCount,
  openCartDrawer,
  subscribeCartBump,
  subscribeFlyItem,
} from "@/utils/cartStore";

interface FlyingItem {
  id: number;
  startX: number;
  startY: number;
  flyX: number;
  flyY: number;
}

export function BurgerHero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCountState] = useState(getCartCount());
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartBumping, setIsCartBumping] = useState(false);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);

  // Reveal headline & badge after preloader leaves
  useEffect(() => {
    const handleReveal = () => setIsRevealed(true);
    window.addEventListener("preloader:complete", handleReveal);
    const timer = setTimeout(() => setIsRevealed(true), 3200);

    return () => {
      window.removeEventListener("preloader:complete", handleReveal);
      clearTimeout(timer);
    };
  }, []);

  // Keep badge in sync with the shared cart store
  useEffect(() => {
    return subscribeCartCount((c) => setCartCountState(c));
  }, []);

  // Subscribe to cart bump animation
  useEffect(() => {
    return subscribeCartBump(() => {
      setIsCartBumping(true);
      const timer = setTimeout(() => setIsCartBumping(false), 350);
      return () => clearTimeout(timer);
    });
  }, []);

  // Subscribe to flying item effect
  useEffect(() => {
    return subscribeFlyItem((data) => {
      const id = Date.now() + Math.random();
      // Target header cart position (top-right approx 40px from right, 28px from top)
      const targetX = window.innerWidth - 44;
      const targetY = 28;
      const flyX = targetX - data.x;
      const flyY = targetY - data.y;

      setFlyingItems((prev) => [
        ...prev,
        { id, startX: data.x, startY: data.y, flyX, flyY },
      ]);

      setTimeout(() => {
        setFlyingItems((prev) => prev.filter((item) => item.id !== id));
      }, 620);
    });
  }, []);

  // Toggle "scrolled" state after scrolling past 40px, throttled with requestAnimationFrame
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <header
        className="w-full sticky top-0 z-50 bg-white border-b-2 border-black transition-colors duration-[250ms]"
      >
        <div className="w-full h-14 sm:h-16 flex items-stretch justify-between">
          {/* Brand Logo - Red Block */}
          <Link
            href="/"
            className="bg-[#E31B23] px-4 sm:px-7 flex items-center justify-center hover:bg-[#d0171e] transition-colors duration-[250ms] group select-none border-r-2 border-black"
          >
            <span className="font-heading font-black italic uppercase tracking-wider text-white text-xl sm:text-2xl md:text-3xl flex items-center gap-1">
              <span>POTO'S</span>
              <span className="text-white text-base sm:text-lg leading-none">*</span>
              <span>BURGERS</span>
            </span>
          </Link>

          {/* Right Action Icons: Hamburger Menu + Shopping Cart */}
          <div className="flex items-stretch">
            {/* Hamburger / Close Toggle Button */}
            <button
              type="button"
              onClick={() => {
                initAudioContext();
                playClickSound();
                setMenuOpen(!menuOpen);
              }}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              className={`h-full px-5 sm:px-6 flex items-center justify-center transition-colors duration-[250ms] cursor-pointer ${menuOpen
                ? "bg-[#E31B23] hover:bg-[#d0171e] border-l-2 border-r-2 border-black"
                : "bg-[#FEEAE3] hover:bg-[#fedbd0] border-l-2 border-r-2 border-black"
                }`}
            >
              {menuOpen ? (
                /* Close X Icon */
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-current stroke-[3]"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="square" />
                </svg>
              ) : (
                /* 3-Bar Hamburger */
                <div className="flex flex-col justify-center gap-1.5 w-5 sm:w-6">
                  <span className="block h-[2.5px] sm:h-[3px] w-full rounded-xs bg-black" />
                  <span className="block h-[2.5px] sm:h-[3px] w-full rounded-xs bg-black" />
                  <span className="block h-[2.5px] sm:h-[3px] w-full rounded-xs bg-black" />
                </div>
              )}
            </button>

            {/* Shopping Cart Button — opens the full BurgerCartDrawer */}
            <button
              type="button"
              onClick={() => {
                initAudioContext();
                playClickSound();
                openCartDrawer();
                setMenuOpen(false);
              }}
              aria-label="Ver carrito"
              className="h-full px-5 sm:px-6 flex items-center justify-center relative hover:bg-black/5 transition-colors duration-[250ms] cursor-pointer"
            >
              <svg
                className={`w-5 h-5 sm:w-6 sm:h-6 fill-current text-black ${isCartBumping ? "animate-cart-bump" : ""
                  }`}
                viewBox="0 0 24 24"
              >
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
              {/* Live badge — hidden when cart is empty */}
              {cartCount > 0 && (
                <span
                  className={`absolute top-2 sm:top-2.5 right-2 sm:right-3 w-4 h-4 rounded-full bg-[#E31B23] text-white text-[10px] font-black flex items-center justify-center border border-white ${isCartBumping ? "animate-badge-pop" : ""
                    }`}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Flying Items Effect Layer ────────────────────────────────────── */}
        {flyingItems.map((item) => (
          <div
            key={item.id}
            className="fixed pointer-events-none z-50 rounded-full bg-[#FF5500] text-white font-heading font-black text-xs px-2 py-0.5 shadow-lg border border-black flex items-center justify-center"
            style={
              {
                left: `${item.startX}px`,
                top: `${item.startY}px`,
                "--fly-x": `${item.flyX}px`,
                "--fly-y": `${item.flyY}px`,
                animation: "flyToCart 600ms var(--ease) forwards",
                willChange: "transform, opacity",
              } as React.CSSProperties
            }
          >
            +1
          </div>
        ))}

        {/* ── Open Menu Drawer ─────────────────────────────────────────────── */}
        {menuOpen && (
          <div className="w-full bg-white border-t-2 border-black flex flex-col z-40">
            {/* Link 1: NUESTRO LOCAL */}
            <Link
              href="#locations"
              onClick={() => setMenuOpen(false)}
              className="w-full py-4 sm:py-5 px-6 sm:px-8 border-b-2 border-black font-heading font-black text-xl sm:text-2xl uppercase tracking-wider text-black hover:bg-[#FAF9F5] hover:pl-8 sm:hover:pl-10 transition-all block"
            >
              NUESTRO LOCAL
            </Link>

            {/* Link 2: PEDIR ONLINE */}
            <a
              href="https://wa.me/584149813390?text=Hola%2C%20quiero%20hacer%20un%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="w-full py-4 sm:py-5 px-6 sm:px-8 border-b-2 border-black font-heading font-black text-xl sm:text-2xl uppercase tracking-wider text-black hover:bg-[#FAF9F5] hover:pl-8 sm:hover:pl-10 transition-all block"
            >
              PEDIR ONLINE
            </a>

            {/* Link 3: RESERVAS */}
            <Link
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="w-full py-4 sm:py-5 px-6 sm:px-8 border-b-2 border-black font-heading font-black text-xl sm:text-2xl uppercase tracking-wider text-black hover:bg-[#FAF9F5] hover:pl-8 sm:hover:pl-10 transition-all block"
            >
              RESERVAS
            </Link>

            {/* Link 4: EVENTOS / PEDIDOS */}
            <Link
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="w-full py-4 sm:py-5 px-6 sm:px-8 border-b-2 border-black font-heading font-black text-xl sm:text-2xl uppercase tracking-wider text-black hover:bg-[#FAF9F5] hover:pl-8 sm:hover:pl-10 transition-all block"
            >
              EVENTOS Y PEDIDOS
            </Link>

            {/* 2-Column Color Split Row */}
            <div className="w-full grid grid-cols-2 border-b-2 border-black">
              <a
                href="tel:+584149813390"
                className="bg-[#843CB5] hover:bg-[#7633a3] text-white border-r-2 border-black py-4 sm:py-6 px-4 flex items-center justify-center text-center font-heading font-black text-lg sm:text-2xl uppercase tracking-wider transition-colors"
              >
                LLÁMANOS
              </a>
              <a
                href="https://wa.me/584149813390?text=Hola%2C%20quiero%20hacer%20un%20pedido"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0057B7] hover:bg-[#004ca0] text-white py-4 sm:py-6 px-4 flex items-center justify-center text-center font-heading font-black text-lg sm:text-2xl uppercase tracking-wider transition-colors"
              >
                WHATSAPP
              </a>
            </div>

            {/* Bottom Green Strip */}
            <div className="w-full bg-[#00A859] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="#menu"
                onClick={() => setMenuOpen(false)}
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-black font-sans font-bold text-sm sm:text-base px-6 py-2.5 rounded-full border-2 border-black hover:bg-black hover:text-white transition-colors shadow-sm"
              >
                Descargar menú
              </Link>
              <Link
                href="#locations"
                onClick={() => setMenuOpen(false)}
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-black font-sans font-bold text-sm sm:text-base px-6 py-2.5 rounded-full border-2 border-black hover:bg-black hover:text-white transition-colors shadow-sm"
              >
                Cómo llegar
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Split Hero Section ─────────────────────────────────────────────── */}
      <div className="w-full bg-black text-white flex flex-col">
        <section className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-80px)]">
          {/* Left Column: Burger Image */}
          <div className="relative bg-black min-h-[460px] sm:min-h-[520px] lg:min-h-full w-full flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
            <img
              src="/media/burger-hero.jpg"
              alt="Hamburguesa artesanal en El Tigre"
              className="w-full h-full object-cover select-none"
            />
          </div>

          {/* Right Column: Poster-Style Typography */}
          <div className="relative bg-[#EFECE6] text-black flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-10 xl:p-14 overflow-hidden select-none min-h-[520px] lg:min-h-full">
            {/* Decorative Sticker */}
            <div className="absolute top-6 right-6 sm:top-8 sm:right-8 lg:top-8 lg:right-10 z-10 pointer-events-none">
              <div className="w-18 h-18 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-full bg-[#0a0a0a] border-2 border-[#E31B23] -rotate-[16deg] shadow-xl flex flex-col items-center justify-center text-center p-2">
                <span className="font-heading font-black text-[#E31B23] text-lg sm:text-2xl md:text-3xl leading-none tracking-tight">
                  SABOR
                </span>
                <span className="font-sans font-bold text-[#E31B23] text-[8px] sm:text-[9px] tracking-[0.25em] uppercase mt-0.5">
                  BRUTAL
                </span>
              </div>
            </div>

            <div className="w-full max-w-3xl py-6 sm:py-8">
              {/* Small Badge */}
              <div
                style={
                  isRevealed
                    ? { animation: "heroFadeRise 500ms var(--ease) 0ms both" }
                    : { opacity: 0 }
                }
                className="inline-flex items-center gap-2 bg-[#E31B23] text-white text-[11px] sm:text-xs font-black uppercase tracking-[0.18em] px-4 py-1.5 rounded-full shadow-sm mb-5 sm:mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Abierto todos los días</span>
              </div>

              {/* Giant Heading */}
              <h1 className="font-heading font-black uppercase tracking-[-0.035em] text-[clamp(3.6rem,8.2vw,8.8rem)] xl:text-[9.5rem] 2xl:text-[11.6rem] leading-[0.80] sm:leading-[0.78] text-black select-none">
                <span
                  style={
                    isRevealed
                      ? { animation: "heroFadeRise 500ms var(--ease) 80ms both" }
                      : { opacity: 0 }
                  }
                  className="block text-black"
                >
                  ¡El sabor que manda
                </span>
                <span
                  style={
                    isRevealed
                      ? { animation: "heroFadeRise 500ms var(--ease) 160ms both" }
                      : { opacity: 0 }
                  }
                  className="block text-black"
                >
                  en <span className="text-[#E31B23]">El Tigre!</span>
                </span>
              </h1>

              {/* Description */}
              <p className="font-sans text-[#444444] text-sm sm:text-base leading-relaxed max-w-xl font-normal mt-5 sm:mt-6">
                Hamburguesas, perros calientes, pizzas, papas locas, parrillas y postres. Un menú enorme y dos ambientes para disfrutarlo.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-7 sm:mt-8">
                <a
                  href="https://wa.me/584149813390?text=Hola%2C%20quiero%20hacer%20un%20pedido"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 bg-[#E31B23] hover:bg-[#c8141c] text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.16em] px-7 py-3.5 rounded-full transition-all duration-200 hover:scale-[1.02] shadow-sm min-h-[48px]"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.77.828 2.791.828 3.18 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm9.969 5.766c0 5.518-4.482 10-10 10-1.741 0-3.376-.452-4.805-1.241l-5.195 1.36 1.385-5.059c-.879-1.487-1.385-3.217-1.385-5.06 0-5.518 4.482-10 10-10 5.518 0 10 4.482 10 10z" />
                  </svg>
                  <span>Pedir Online</span>
                </a>

                <Link
                  href="#menu"
                  className="inline-flex items-center justify-center border-2 border-black text-black hover:bg-black hover:text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.16em] px-7 py-3.5 rounded-full transition-all duration-200 hover:scale-[1.02] min-h-[48px]"
                >
                  Ver menú
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default BurgerHero;
