"use client";

import React, { useState, useEffect } from "react";
import { BurgerPreloader } from "@/components/BurgerPreloader";
import { BurgerHero } from "@/components/BurgerHero";
import { BurgerTicker } from "@/components/BurgerTicker";
import { BurgerMenu } from "@/components/BurgerMenu";
import { BurgerStory } from "@/components/BurgerStory";
import { BurgerStatement } from "@/components/BurgerStatement";
import { BurgerLocations } from "@/components/BurgerLocations";
import { BurgerGallery } from "@/components/BurgerGallery";
import { BurgerFaq } from "@/components/BurgerFaq";
import { BurgerReviews } from "@/components/BurgerReviews";
import { BurgerContact } from "@/components/BurgerContact";
import { BurgerFooter } from "@/components/BurgerFooter";
import { BurgerOwnerDashboard } from "@/components/BurgerOwnerDashboard";
import { BurgerCheckoutPage } from "@/components/BurgerCheckoutPage";

export default function Home() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isCheckoutRoute, setIsCheckoutRoute] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      setIsAdminRoute(hash === "#/admin" || hash === "#admin");
      setIsCheckoutRoute(hash === "#/checkout" || hash === "#checkout");
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleBackToStore = () => {
    window.location.hash = "";
    setIsAdminRoute(false);
    setIsCheckoutRoute(false);
  };

  if (isAdminRoute) {
    return <BurgerOwnerDashboard onBackToStore={handleBackToStore} />;
  }

  if (isCheckoutRoute) {
    return <BurgerCheckoutPage />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Intro Preloader Screen ──────────────────────────────────────── */}
      <BurgerPreloader />

      {/* ── 1. Hero with Navbar ─────────────────────────────────────────── */}
      <BurgerHero />

      {/* ── 2. Spanish Burger Ticker & Retro Checkerboard Strip ──────────── */}
      <BurgerTicker />

      {/* ── 3. Our Menu (Spanish burger names & descriptions) ───────────── */}
      <BurgerMenu />

      {/* ── 4. Our Story (We Are Burgr™ with Metrics & Smash Burger) ────── */}
      <BurgerStory />

      {/* ── 5. Full-Bleed Statement: You Can't Ignore It™ ──────────────── */}
      <BurgerStatement />

      {/* ── 6. Locations / Find Us (Storefront & Directions) ────────────── */}
      <BurgerLocations />

      {/* ── Checkerboard divider: red & white ───────────────────────────── */}
      <div
        className="w-full h-8 sm:h-10"
        style={{
          background:
            "repeating-conic-gradient(#E31B23 0% 25%, #ffffff 0% 50%) 0 0 / 32px 32px",
        }}
        aria-hidden="true"
      />

      {/* ── 7. Gallery (Masonry photos & "Nada de Platos Limpios") ──────── */}
      <BurgerGallery />

      {/* ── Checkerboard divider: red & white ───────────────────────────── */}
      <div
        className="w-full h-8 sm:h-10"
        style={{
          background:
            "repeating-conic-gradient(#E31B23 0% 25%, #ffffff 0% 50%) 0 0 / 32px 32px",
        }}
        aria-hidden="true"
      />

      {/* ── 8. FAQs Accordion (Spanish Q&A) ─────────────────────────────── */}
      <BurgerFaq />

      {/* ── 9. Google Reviews (A Google Le Encanta La Grasa) ────────────── */}
      <BurgerReviews />

      {/* ── 10. Contact The Kitchen (Contacta Con La Cocina) ────────────── */}
      <BurgerContact />

      {/* ── 11. Footer ─────────────────────────────────────────────────── */}
      <BurgerFooter />
    </div>
  );
}
