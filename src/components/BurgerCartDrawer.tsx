"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  playTickSound,
  playClickSound,
  playWhatsAppChime,
  playConfirmationChime,
} from "@/utils/soundEffects";
import { addOrder } from "@/utils/ordersStore";

// ── BCV Rate Configuration ──────────────────────────────────────────────────
// Fallback official BCV rate (Bs per 1 USD) if the public API fails or times out
export const BCV_RATE = 54.50;

export interface CartItem {
  id: string;
  name: string;
  price: number; // numeric USD price
  priceDisplay: string;
  quantity: number;
  image?: string;
}

type PaymentMethod = "efectivo" | "pago_movil" | "zelle" | "binance";
type DeliveryType = "retiro" | "delivery";

interface BurgerCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

// Format Venezuelan currency (e.g., Bs 1.234,56)
function formatBs(amount: number): string {
  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Smooth animated counter hook (interpolates smoothly over 350ms)
function useAnimatedNumber(targetValue: number, duration = 350): number {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const prevValueRef = useRef(targetValue);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const diff = targetValue - startValue;
    if (Math.abs(diff) < 0.001) {
      setDisplayValue(targetValue);
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic: 1 - Math.pow(1 - progress, 3)
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * ease;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        prevValueRef.current = targetValue;
      }
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [targetValue, duration]);

  return displayValue;
}

// Copy helper with pop animation (returns after 1.5s)
function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // 1.5s return
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copiar al portapapeles"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-800 border border-neutral-300 transition-colors cursor-pointer active:scale-95"
    >
      <span
        style={copied ? { animation: "copyPop 350ms var(--ease)" } : undefined}
        className="inline-block"
      >
        {copied ? "✓ Copiado" : label || "Copiar"}
      </span>
    </button>
  );
}

export function BurgerCartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: BurgerCartDrawerProps) {
  // ── Smooth Open / Close Animation Lifecycle ─────────────────────────────
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRendered && !isClosing) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isRendered, isClosing]);

  // Lock page scroll while drawer is open
  useEffect(() => {
    if (isRendered) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isRendered]);

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      handleClose();
      setIsRendered(false);
      setIsClosing(false);
    }, 300);
  };

  // ── Step management & Horizontal Slide Transitions ──────────────────────
  const [step, setStep] = useState<"cart" | "checkout" | "confirmed">("cart");
  const [stepDirection, setStepDirection] = useState<"forward" | "backward">("forward");

  const goToCheckout = () => {
    onClose();
    window.location.href = "/checkout";
  };

  const goToCart = () => {
    setStepDirection("backward");
    setStep("cart");
  };

  // ── Collapsing Item Removal Tracking ────────────────────────────────────
  const [collapsingIds, setCollapsingIds] = useState<Set<string>>(new Set());

  const handleInitiateRemove = (id: string) => {
    setCollapsingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      onRemoveItem(id);
      setCollapsingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  // ── Quantity Swap Animation Direction ───────────────────────────────────
  const [qtyDirection, setQtyDirection] = useState<"up" | "down">("up");

  // ── BCV Rate Fetching State ─────────────────────────────────────────────
  const [bcvRate, setBcvRate] = useState<number>(BCV_RATE);
  const [bcvDate, setBcvDate] = useState<string>("Hoy");

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then((data) => {
        if (data && typeof data.promedio === "number" && data.promedio > 0) {
          setBcvRate(data.promedio);
          if (data.fechaActualizacion) {
            try {
              const d = new Date(data.fechaActualizacion);
              setBcvDate(
                d.toLocaleDateString("es-VE", {
                  day: "2-digit",
                  month: "short",
                })
              );
            } catch {
              setBcvDate("Oficial BCV");
            }
          }
        }
      })
      .catch(() => {
        setBcvRate(BCV_RATE);
        setBcvDate("Oficial BCV");
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => clearTimeout(timeoutId);
  }, []);

  // ── Checkout Form State ─────────────────────────────────────────────────
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [entrega, setEntrega] = useState<DeliveryType>("retiro");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [metodoPago, setMetodoPago] = useState<PaymentMethod>("pago_movil");
  const [referencia, setReferencia] = useState("");
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle file preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setComprobanteFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setComprobanteFile(null);
    setPreviewUrl(null);
  };

  // ── Calculations & Animated Counters ────────────────────────────────────
  const totalUSD = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const animatedUSD = useAnimatedNumber(totalUSD, 350);
  const animatedBs = animatedUSD * bcvRate;

  // ── Validation ──────────────────────────────────────────────────────────
  const isNombreValid = nombre.trim().length > 0;
  const isTelefonoValid = telefono.trim().length > 0;
  const isDireccionValid = entrega === "retiro" || direccion.trim().length > 0;
  const isReferenciaValid =
    metodoPago === "efectivo" || referencia.trim().length >= 4;

  const isFormValid =
    items.length > 0 &&
    isNombreValid &&
    isTelefonoValid &&
    isDireccionValid &&
    isReferenciaValid;

  // ── WhatsApp Order Sender ───────────────────────────────────────────────
  const handleSendOrder = () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    const sanitize = (str: string) => str.replace(/[\r\n\t]+/g, " ").trim();

    const cleanNombre = sanitize(nombre);
    const cleanTelefono = sanitize(telefono);
    const cleanDireccion = sanitize(direccion);
    const cleanNotas = sanitize(notas);
    const cleanRef = sanitize(referencia);

    const itemsLines = items
      .map(
        (it) =>
          `• ${it.quantity}x ${it.name}: $${(it.price * it.quantity).toFixed(2)}`
      )
      .join("\n");

    const formattedBs = formatBs(totalUSD * bcvRate);
    const formattedRate = formatBs(bcvRate);

    let pagoLabel = "";
    if (metodoPago === "efectivo") {
      pagoLabel = "Efectivo (pago al recibir/retirar)";
    } else if (metodoPago === "pago_movil") {
      pagoLabel = `Pago Móvil. Referencia: ${cleanRef} (pago por verificar)`;
    } else if (metodoPago === "zelle") {
      pagoLabel = `Zelle. Referencia: ${cleanRef} (pago por verificar)`;
    } else if (metodoPago === "binance") {
      pagoLabel = `Binance USDT. Referencia: ${cleanRef} (pago por verificar)`;
    }

    const entregaLabel =
      entrega === "delivery"
        ? `Delivery. Dirección: ${cleanDireccion}`
        : "Retiro en local (CC Z&T, El Tigre)";

    const capturaLabel = comprobanteFile
      ? "Captura: la adjunto en este chat"
      : "Captura: sin captura adjunta";

    const notasLine = cleanNotas ? `\nNotas: ${cleanNotas}` : "";

    const message = `Hola, quiero hacer un pedido:
${itemsLines}
Total: $${totalUSD.toFixed(2)} (Bs ${formattedBs} a tasa BCV ${formattedRate})
Nombre: ${cleanNombre} | Teléfono: ${cleanTelefono}
Entrega: ${entregaLabel}
Pago: ${pagoLabel}
${capturaLabel}${notasLine}`;

    const waUrl = `https://wa.me/584149813390?text=${encodeURIComponent(
      message
    )}`;

    try {
      addOrder({
        customerName: cleanNombre,
        customerPhone: cleanTelefono,
        items: items
          .map((it) => `${it.quantity}x ${it.name}`)
          .join(", "),
        totalUSD: totalUSD,
        paymentMethod:
          metodoPago === "pago_movil"
            ? "Pago Móvil"
            : metodoPago === "zelle"
            ? "Zelle"
            : metodoPago === "binance"
            ? "Binance USDT"
            : "Efectivo",
        paymentReference:
          metodoPago === "efectivo"
            ? "Efectivo al recibir/retirar"
            : cleanRef,
        deliveryType: entrega === "delivery" ? "Delivery" : "Retiro en local",
        address: entrega === "delivery" ? cleanDireccion : undefined,
      });
    } catch {
      // Ignore store errors
    }

    playWhatsAppChime();

    // Short loading state (400ms) before opening WhatsApp
    setTimeout(() => {
      window.open(waUrl, "_blank", "noopener,noreferrer");

      setStep("confirmed");
      setIsSubmitting(false);

      setTimeout(() => {
        playConfirmationChime();
      }, 180);
      onClearCart();
    }, 400);
  };

  // Reset drawer state when closed or finished
  const handleClose = () => {
    if (step === "confirmed") {
      setStep("cart");
      setNombre("");
      setTelefono("");
      setDireccion("");
      setNotas("");
      setReferencia("");
      removeFile();
    }
    onClose();
  };

  if (!isRendered) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* ── Backdrop (fades from 0 to 0.55 over 300ms, reverses on close) ── */}
      <div
        onClick={triggerClose}
        style={{
          animation: isClosing
            ? "overlayFadeOut 300ms var(--ease) forwards"
            : "overlayFadeIn 300ms var(--ease) forwards",
          willChange: "opacity",
        }}
        className="absolute inset-0 bg-black backdrop-blur-xs cursor-pointer"
        aria-hidden="true"
      />

      {/* ── Slide-Over Drawer Container (slides in 420ms, out 300ms) ──────── */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <aside
          style={{
            animation: isClosing
              ? "drawerSlideOut 300ms var(--ease) forwards"
              : "drawerSlideIn 420ms var(--ease) forwards",
            willChange: "transform",
          }}
          className="w-screen max-w-md sm:max-w-lg bg-white text-black flex flex-col shadow-2xl border-l border-neutral-200"
        >
          {/* ── Top Header Bar (Trash on Left, Carrito in Center, ✕ on Right) ─ */}
          <div className="px-6 py-5 bg-white border-b border-neutral-100 flex items-center justify-between shrink-0">
            {step === "cart" ? (
              items.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onClearCart();
                  }}
                  title="Vaciar carrito"
                  aria-label="Vaciar carrito"
                  className="w-9 h-9 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-black flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                >
                  <svg
                    className="w-5 h-5 fill-none stroke-current stroke-[2]"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              ) : (
                <div className="w-9 h-9" />
              )
            ) : (
              <button
                type="button"
                onClick={goToCart}
                className="w-9 h-9 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-black flex items-center justify-center transition-colors cursor-pointer font-bold text-lg active:scale-95"
                title="Volver al carrito"
              >
                ←
              </button>
            )}

            <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 tracking-tight text-center">
              {step === "cart"
                ? "Carrito"
                : step === "checkout"
                ? "Finalizar pedido"
                : "Pedido enviado"}
            </h2>

            <button
              type="button"
              onClick={triggerClose}
              className="w-9 h-9 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-black flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              aria-label="Cerrar carrito"
            >
              <svg
                className="w-5 h-5 stroke-current stroke-[2.5]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* ── Main Drawer Content Area ────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* ══════════════════════════════════════════════════════════════════
                STEP 1: CART ITEMS LIST
               ══════════════════════════════════════════════════════════════════ */}
            {step === "cart" && (
              <div
                style={{
                  animation:
                    stepDirection === "backward"
                      ? "stepSlideInFromLeft 350ms var(--ease)"
                      : undefined,
                  willChange: "transform, opacity",
                }}
              >
                {items.length === 0 ? (
                  <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center py-12 px-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 text-[#D62300] flex items-center justify-center text-2xl mb-4">
                      🛒
                    </div>
                    <p className="font-heading font-black text-2xl uppercase tracking-wider text-neutral-900 mb-2">
                      Tu carrito está vacío
                    </p>
                    <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-xs mb-6">
                      Agrega tus hamburguesas, pizzas, o bebidas favoritas desde nuestro menú.
                    </p>
                    <button
                      type="button"
                      onClick={triggerClose}
                      className="bg-[#D62300] hover:bg-[#b81d00] text-white font-heading font-black text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-transform duration-[180ms] cursor-pointer shadow-sm active:scale-95"
                    >
                      EXPLORAR MENÚ
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item, index) => {
                      const qtyFormatted = String(item.quantity).padStart(
                        2,
                        "0"
                      );
                      const unitPrice = item.price.toFixed(2);
                      const isCollapsing = collapsingIds.has(item.id);

                      return (
                        <div
                          key={item.id}
                          style={{
                            animation: isCollapsing
                              ? "itemCollapse 300ms var(--ease) forwards"
                              : `itemFadeRise 320ms var(--ease) ${index * 50}ms both`,
                            willChange: isCollapsing
                              ? "max-height, opacity, transform"
                              : "transform, opacity",
                            overflow: isCollapsing ? "hidden" : "visible",
                          }}
                          className="flex items-center gap-4 py-2"
                        >
                          {/* Item Thumbnail on Left */}
                          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-neutral-50 overflow-hidden shrink-0 flex items-center justify-center border border-neutral-100">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-3xl">🍔</span>
                            )}
                          </div>

                          {/* Item Details on Right */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            {/* Top row: Name & Price/Qty */}
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="font-heading font-black text-lg sm:text-xl lg:text-2xl text-black uppercase tracking-tight leading-tight">
                                {item.name}
                              </h4>
                              <span className="font-heading font-black text-base sm:text-lg text-neutral-900 whitespace-nowrap shrink-0">
                                ${unitPrice} x {qtyFormatted}
                              </span>
                            </div>

                            {/* Bottom row: Red Rounded Box with Trash / Count / Plus */}
                            <div className="mt-3">
                              <div className="inline-flex items-center gap-3.5 border-2 border-[#D62300] rounded-xl px-3 py-1.5 text-[#D62300]">
                                {/* Minus / Trash Icon Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    playTickSound();
                                    if (item.quantity <= 1) {
                                      handleInitiateRemove(item.id);
                                    } else {
                                      setQtyDirection("down");
                                      onUpdateQuantity(item.id, -1);
                                    }
                                  }}
                                  aria-label="Disminuir o eliminar cantidad"
                                  className="w-6 h-6 flex items-center justify-center hover:opacity-80 transition-transform active:scale-90 cursor-pointer font-bold"
                                >
                                  {item.quantity <= 1 ? (
                                    <svg
                                      className="w-4 h-4 fill-none stroke-current stroke-2"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  ) : (
                                    <span className="text-lg leading-none font-black">−</span>
                                  )}
                                </button>

                                {/* 2-digit formatted quantity with vertical slide/fade swap */}
                                <span
                                  key={item.quantity}
                                  style={{
                                    animation: `${
                                      qtyDirection === "up" ? "qtySwapUp" : "qtySwapDown"
                                    } 150ms var(--ease)`,
                                  }}
                                  className="font-heading font-black text-base sm:text-lg text-[#D62300] min-w-6 text-center inline-block"
                                >
                                  {qtyFormatted}
                                </span>

                                {/* Plus Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    playTickSound();
                                    setQtyDirection("up");
                                    onUpdateQuantity(item.id, 1);
                                  }}
                                  aria-label="Aumentar cantidad"
                                  className="w-6 h-6 flex items-center justify-center hover:opacity-80 transition-transform active:scale-90 cursor-pointer text-lg font-black leading-none"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                STEP 2: CHECKOUT FORM & PAYMENT SELECTION
               ══════════════════════════════════════════════════════════════════ */}
            {step === "checkout" && (
              <div
                style={{
                  animation:
                    stepDirection === "forward"
                      ? "stepSlideInFromRight 350ms var(--ease)"
                      : undefined,
                  willChange: "transform, opacity",
                }}
                className="space-y-6"
              >
                {/* 1. Datos Personales */}
                <div className="space-y-3">
                  <h3 className="font-heading font-black text-xs uppercase tracking-wider text-[#D62300]">
                    1. DATOS DEL CLIENTE
                  </h3>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                        Nombre y Apellido <span className="text-[#D62300]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej. Carlos Mendoza"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-black placeholder:text-neutral-400 focus:outline-hidden focus:border-[#D62300] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                        Teléfono / WhatsApp <span className="text-[#D62300]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="Ej. 0414-1234567"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-black placeholder:text-neutral-400 focus:outline-hidden focus:border-[#D62300] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Método de Entrega */}
                <div className="space-y-3">
                  <h3 className="font-heading font-black text-xs uppercase tracking-wider text-[#D62300]">
                    2. TIPO DE ENTREGA
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEntrega("retiro")}
                      className={`p-3 rounded-xl border text-center transition-all duration-[180ms] cursor-pointer active:scale-95 ${
                        entrega === "retiro"
                          ? "bg-red-50/70 border-2 border-[#D62300] text-neutral-900 scale-[1.02]"
                          : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      <span className="block text-base mb-0.5">🏪</span>
                      <span className="font-heading font-black text-xs uppercase tracking-wider block">
                        Retiro en local
                      </span>
                      <span className="text-[10px] text-neutral-500 block mt-0.5">
                        CC Z&T, El Tigre
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEntrega("delivery")}
                      className={`p-3 rounded-xl border text-center transition-all duration-[180ms] cursor-pointer active:scale-95 ${
                        entrega === "delivery"
                          ? "bg-red-50/70 border-2 border-[#D62300] text-neutral-900 scale-[1.02]"
                          : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      <span className="block text-base mb-0.5">🛵</span>
                      <span className="font-heading font-black text-xs uppercase tracking-wider block">
                        Delivery
                      </span>
                      <span className="text-[10px] text-neutral-500 block mt-0.5">
                        A tu puerta
                      </span>
                    </button>
                  </div>

                  {entrega === "delivery" && (
                    <div className="animate-fadeIn">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                        Dirección exacta de entrega <span className="text-[#D62300]">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        placeholder="Calle, sector, número de casa/apto y punto de referencia..."
                        className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-2 text-sm text-black placeholder:text-neutral-400 focus:outline-hidden focus:border-[#D62300] transition-colors resize-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Notas especiales para la cocina o delivery (opcional)
                    </label>
                    <textarea
                      rows={2}
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="Ej. Sin cebolla, salsas aparte, billete de $20 para vuelto..."
                      className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-2 text-sm text-black placeholder:text-neutral-400 focus:outline-hidden focus:border-[#D62300] transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* 3. Selector de Método de Pago */}
                <div className="space-y-3">
                  <h3 className="font-heading font-black text-xs uppercase tracking-wider text-[#D62300]">
                    3. MÉTODO DE PAGO
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      {
                        id: "pago_movil",
                        label: "Pago Móvil",
                        logo: "https://cdn-icons-png.flaticon.com/256/3417/3417590.png",
                        badge: "Bs",
                      },
                      {
                        id: "efectivo",
                        label: "Efectivo",
                        logo: "https://cdn-icons-png.flaticon.com/512/5163/5163758.png",
                        badge: "$ / Bs",
                      },
                      {
                        id: "zelle",
                        label: "Zelle",
                        logo: "https://logos-world.net/wp-content/uploads/2021/02/Zelle-Symbol.png",
                        badge: "USD",
                      },
                      {
                        id: "binance",
                        label: "Binance USDT",
                        logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Binance-BNB-Icon-Logo.wine.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
                        badge: "USDT",
                      },
                    ].map((m) => {
                      const active = metodoPago === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setMetodoPago(m.id as PaymentMethod);
                            playClickSound();
                          }}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-transform duration-[180ms] cursor-pointer active:scale-95 ${
                            active
                              ? "bg-red-50/70 border-2 border-[#D62300] text-neutral-900 shadow-sm scale-[1.02]"
                              : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 p-1 flex items-center justify-center shrink-0 border border-neutral-200/70">
                              <img
                                src={m.logo}
                                alt={m.label}
                                className="w-full h-full object-contain"
                                loading="lazy"
                              />
                            </div>
                            <div>
                              <span className="font-heading font-black text-xs uppercase tracking-wider block text-neutral-900">
                                {m.label}
                              </span>
                              <span className="text-[10px] text-neutral-500">
                                {m.badge}
                              </span>
                            </div>
                          </div>
                          {active && (
                            <span className="text-[#D62300] font-black text-sm">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* ── Payment Info Panel (Expands with grid-template-rows 0fr -> 1fr) ── */}
                  <div
                    className="grid transition-all duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden"
                    style={{
                      gridTemplateRows: metodoPago ? "1fr" : "0fr",
                      opacity: metodoPago ? 1 : 0,
                    }}
                  >
                    <div className="min-h-0 bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-3.5">
                      {/* Demo Warning Banner */}
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold">
                        <span>⚠️</span>
                        <span>DATOS DE EJEMPLO (demo)</span>
                      </div>

                      {/* Efectivo */}
                      {metodoPago === "efectivo" && (
                        <div className="space-y-1.5 text-xs text-neutral-700">
                          <div className="flex items-center gap-2">
                            <img
                              src="https://cdn-icons-png.flaticon.com/512/5163/5163758.png"
                              alt="Efectivo"
                              className="w-5 h-5 object-contain"
                            />
                            <p className="font-bold text-neutral-900 text-sm">
                              Pagas al recibir o retirar en el local.
                            </p>
                          </div>
                          <p className="text-neutral-500 leading-relaxed">
                            Aceptamos dólares en efectivo en buen estado o bolívares en punto de venta a tasa BCV del día.
                          </p>
                        </div>
                      )}

                      {/* Zelle */}
                      {metodoPago === "zelle" && (
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                            <div className="flex items-center gap-2">
                              <img
                                src="https://logos-world.net/wp-content/uploads/2021/02/Zelle-Symbol.png"
                                alt="Zelle"
                                className="w-5 h-5 object-contain"
                              />
                              <span className="text-neutral-500">Total a transferir:</span>
                            </div>
                            <span className="font-heading font-black text-base text-[#D62300]">
                              ${totalUSD.toFixed(2)} USD
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-neutral-500 block uppercase">Titular</span>
                              <span className="text-neutral-900 font-medium">Poto&apos;s Burgers C.A.</span>
                            </div>
                            <CopyButton text="Poto's Burgers C.A." />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-neutral-500 block uppercase">Correo</span>
                              <span className="text-neutral-900 font-medium">pagos@potosburgers.com</span>
                            </div>
                            <CopyButton text="pagos@potosburgers.com" />
                          </div>
                        </div>
                      )}

                      {/* Binance USDT */}
                      {metodoPago === "binance" && (
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                            <div className="flex items-center gap-2">
                              <img
                                src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Binance-BNB-Icon-Logo.wine.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original"
                                alt="Binance USDT"
                                className="w-5 h-5 object-contain"
                              />
                              <span className="text-neutral-500">Total a transferir:</span>
                            </div>
                            <span className="font-heading font-black text-base text-[#D62300]">
                              {totalUSD.toFixed(2)} USDT
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-neutral-500 block uppercase">Binance Pay ID</span>
                              <span className="text-neutral-900 font-mono font-medium">298410293</span>
                            </div>
                            <CopyButton text="298410293" />
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-500 block uppercase">Red sugerida</span>
                            <span className="text-neutral-900 font-medium">TRC20 o BEP20</span>
                          </div>
                          <p className="text-[11px] text-amber-700 font-semibold pt-1">
                            ⚠️ Envía solo por la red indicada para evitar pérdidas.
                          </p>
                        </div>
                      )}

                      {/* Pago Móvil */}
                      {metodoPago === "pago_movil" && (
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                            <div className="flex items-center gap-2">
                              <img
                                src="https://cdn-icons-png.flaticon.com/256/3417/3417590.png"
                                alt="Pago Móvil"
                                className="w-5 h-5 object-contain"
                              />
                              <span className="text-neutral-500">Total a pagar en Bolívares:</span>
                            </div>
                            <span className="font-heading font-black text-base text-[#D62300]">
                              Bs {formatBs(totalUSD * bcvRate)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-neutral-500 block uppercase">Banco</span>
                              <span className="text-neutral-900 font-medium">Banesco (0134)</span>
                            </div>
                            <CopyButton text="0134" label="Copiar código" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-neutral-500 block uppercase">Teléfono</span>
                              <span className="text-neutral-900 font-medium">0414-9813390</span>
                            </div>
                            <CopyButton text="04149813390" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-neutral-500 block uppercase">Cédula / RIF</span>
                              <span className="text-neutral-900 font-medium">J-501234567</span>
                            </div>
                            <CopyButton text="J-501234567" />
                          </div>
                          <p className="text-[10px] text-neutral-500 pt-1">
                            Tasa aplicada: Bs {formatBs(bcvRate)} / USD
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Inputs for Zelle, Binance, Pago Móvil (Referencia & Captura) ── */}
                  {metodoPago !== "efectivo" && (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                          Número de referencia <span className="text-[#D62300]">*</span> (mín. 4 dígitos)
                        </label>
                        <input
                          type="text"
                          required
                          value={referencia}
                          onChange={(e) => setReferencia(e.target.value)}
                          placeholder="Ej. 123456"
                          className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-black placeholder:text-neutral-400 focus:outline-hidden focus:border-[#D62300] transition-colors"
                        />
                        {referencia.trim().length > 0 && referencia.trim().length < 4 && (
                          <span className="text-[11px] text-red-500 block mt-1">
                            Debe tener al menos 4 caracteres.
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                          Captura del pago (opcional, solo imagen)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="block w-full text-xs text-neutral-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-800 hover:file:bg-neutral-200 cursor-pointer"
                        />

                        {previewUrl && (
                          <div className="relative mt-2.5 inline-block rounded-xl overflow-hidden border border-neutral-300 bg-neutral-100">
                            <img
                              src={previewUrl}
                              alt="Vista previa de captura"
                              className="w-24 h-24 object-cover"
                            />
                            <button
                              type="button"
                              onClick={removeFile}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center cursor-pointer shadow-sm active:scale-90"
                              title="Quitar imagen"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                STEP 3: CONFIRMATION SCREEN (Fades and scales 0.96 to 1 over 400ms)
               ══════════════════════════════════════════════════════════════════ */}
            {step === "confirmed" && (
              <div
                style={{
                  animation: "confirmScaleFade 400ms var(--ease)",
                  willChange: "transform, opacity",
                }}
                className="h-full min-h-[360px] flex flex-col items-center justify-center text-center py-10 px-4"
              >
                <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-[#D62300] text-[#D62300] flex items-center justify-center text-4xl mb-5 shadow-sm">
                  ✓
                </div>
                <h3 className="font-heading font-black text-3xl uppercase tracking-wider text-neutral-900 mb-2">
                  ¡PEDIDO ENVIADO!
                </h3>
                <p className="font-sans text-sm text-neutral-600 max-w-sm mb-4">
                  Tu mensaje ha sido generado y abierto en WhatsApp con éxito.
                </p>
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 max-w-sm text-xs text-neutral-600 text-left mb-6 leading-relaxed">
                  <span className="text-[#D62300] font-bold block mb-1">
                    Próximos pasos:
                  </span>
                  Te confirmamos cuando verifiquemos el pago. Si adjuntaste captura, asegúrate de enviarla en el chat de WhatsApp.
                </div>
                <button
                  type="button"
                  onClick={triggerClose}
                  className="bg-[#D62300] hover:bg-[#b81d00] text-white font-heading font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-full transition-transform duration-[180ms] cursor-pointer shadow-md active:scale-95"
                >
                  VOLVER AL MENÚ
                </button>
              </div>
            )}
          </div>

          {/* ── Bottom Drawer Footer Bar (Subtotal & Actions) ──────────────── */}
          {step !== "confirmed" && (
            <div className="p-6 bg-white border-t border-neutral-200 shrink-0 space-y-4">
              {/* Subtotal Row with smooth counting interpolation */}
              <div className="flex items-center justify-between">
                <span className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-neutral-900 leading-none">
                  Subtotal
                </span>
                <span className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-neutral-900 leading-none">
                  ${animatedUSD.toFixed(2)}
                </span>
              </div>

              {/* Tasa BCV info with smooth counting */}
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Tasa BCV del día: Bs {formatBs(bcvRate)}</span>
                <span>Total: Bs {formatBs(animatedBs)} ({bcvDate})</span>
              </div>

              {/* Action Button: "Procesar pedido" in Cart, "Enviar pedido" in Checkout */}
              {step === "cart" ? (
                <button
                  type="button"
                  disabled={items.length === 0}
                  onClick={goToCheckout}
                  className="w-full bg-[#D62300] hover:bg-[#b81d00] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white font-heading font-black text-xl sm:text-2xl lg:text-3xl uppercase tracking-wider py-4 sm:py-5 px-6 rounded-xl sm:rounded-2xl transition-transform duration-[180ms] cursor-pointer shadow-lg active:scale-[0.98] flex items-center justify-center leading-none"
                >
                  Procesar pedido
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!isFormValid || isSubmitting}
                  onClick={handleSendOrder}
                  className={`w-full bg-[#D62300] hover:bg-[#b81d00] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white font-heading font-black text-xl sm:text-2xl uppercase tracking-wider py-4 sm:py-5 px-6 rounded-xl sm:rounded-2xl transition-transform duration-[180ms] cursor-pointer shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 leading-none ${
                    isFormValid && !isSubmitting ? "animate-subtle-pulse" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>ENVIANDO...</span>
                    </span>
                  ) : (
                    <>
                      <span>Enviar pedido por WhatsApp</span>
                      <span className="text-xl sm:text-2xl leading-none">↗</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default BurgerCartDrawer;
