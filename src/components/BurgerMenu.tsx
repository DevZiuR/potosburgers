"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BurgerCartDrawer, CartItem } from "./BurgerCartDrawer";
import {
  playAddSound,
  playTickSound,
  getIsMuted,
  toggleMute,
  subscribeMuteChange,
} from "@/utils/soundEffects";
import {
  setCartCount,
  subscribeCartDrawer,
  closeCartDrawer,
  triggerCartBump,
  triggerFlyItem,
  getStoredCartItems,
  setStoredCartItems,
} from "@/utils/cartStore";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
}

interface DrinkItem {
  name: string;
  price: string;
}

const categories = [
  "Hamburguesas",
  "Perros calientes",
  "Pizzas",
  "Papas locas",
  "Parrillas",
  "Almuerzos",
  "Postres",
] as const;

type Category = (typeof categories)[number];

const categoryIcons: Record<Category, string> = {
  Hamburguesas: "/media/icons/01-smash-burger.png",
  "Perros calientes": "/media/icons/02-hot-dog.png",
  Pizzas: "/media/icons/03-pizza-slice.png",
  "Papas locas": "/media/icons/04-loaded-fries.png",
  Parrillas: "/media/icons/05-grilled-skewer.png",
  Almuerzos: "/media/icons/08-flame.png",
  Postres: "/media/icons/07-ice-cream.png",
};

const menuByCategory: Record<Category, MenuItem[]> = {
  Hamburguesas: [
    {
      id: "h-clasica",
      name: "Hamburguesa Clásica",
      description:
        "Hamburguesa hecha para disfrutarla sin culpa",
      price: "$6",
      image: "/media/burger1.jpg",
    },
    {
      id: "h-chicken-spicy-sweet",
      name: "CHICKEN SPICY-SWEET",
      description:
        "Una explosión de sabor que te hará volver por más.",
      price: "$8.50",
      image: "/media/buruger2.jpg",
    },
    {
      id: "h-poto-extrema",
      name: "POTO EXTREMA!",
      description:
        "No es una hamburguesa… es un verdadero desafío para los amantes del sabor.",
      price: "$11.00",
      image: "/media/burger3.jpg",
    },
  ],
  "Perros calientes": [
    {
      id: "p-clasico",
      name: "Perro caliente clásico",
      description:
        "Salchicha de primera calidad, cebollita fresca, papitas crujientes, queso rallado y trío de salsas.",
      price: "$4.50",
      image:
        "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "p-queso",
      name: "Perro especial con queso",
      description:
        "Salchicha premium, generosa capa de queso fundido, tocineta crujiente picadita y lluvia de papitas.",
      price: "$6.00",
      image:
        "https://images.unsplash.com/photo-1627054234050-482a6a241ba2?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "p-mixto",
      name: "Perro mixto",
      description:
        "Salchicha y carne desmechada sazonada a fuego lento, queso amarillo, vegetales y aderezo de la casa.",
      price: "$7.50",
      image:
        "https://images.unsplash.com/photo-1541214113241-21578d2d9b62?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "p-potos",
      name: "Perro Poto's full equipo",
      description:
        "Doble salchicha, tocineta, queso blanco llanero rallado, jamón ahumado, maíz dulce y salsa tártara.",
      price: "$9.00",
      image:
        "https://images.unsplash.com/photo-1627054234050-482a6a241ba2?auto=format&fit=crop&w=900&q=85",
    },
  ],
  Pizzas: [
    {
      id: "pz-margarita",
      name: "Pizza Margarita",
      description:
        "Masa artesanal crujiente, salsa de tomate casera con albahaca fresca y abundante queso mozzarella fundido.",
      price: "$12",
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "pz-pepperoni",
      name: "Pizza Pepperoni",
      description:
        "Salsa marinara de la casa, abundante mozzarella derretida y generosas rodajas de pepperoni dorado.",
      price: "$14",
      image:
        "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "pz-cuatro-estaciones",
      name: "Pizza Cuatro Estaciones",
      description:
        "Combinación balanceada de jamón, champiñones frescos, pimientos asados, aceitunas y mozzarella.",
      price: "$16",
      image:
        "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "pz-potos",
      name: "Pizza Especial Poto's",
      description:
        "Base crujiente con tocineta ahumada, carne molida sazonada, maíz tierno, salsa BBQ y doble queso.",
      price: "$18",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85",
    },
  ],
  "Papas locas": [
    {
      id: "pp-clasicas",
      name: "Papas locas clásicas",
      description:
        "Papas fritas crocantes bañadas en queso cheddar fundido, tocineta crujiente picada y cebollín fresco.",
      price: "$7.00",
      image:
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "pp-pollo",
      name: "Papas con pollo crispy",
      description:
        "Cama de papas doradas cubiertas de jugoso pollo crispy en trozos, salsa tártara casera y queso blanco.",
      price: "$9.50",
      image:
        "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "pp-mixtas",
      name: "Papas mixtas",
      description:
        "Papas fritas con deliciosa carne desmechada, queso fundido, tocineta, maíz dulce y salsa rosada.",
      price: "$11.00",
      image:
        "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "pp-potos",
      name: "Papas Poto's supremas",
      description:
        "Porción gigante para compartir con pollo crispy, carne, queso cheddar, salsa tártara y tocineta full.",
      price: "$13.50",
      image:
        "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=900&q=85",
    },
  ],
  Parrillas: [
    {
      id: "pr-tradicional",
      name: "Parrilla tradicional",
      description:
        "Jugosos cortes de solomo de cuerito a la brasa servidos con papas fritas doradas y ensalada criolla fresca.",
      price: "$15",
      image:
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "pr-mixta",
      name: "Parrilla mixta personal",
      description:
        "Carne de res tierna, pechuga de pollo a la plancha y chorizo parrillero con tostones y guasacaca.",
      price: "$18",
      image:
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "pr-dos",
      name: "Parrilla para dos",
      description:
        "Abundante porción de carne, pollo marinado, chorizo, chinchurria crocante, yuca frita y queso llanero.",
      price: "$28",
      image:
        "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "pr-potos",
      name: "Parrilla especial Poto's",
      description:
        "Selección premium de cortes a la parrilla, chuleta de cerdo, queso frito, tostones con queso y aderezos.",
      price: "$32",
      image:
        "https://images.unsplash.com/photo-1508615263227-c5d58c1e5821?auto=format&fit=crop&w=900&q=85",
    },
  ],
  Almuerzos: [
    {
      id: "al-criollo",
      name: "Almuerzo ejecutivo criollo",
      description:
        "Carne mechada sazonada con sazón llanero, arroz blanco suelto, caraotas negras, tajadas y queso blanco.",
      price: "$8.50",
      image:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "al-pollo",
      name: "Pollo a la plancha con contornos",
      description:
        "Filete de pechuga marinada en finas hierbas con papas fritas crujientes, arroz y ensalada fresca rallada.",
      price: "$9.00",
      image:
        "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "al-churrasco",
      name: "Churrasco de solomo",
      description:
        "Corte de solomo tierno a la plancha con yuca frita dorada, ensalada mixta y auténtica guasacaca criolla.",
      price: "$12.00",
      image:
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "al-milanesa",
      name: "Milanesa de pollo gratinada",
      description:
        "Pechuga empanizada crujiente con salsa de tomate napolitana, jamón y queso mozzarella fundido.",
      price: "$10.50",
      image:
        "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=900&q=85",
    },
  ],
  Postres: [
    {
      id: "po-tres-leches",
      name: "Tres Leches tradicional",
      description:
        "Bizcocho suave y esponjoso humedecido con mezcla de tres leches y canela, decorado con merengue suave.",
      price: "$4.50",
      image:
        "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "po-marquesa",
      name: "Marquesa de chocolate",
      description:
        "Capas de galleta dulce y suave crema de chocolate artesanal oscuro elaborada en nuestra cocina.",
      price: "$5.00",
      image:
        "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "po-quesillo",
      name: "Quesillo casero",
      description:
        "El postre insignia venezolano, cremoso, con sutil toque de vainilla y abundante caramelo dorado.",
      price: "$4.00",
      image:
        "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "po-brownie",
      name: "Brownie con helado",
      description:
        "Brownie de chocolate fudge tibio servido con cremosa bola de helado de mantecado y sirope de chocolate.",
      price: "$6.00",
      image:
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85",
    },
  ],
};

// Venezuelan Drinks List (8 items split into 2 columns) with original prices restored
const leftDrinks: DrinkItem[] = [
  { name: "COCA-COLA", price: "$2.50" },
  { name: "PEPSI", price: "$2.50" },
  { name: "FRESCOLITA", price: "$2.50" },
  { name: "CHINOTTO", price: "$2.50" },
];

const rightDrinks: DrinkItem[] = [
  { name: "MALTA POLAR", price: "$2.50" },
  { name: "AGUA MINERAL", price: "$1.50" },
  { name: "CERVEZA POLAR PILSEN", price: "$3.50" },
  { name: "POLAR LIGHT", price: "$3.50" },
];

const categoryBannerText: Record<Category, string> = {
  Hamburguesas: "BURGERS",
  "Perros calientes": "PERROS CALIENTES",
  Pizzas: "PIZZAS",
  "Papas locas": "PAPAS LOCAS",
  Parrillas: "PARRILLAS",
  Almuerzos: "ALMUERZOS",
  Postres: "POSTRES",
};

// Helper to parse price string like "$14" or "$4.50" into number
function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

interface MenuAddButtonProps {
  item: {
    id: string;
    name: string;
    price: string;
    image?: string;
  };
  quantity: number;
  onAdd: (
    item: { id: string; name: string; price: string; image?: string },
    e?: React.MouseEvent
  ) => void;
  onUpdateQty: (id: string, delta: number) => void;
}

function MenuAddButton({
  item,
  quantity,
  onAdd,
  onUpdateQty,
}: MenuAddButtonProps) {
  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={(e) => onAdd(item, e)}
        aria-label={`Agregar ${item.name} al carrito`}
        title={`Agregar ${item.name} al carrito`}
        className="w-[44px] h-[44px] md:w-[40px] md:h-[40px] rounded-full bg-[#FF5500] hover:bg-[#E04B00] text-white flex items-center justify-center shrink-0 border border-black shadow-xs active:scale-90 transition-transform duration-[180ms] ease-out cursor-pointer"
      >
        <svg
          className="w-5 h-5 md:w-4.5 md:h-4.5 text-white pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.6}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    );
  }

  return (
    <div
      className="h-[44px] md:h-[40px] rounded-full bg-[#FF5500] text-white flex items-center justify-between px-1.5 border border-black shadow-xs shrink-0 select-none"
      role="group"
      aria-label={`Cantidad de ${item.name}`}
    >
      <button
        type="button"
        onClick={() => onUpdateQty(item.id, -1)}
        aria-label={`Quitar uno de ${item.name}`}
        title={`Quitar uno de ${item.name}`}
        className="w-8 h-8 md:w-7 md:h-7 rounded-full flex items-center justify-center hover:bg-black/20 text-white active:scale-90 transition-transform duration-[180ms] ease-out cursor-pointer"
      >
        <svg
          className="w-4 h-4 md:w-3.5 md:h-3.5 text-white pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.6}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
        </svg>
      </button>

      <span
        className="font-heading font-black text-lg md:text-xl text-white px-2 min-w-[20px] text-center leading-none"
        aria-live="polite"
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={(e) => onAdd(item, e)}
        aria-label={`Agregar otro ${item.name} al carrito`}
        title={`Agregar otro ${item.name} al carrito`}
        className="w-8 h-8 md:w-7 md:h-7 rounded-full flex items-center justify-center hover:bg-black/20 text-white active:scale-90 transition-transform duration-[180ms] ease-out cursor-pointer"
      >
        <svg
          className="w-4 h-4 md:w-3.5 md:h-3.5 text-white pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.6}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  );
}

export function BurgerMenu() {
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("Hamburguesas");

  // Track cards revealed via IntersectionObserver (once, 450ms, 60ms stagger)
  const [visibleCardIds, setVisibleCardIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-card-id");
            if (id) {
              setVisibleCardIds((prev) => {
                const next = new Set(prev);
                next.add(id);
                return next;
              });
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll("[data-card-id]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [selectedCategory]);

  // Persistent cart state shared across pages
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const stored = getStoredCartItems();
    if (stored.length > 0) {
      setCartItems(stored);
    }
  }, []);

  // In-memory sound mute state (JS variable only, no localStorage)
  const [isMuted, setIsMutedState] = useState(getIsMuted());

  useEffect(() => {
    return subscribeMuteChange((muted) => setIsMutedState(muted));
  }, []);

  // Publish cart count & items to shared store whenever cartItems changes
  useEffect(() => {
    setStoredCartItems(cartItems);
  }, [cartItems]);

  // Subscribe to external drawer open requests (e.g. from header cart button)
  useEffect(() => {
    return subscribeCartDrawer((open) => setIsCartOpen(open));
  }, []);

  const handleToggleMute = () => {
    const next = toggleMute();
    setIsMutedState(next);
  };

  const currentItems = (menuByCategory[selectedCategory] || []).slice(0, 3);

  // Cart operations
  const handleAddToCart = (
    item: {
      id: string;
      name: string;
      price: string;
      image?: string;
    },
    e?: React.MouseEvent
  ) => {
    playAddSound();
    triggerCartBump();

    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      triggerFlyItem({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        name: item.name,
      });
    }

    const numericPrice = parsePrice(item.price);
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: numericPrice,
          priceDisplay: item.price,
          quantity: 1,
          image: item.image,
        },
      ];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    if (delta < 0) {
      playTickSound();
    }
    setCartItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter((i): i is CartItem => i !== null)
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalUSD = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <section
      id="menu"
      className="relative w-full bg-white text-black border-t-2 border-b-2 border-black select-none pb-[96px]"
    >
      {/* ── Section Title Banner & Category Tabs (Scroll Reveal) ────────── */}
      <div className="reveal-section w-full">
        <div className="reveal-item w-full bg-[#EFECE6] py-4 sm:py-5 md:py-6 px-6 sm:px-10 lg:px-14 flex items-center justify-center">
          <h2 className="font-heading font-black text-[clamp(3rem,7.5vw,7.8rem)] xl:text-[8.5rem] 2xl:text-[9.5rem] tracking-tight uppercase text-black leading-[0.86] text-center">
            NUESTRO MENÚ
          </h2>
        </div>

        {/* ── Category Tabs Bar ────────────────────────────────────────────── */}
        <div className="reveal-item w-full bg-[#FAF9F5] border-b-2 border-black px-4 sm:px-8 lg:px-14 py-3.5 sm:py-4 overflow-x-auto scrollbar-none flex items-center gap-2 sm:gap-3">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full font-heading font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 border-2 border-black cursor-pointer select-none ${isActive
                  ? "bg-[#FF5500] text-white shadow-[2px_2px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                  : "bg-white text-black hover:bg-neutral-100"
                  }`}
              >
                <Image
                  src={categoryIcons[category]}
                  alt=""
                  width={48}
                  height={48}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0"
                />
                <span>{category}</span>
              </button>
            );
          })}

          {/* Bebidas Tab Shortcut */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("bebidas");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="shrink-0 inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full font-heading font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 border-2 border-black cursor-pointer select-none bg-white text-black hover:bg-neutral-100"
          >
            <Image
              src="/media/icons/06-soda-cup.png"
              alt=""
              width={48}
              height={48}
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0"
            />
            <span>Bebidas</span>
          </button>
        </div>
      </div>

      {/* ── RED MARQUEE BANNER (MATCHES ACTIVE TAB) ── */}
      <div className="w-full bg-[#E31B23] border-b-2 border-black py-2.5 sm:py-3 overflow-hidden">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              className="flex items-center gap-8 text-white font-heading font-black text-2xl sm:text-3xl lg:text-4xl tracking-wider uppercase select-none"
            >
              <span>{categoryBannerText[selectedCategory]}</span>
              <span>*</span>
              <span>{categoryBannerText[selectedCategory]}</span>
              <span>*</span>
              <span>{categoryBannerText[selectedCategory]}</span>
              <span>*</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Brutalist 3-Column Menu Grid (Matches Reference Image) ── */}
      <div className="w-full grid items-stretch grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {currentItems.map((item, idx) => {
          const isVisible = visibleCardIds.has(item.id);
          const staggerDelay = (idx % 3) * 60; // 60ms stagger within a row

          return (
            <div
              key={item.id}
              data-card-id={item.id}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 450ms var(--ease) ${staggerDelay}ms, transform 450ms var(--ease) ${staggerDelay}ms, box-shadow 250ms var(--ease)`,
                willChange: isVisible ? "auto" : "transform, opacity",
              }}
              className="flex flex-col justify-between bg-white border-b-2 border-black md:border-r-2 hover:md:-translate-y-1 hover:md:shadow-xl hover:md:z-10 transition-transform duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] h-full"
            >
              {/* 1. Item Photo */}
              <div className="relative w-full aspect-[4/3] sm:aspect-square md:aspect-[4/3] bg-black overflow-hidden border-b-2 border-black group shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover select-none group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* 2. Title & Description Block */}
              <div className="flex-1 p-6 sm:p-7 text-center flex flex-col justify-center min-h-[140px] bg-white">
                <h3 className="font-heading font-black text-3xl sm:text-4xl lg:text-[2.6rem] uppercase tracking-wider text-black mb-2 leading-none">
                  {item.name}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#666] leading-relaxed max-w-sm mx-auto font-normal">
                  {item.description}
                </p>
              </div>

              {/* 3. Solid Red Price & Add Bar */}
              <div className="w-full bg-[#E31B23] py-3 sm:py-3.5 px-5 sm:px-6 flex items-center justify-between mt-auto shrink-0">
                <span className="font-heading font-black text-3xl sm:text-4xl tracking-tight leading-none text-white select-none">
                  {item.price}
                </span>

                <MenuAddButton
                  item={{
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                  }}
                  quantity={cartItems.find((ci) => ci.id === item.id)?.quantity || 0}
                  onAdd={handleAddToCart}
                  onUpdateQty={handleUpdateQuantity}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BEBIDAS BANNER ── */}
      <div id="bebidas" className="w-full bg-[#0a0a0a] border-b-2 border-black py-3 sm:py-3.5 overflow-hidden">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              className="flex items-center gap-8 text-white font-heading font-black text-2xl sm:text-3xl lg:text-4xl tracking-wider uppercase select-none"
            >
              <span>BEBIDAS</span>
              <span className="text-[#FF5500]">*</span>
              <span>BEBIDAS</span>
              <span className="text-[#FF5500]">*</span>
              <span>BEBIDAS</span>
              <span className="text-[#FF5500]">*</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Venezuelan Drinks 2-Column Table ──────────────────────────────── */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 bg-white">
        {/* Column 1 */}
        <div className="flex flex-col md:border-r-2 border-black">
          {leftDrinks.map((drink, idx) => (
            <div
              key={idx}
              className="flex items-stretch border-b-2 border-black group"
            >
              {/* Drink Name */}
              <div className="flex-1 bg-white px-5 sm:px-8 py-4 sm:py-5 flex items-center border-r-2 border-black">
                <span className="font-heading font-black text-lg sm:text-2xl tracking-wide uppercase text-black">
                  {drink.name}
                </span>
              </div>

              {/* Price & Add to Cart Button */}
              <div className="w-36 sm:w-52 bg-[#141416] text-white px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
                <span className="font-heading font-black text-base sm:text-xl tracking-tight leading-none text-white select-none">
                  {drink.price}
                </span>

                <MenuAddButton
                  item={{
                    id: `drink-${idx}`,
                    name: drink.name,
                    price: drink.price,
                  }}
                  quantity={cartItems.find((ci) => ci.id === `drink-${idx}`)?.quantity || 0}
                  onAdd={handleAddToCart}
                  onUpdateQty={handleUpdateQuantity}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Column 2 */}
        <div className="flex flex-col">
          {rightDrinks.map((drink, idx) => (
            <div
              key={idx}
              className="flex items-stretch border-b-2 border-black group"
            >
              {/* Drink Name */}
              <div className="flex-1 bg-white px-5 sm:px-8 py-4 sm:py-5 flex items-center border-r-2 border-black">
                <span className="font-heading font-black text-lg sm:text-2xl tracking-wide uppercase text-black">
                  {drink.name}
                </span>
              </div>

              {/* Price & Add to Cart Button */}
              <div className="w-36 sm:w-52 bg-[#141416] text-white px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
                <span className="font-heading font-black text-base sm:text-xl tracking-tight leading-none text-white select-none">
                  {drink.price}
                </span>

                <MenuAddButton
                  item={{
                    id: `drink-right-${idx}`,
                    name: drink.name,
                    price: drink.price,
                  }}
                  quantity={cartItems.find((ci) => ci.id === `drink-right-${idx}`)?.quantity || 0}
                  onAdd={handleAddToCart}
                  onUpdateQty={handleUpdateQuantity}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Floating Cart Button (Bottom-Left as requested) ────────────────── */}
      {totalCount > 0 && (
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          aria-label="Abrir carrito de compras"
          className="fixed bottom-10 left-4 min-[1200px]:bottom-6 min-[1200px]:left-6 z-40 flex items-center gap-3 bg-[#141416] hover:bg-[#202024] text-white border-2 border-[#FF5500] px-4 sm:px-5 py-3 rounded-full shadow-[0_8px_30px_rgba(255,85,0,0.35)] transition-transform duration-[180ms] active:scale-95 cursor-pointer group animate-floating-pill-slide-up"
        >
          <div className="relative">
            <svg
              className="w-6 h-6 text-[#FF5500]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="absolute -top-2.5 -right-2.5 bg-[#FF5500] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-black animate-badge-pop">
              {totalCount}
            </span>
          </div>

          <div className="flex flex-col text-left pr-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 leading-none">
              CARRITO
            </span>
            <span className="text-sm font-black text-white leading-tight font-heading">
              ${totalUSD.toFixed(2)}
            </span>
          </div>
        </button>
      )}

      {/* ── Bottom-Right Floating Sticky WhatsApp Button ── */}
      <a
        href="https://wa.me/584149813390?text=Hola%2C%20quiero%20hacer%20un%20pedido"
        target="_blank"
        rel="noopener noreferrer"
        title="Escribir a Poto's por WhatsApp"
        aria-label="Hablar por WhatsApp"
        className="fixed bottom-10 right-4 min-[1200px]:bottom-6 min-[1200px]:right-6 z-40 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer drop-shadow-[0_8px_20px_rgba(37,211,102,0.45)] group"
      >
        <img
          src="https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/960px-WhatsApp.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail"
          alt="WhatsApp"
          className="w-full h-full object-contain filter group-hover:brightness-105 select-none"
        />
      </a>

      {/* ── Side Cart & Checkout Drawer Component ─────────────────────────── */}
      <BurgerCartDrawer
        isOpen={isCartOpen}
        onClose={() => { setIsCartOpen(false); closeCartDrawer(); }}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </section>
  );
}

export default BurgerMenu;