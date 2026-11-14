"use client";

import { useEffect } from "react";

export function ScrollRevealInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Fallback: If IntersectionObserver is not supported or user prefers reduced motion, exit early.
    // Content remains completely visible with no animation.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      return;
    }

    // Add hidden start state only after JS executes successfully
    document.documentElement.classList.add("js-reveal");

    const sections = document.querySelectorAll<HTMLElement>(".reveal-section");

    // Stagger children within each section: 70ms delay each, up to 6 steps (0ms to 350ms)
    sections.forEach((section) => {
      const items = section.querySelectorAll<HTMLElement>(".reveal-item");
      items.forEach((item, index) => {
        const step = Math.min(index, 5);
        item.style.transitionDelay = `${step * 70}ms`;
      });
    });

    // Single IntersectionObserver: threshold 0.15, rootMargin "0px 0px -8% 0px"
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
