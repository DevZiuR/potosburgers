"use client";

import React, { useState } from "react";

interface Location {
  id: string;
  name: string;
  address: string;
  hours?: string;
  image: string;
  phone?: string;
  mapsUrl?: string;
}

const locations: Location[] = [
  {
    id: "el-tigre",
    name: "EL TIGRE",
    address: "Centro Comercial Z&T, 4ta Carrera Sur, El Tigre 6050, Anzoátegui",
    hours: "Lun a Dom: 11:30 AM – 11:55 PM",
    phone: "+58 414-9813390",
    image: "/media/local.png",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Poto%27s+Burgers+Centro+Comercial+Z%26T+El+Tigre",
  },
  {
    id: "lecheria",
    name: "LECHERÍA (PRONTO)",
    address: "Próximamente en Lechería, Anzoátegui",
    hours: "Apertura muy pronto",
    phone: "+58 414-9813390",
    image:
      "https://images.unsplash.com/photo-155539627f3-367ea4eb4db5?auto=format&fit=crop&w=1600&q=85",
    mapsUrl: "https://maps.google.com/?q=Lecheria+Anzoategui+Venezuela",
  },
];

export function BurgerLocations() {
  const [selectedLocation, setSelectedLocation] = useState<Location>(locations[0]);

  return (
    <section id="locations" className="reveal-section w-full bg-[#EFECE6] text-black">
      {/* ── Section Content ──────────────────────────────────────────────── */}
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12">
        {/* Section Heading & Location Pills */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
          <h2 className="reveal-item font-heading font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[-0.03em] uppercase text-black leading-none select-none">
            ENCUÉNTRANOS
          </h2>

          {/* Location Selector Tabs */}
          <div className="reveal-item flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {locations.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedLocation(loc)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.14em] transition-all whitespace-nowrap select-none cursor-pointer ${selectedLocation.id === loc.id
                  ? "bg-[#E31B23] text-white shadow-sm"
                  : "bg-white text-black/80 hover:text-black border-2 border-black"
                  }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Storefront Card */}
        <div className="reveal-item w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border-2 border-black bg-black flex flex-col">
          {/* Storefront Photography */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[2.4/1] bg-black overflow-hidden">
            <img
              src={selectedLocation.image}
              alt={`${selectedLocation.name} storefront`}
              className="w-full h-full object-cover select-none transition-all duration-700 hover:scale-[1.02]"
            />
            {/* Subtle atmospheric vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Badge for Pronto */}
            {selectedLocation.id === "lecheria" && (
              <div className="absolute top-4 left-4 z-10 bg-[#E31B23] text-white font-sans text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md">
                PRÓXIMAMENTE
              </div>
            )}
          </div>

          {/* Bottom Black Info Bar */}
          <div className="reveal-item bg-black text-white px-6 sm:px-8 md:px-10 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t-2 border-white/10 select-none">
            <div>
              <h3 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-white uppercase leading-none mb-2">
                {selectedLocation.name}
              </h3>
              <p className="font-sans text-neutral-300 text-xs sm:text-sm font-medium tracking-wide">
                <span>{selectedLocation.address}</span>
                <span className="mx-2 text-neutral-500">·</span>
                <span className="text-[#E31B23] font-bold">{selectedLocation.hours}</span>
              </p>
            </div>

            <a
              href={
                selectedLocation.mapsUrl ||
                `https://maps.google.com/?q=${encodeURIComponent(
                  `${selectedLocation.name} ${selectedLocation.address}`
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#E31B23] hover:bg-[#c8141c] text-white text-xs font-bold uppercase tracking-[0.16em] transition-all w-fit shadow-sm"
            >
              <span>CÓMO LLEGAR</span>
              <span className="text-sm font-bold leading-none">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BurgerLocations;
