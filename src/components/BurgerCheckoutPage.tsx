"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CartItem,
  getStoredCartItems,
  setStoredCartItems,
  subscribeCartItems,
} from "@/utils/cartStore";

const BCV_DEFAULT_RATE = 56.40;

function formatBs(amount: number): string {
  return amount.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parsePrice(price: string | number): number {
  if (typeof price === "number") return price;
  const clean = String(price).replace(/[^0-9.]/g, "");
  return parseFloat(clean) || 0;
}

export function BurgerCheckoutPage() {
  // ── Cart Items State ───────────────────────────────────────────────────────
  const [items, setItems] = useState<CartItem[]>([]);
  const [bcvRate, setBcvRate] = useState<number>(BCV_DEFAULT_RATE);
  const [bcvDate, setBcvDate] = useState<string>("BCV Hoy");

  useEffect(() => {
    setItems(getStoredCartItems());
    return subscribeCartItems((updated) => setItems(updated));
  }, []);

  // Fetch live BCV rate if available
  useEffect(() => {
    let isMounted = true;
    fetch("https://ve.dolarapi.com/v1/dolares/oficial")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data && typeof data.promedio === "number" && data.promedio > 0) {
          setBcvRate(data.promedio);
          if (data.fechaActualizacion) {
            const dateObj = new Date(data.fechaActualizacion);
            setBcvDate(
              dateObj.toLocaleDateString("es-VE", {
                day: "numeric",
                month: "short",
              })
            );
          }
        }
      })
      .catch(() => {
        setBcvRate(BCV_DEFAULT_RATE);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ── Form State ─────────────────────────────────────────────────────────────
  // Contact
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Delivery
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [addressAdded, setAddressAdded] = useState(false);
  const [streetAddress, setStreetAddress] = useState("");
  const [sector, setSector] = useState("");
  const [reference, setReference] = useState("");
  const [deliveryTiming, setDeliveryTiming] = useState<"inmediato" | "programado">("inmediato");
  const [scheduledTime, setScheduledTime] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<
    "pagomovil" | "zelle" | "efectivo_usd" | "paypal" | "efectivo_bs" | "combinado"
  >("pagomovil");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [combinedNotes, setCombinedNotes] = useState("");

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  // Invoice
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [rif, setRif] = useState("");
  const [businessName, setBusinessName] = useState("");

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<string | null>(null);

  // ── Price Calculations ─────────────────────────────────────────────────────
  const subtotalUSD = items.reduce((acc, item) => {
    return acc + parsePrice(item.price) * item.quantity;
  }, 0);

  const deliveryFeeUSD = deliveryMethod === "delivery" ? 1.50 : 0.00;

  const discountAmountUSD = appliedCoupon
    ? subtotalUSD * (appliedCoupon.discountPercent / 100)
    : 0;

  const totalUSD = Math.max(0, subtotalUSD + deliveryFeeUSD - discountAmountUSD);
  const totalBs = totalUSD * bcvRate;

  // ── Quantity adjustments ───────────────────────────────────────────────────
  const updateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      const updated = items.filter((i) => i.id !== id);
      setItems(updated);
      setStoredCartItems(updated);
    } else {
      const updated = items.map((i) => (i.id === id ? { ...i, quantity: newQty } : i));
      setItems(updated);
      setStoredCartItems(updated);
    }
  };

  const removeItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    setStoredCartItems(updated);
  };

  // ── Apply Coupon ───────────────────────────────────────────────────────────
  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError("");
    const cleaned = couponCode.trim().toUpperCase();
    if (!cleaned) return;

    if (cleaned === "POTOS10" || cleaned === "DESCU10") {
      setAppliedCoupon({ code: cleaned, discountPercent: 10 });
    } else if (cleaned === "POTOS20") {
      setAppliedCoupon({ code: cleaned, discountPercent: 20 });
    } else {
      setCouponError("Cupón no válido o expirado");
    }
  };

  // ── Order Validation & Submit to WhatsApp ──────────────────────────────────
  const isFormValid =
    items.length > 0 &&
    name.trim().length > 0 &&
    phone.trim().length > 0 &&
    (deliveryMethod === "pickup" || (deliveryMethod === "delivery" && streetAddress.trim().length > 0));

  const handleConfirmOrder = () => {
    if (!isFormValid) {
      if (deliveryMethod === "delivery" && !streetAddress.trim()) {
        setAddressAdded(true);
      }
      return;
    }

    setIsSubmitting(true);

    const orderId = `POTO-${Date.now().toString().slice(-5)}`;

    let message = `*🍔 ¡NUEVO PEDIDO POTO'S BURGERS! (#${orderId})*\n`;
    message += `──────────────────────\n`;
    message += `👤 *Cliente:* ${name.trim()}\n`;
    message += `📱 *Teléfono:* ${phone.trim()}\n`;
    if (email.trim()) message += `✉️ *Correo:* ${email.trim()}\n`;

    message += `\n📦 *Tipo de Entrega:* ${
      deliveryMethod === "delivery" ? "🛵 Delivery / Envío Local" : "📍 Retiro en Local (CC Z&T)"
    }\n`;

    if (deliveryMethod === "delivery") {
      message += `📍 *Dirección:* ${streetAddress.trim()}\n`;
      if (sector.trim()) message += `🏘️ *Sector:* ${sector.trim()}\n`;
      if (reference.trim()) message += `📍 *Punto de Ref:* ${reference.trim()}\n`;
    }

    message += `⏰ *Horario:* ${
      deliveryTiming === "inmediato" ? "Inmediato (30-45 min)" : `Programado: ${scheduledTime || "Por acordar"}`
    }\n`;

    message += `\n💳 *Método de Pago:* `;
    if (paymentMethod === "pagomovil") {
      message += `Pago Móvil (Ref: ${referenceNumber || "Por enviar"} - ${accountHolder || "Titular"})\n`;
    } else if (paymentMethod === "zelle") {
      message += `Zelle (Titular: ${accountHolder || "Por confirmar"})\n`;
    } else if (paymentMethod === "efectivo_usd") {
      message += `Efectivo en Dólares ($)\n`;
    } else if (paymentMethod === "paypal") {
      message += `PayPal\n`;
    } else if (paymentMethod === "efectivo_bs") {
      message += `Efectivo en Bolívares (Bs)\n`;
    } else {
      message += `Pago Combinado (${combinedNotes || "A convenir"})\n`;
    }

    if (showInvoiceForm && rif.trim()) {
      message += `🧾 *Factura:* ${businessName} (RIF: ${rif})\n`;
    }

    message += `\n📋 *PRODUCTOS:* \n`;
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* x${item.quantity} — $${(parsePrice(item.price) * item.quantity).toFixed(2)}\n`;
    });

    message += `──────────────────────\n`;
    message += `💵 *Subtotal:* $${subtotalUSD.toFixed(2)}\n`;
    if (deliveryMethod === "delivery") {
      message += `🛵 *Envío:* $${deliveryFeeUSD.toFixed(2)}\n`;
    }
    if (appliedCoupon) {
      message += `🏷️ *Cupón (${appliedCoupon.code}):* -$${discountAmountUSD.toFixed(2)}\n`;
    }
    message += `💰 *TOTAL:* $${totalUSD.toFixed(2)} (Bs ${formatBs(totalBs)} a tasa BCV)\n`;
    message += `──────────────────────\n`;
    message += `¡Gracias por elegir Poto's Burgers! 🔥🍔`;

    // Save to owner dashboard history if available
    try {
      const existing = localStorage.getItem("potos_orders");
      const orders = existing ? JSON.parse(existing) : [];
      orders.unshift({
        id: orderId,
        date: new Date().toISOString(),
        client: name.trim(),
        phone: phone.trim(),
        total: totalUSD,
        items: items.map((i) => `${i.quantity}x ${i.name}`),
        method: paymentMethod,
        status: "pendiente",
      });
      localStorage.setItem("potos_orders", JSON.stringify(orders.slice(0, 50)));
    } catch {
      // ignore
    }

    // Clear cart and redirect to WhatsApp
    setTimeout(() => {
      setSubmittedOrder(orderId);
      setIsSubmitting(false);
      setStoredCartItems([]);
      setItems([]);
      const whatsappUrl = `https://wa.me/584149813390?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] text-neutral-900 font-sans pb-20">
      {/* ── Top Header Bar (Matches Reference Logo + Security Badge) ─────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="bg-[#E31B23] px-3.5 sm:px-4 py-1.5 rounded-lg border border-black shadow-[2px_2px_0px_0px_#000] inline-flex items-center gap-1.5 hover:bg-[#c9151c] transition-colors"
            >
              <span className="font-heading font-black italic uppercase tracking-wider text-white text-base sm:text-lg">
                POTO'S
              </span>
              <span className="text-white text-xs leading-none">*</span>
              <span className="font-heading font-black italic uppercase tracking-wider text-white text-base sm:text-lg">
                BURGERS
              </span>
            </Link>
            <Link
              href="/#menu"
              className="text-xs sm:text-sm font-bold text-neutral-500 hover:text-black transition-colors hidden sm:inline-flex items-center gap-1"
            >
              <span>←</span>
              <span>Volver al menú</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden sm:inline">Checkout Seguro</span>
            <span className="sm:hidden">Seguro</span>
          </div>
        </div>
      </header>

      {/* ── Main Container: 2-Column Responsive Layout ─────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {submittedOrder ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto border border-neutral-200 shadow-md">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              ✓
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl uppercase text-neutral-900 mb-2">
              ¡Pedido Procesado!
            </h1>
            <p className="text-neutral-600 text-sm sm:text-base mb-6 leading-relaxed">
              Tu pedido <span className="font-bold text-black">#{submittedOrder}</span> ha sido generado y abierto en WhatsApp para confirmación con nuestro equipo en El Tigre.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="bg-[#E31B23] hover:bg-[#c9151c] text-white font-heading font-black text-lg uppercase px-8 py-3.5 rounded-xl transition-all shadow-md"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── LEFT COLUMN: Contacto, Entrega, Métodos de Pago (7 cols) ── */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* ── Card 1: Contacto ── */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-xl text-neutral-900 tracking-tight">Contacto</h2>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                      Ingresa tus datos para continuar con tu compra.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#E31B23] bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                    Paso 1
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Nombre y apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Carlos Pérez"
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm bg-neutral-50/50 focus:bg-white focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/10 transition-all outline-hidden font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Teléfono / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej. 0414-9813390"
                        className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm bg-neutral-50/50 focus:bg-white focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/10 transition-all outline-hidden font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center justify-between">
                        <span>Correo electrónico</span>
                        <span className="text-neutral-400 text-xs font-normal">Opcional</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tucorreo@ejemplo.com"
                        className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm bg-neutral-50/50 focus:bg-white focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/10 transition-all outline-hidden font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Card 2: Entrega (Envío vs Retiro) ── */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs">
                <div className="mb-4">
                  <h2 className="font-bold text-xl text-neutral-900 tracking-tight">Entrega</h2>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                    Elige cómo quieres recibir tu pedido.
                  </p>
                </div>

                {/* Segmented Switcher [ Envío | Retiro ] */}
                <div className="bg-neutral-100 p-1 rounded-xl flex items-center gap-1 mb-5">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("delivery")}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm text-center transition-all cursor-pointer ${
                      deliveryMethod === "delivery"
                        ? "bg-white text-neutral-900 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    🛵 Envío (Delivery)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("pickup")}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm text-center transition-all cursor-pointer ${
                      deliveryMethod === "pickup"
                        ? "bg-white text-neutral-900 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    📍 Retiro en local
                  </button>
                </div>

                {deliveryMethod === "delivery" ? (
                  <div className="space-y-4">
                    {/* Tipo de envío */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Tipo de envío
                      </label>
                      <div className="border border-neutral-200 rounded-xl p-3.5 flex items-center justify-between bg-neutral-50/40">
                        <div className="flex items-center gap-3">
                          <span className="w-4 h-4 rounded-full border-4 border-[#E31B23] bg-white inline-block" />
                          <span className="text-sm font-bold text-neutral-900">
                            Entrega local (El Tigre)
                          </span>
                        </div>
                        <span className="text-xs font-bold text-neutral-700 bg-neutral-200/70 px-2 py-0.5 rounded-md">
                          +$1.50
                        </span>
                      </div>
                    </div>

                    {/* Dirección de entrega */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-neutral-700">
                          Dirección de entrega <span className="text-red-500">*</span>
                        </label>
                        {addressAdded && (
                          <button
                            type="button"
                            onClick={() => setAddressAdded(false)}
                            className="text-xs text-[#E31B23] font-bold hover:underline cursor-pointer"
                          >
                            Editar
                          </button>
                        )}
                      </div>

                      {!addressAdded ? (
                        <div className="border border-dashed border-neutral-300 rounded-xl p-4 text-center bg-neutral-50/50">
                          <p className="text-xs text-neutral-500 mb-2">
                            {streetAddress
                              ? streetAddress
                              : "No se ha asignado una dirección de envío"}
                          </p>
                          <button
                            type="button"
                            onClick={() => setAddressAdded(true)}
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#E31B23] hover:text-[#c9151c] cursor-pointer"
                          >
                            <span>⊕</span>
                            <span>{streetAddress ? "Editar dirección" : "Agregar una dirección"}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 bg-neutral-50/60 border border-neutral-200 p-4 rounded-xl">
                          <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                              Calle, Carrera o Avenida con Número de Casa / Apto
                            </label>
                            <input
                              type="text"
                              value={streetAddress}
                              onChange={(e) => setStreetAddress(e.target.value)}
                              placeholder="Ej. 4ta Carrera Sur, entre calles 15 y 16, Casa #42"
                              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm bg-white focus:border-[#E31B23] outline-hidden"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                                Sector / Urbanización
                              </label>
                              <input
                                type="text"
                                value={sector}
                                onChange={(e) => setSector(e.target.value)}
                                placeholder="Ej. Casco Viejo / Pueblo Nuevo"
                                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm bg-white focus:border-[#E31B23] outline-hidden"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                                Punto de referencia
                              </label>
                              <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder="Ej. Frente a la farmacia, portón rojo"
                                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm bg-white focus:border-[#E31B23] outline-hidden"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setAddressAdded(false)}
                            className="w-full bg-neutral-900 text-white font-bold text-xs py-2 rounded-lg hover:bg-black transition-colors cursor-pointer"
                          >
                            Guardar dirección
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/60 flex items-start gap-3">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="font-bold text-sm text-neutral-900">
                        Centro Comercial Z&T, 4ta Carrera Sur
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        El Tigre 6050, Anzoátegui · Lun a Dom 11:30 AM – 11:55 PM
                      </p>
                      <span className="inline-block mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Retiro Gratis en Mostrador
                      </span>
                    </div>
                  </div>
                )}

                {/* ¿Cuándo quieres tu pedido? */}
                <div className="mt-5 pt-4 border-t border-neutral-100">
                  <label className="block text-xs font-semibold text-neutral-700 mb-2">
                    ¿Cuándo quieres tu pedido?
                  </label>
                  <div className="bg-neutral-100 p-1 rounded-xl flex items-center gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryTiming("inmediato")}
                      className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs text-center transition-all cursor-pointer ${
                        deliveryTiming === "inmediato"
                          ? "bg-white text-neutral-900 shadow-xs"
                          : "text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      Inmediato
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryTiming("programado")}
                      className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs text-center transition-all cursor-pointer ${
                        deliveryTiming === "programado"
                          ? "bg-white text-neutral-900 shadow-xs"
                          : "text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      Programado
                    </button>
                  </div>

                  {deliveryTiming === "inmediato" ? (
                    <div className="flex items-center gap-2 text-xs text-neutral-600 mt-2">
                      <span>🕒</span>
                      <span>Entrega estimada: <strong>30 a 45 minutos</strong></span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        placeholder="Ej. Hoy para las 8:30 PM"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs bg-white focus:border-[#E31B23] outline-hidden"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ── Card 3: Métodos de Pago ── */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs">
                <div className="mb-4">
                  <h2 className="font-bold text-xl text-neutral-900 tracking-tight">Métodos de pago</h2>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                    Selecciona cómo deseas pagar tu orden.
                  </p>
                </div>

                {/* Pago Móvil Section */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-neutral-800 flex items-center gap-1.5">
                      <span>Pago Móvil</span>
                      <span className="text-amber-500 text-[11px] font-bold">⚡ Pago automático</span>
                    </span>
                  </div>

                  <div
                    onClick={() => setPaymentMethod("pagomovil")}
                    className={`border rounded-xl p-4 transition-all cursor-pointer ${
                      paymentMethod === "pagomovil"
                        ? "border-[#E31B23] bg-red-50/20 ring-1 ring-[#E31B23]/20"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === "pagomovil"
                            ? "border-[#E31B23] bg-[#E31B23]"
                            : "border-neutral-300 bg-white"
                        }`}
                      >
                        {paymentMethod === "pagomovil" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="font-bold text-sm text-neutral-900">
                        Pago Móvil Poto's Burgers
                      </span>
                    </div>

                    <div className="bg-neutral-100/80 rounded-lg p-3 text-xs text-neutral-700 space-y-1 mb-3">
                      <p><strong>Banco:</strong> Banesco (0134) o Bco. de Venezuela (0102)</p>
                      <p><strong>Teléfono:</strong> 0414-9813390</p>
                      <p><strong>Cédula / RIF:</strong> J-50000000-0</p>
                    </div>

                    {paymentMethod === "pagomovil" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                            Últimos 4 dígitos de Referencia
                          </label>
                          <input
                            type="text"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            placeholder="Ej. 4921"
                            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs bg-white focus:border-[#E31B23] outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                            Titular de la cuenta emisora
                          </label>
                          <input
                            type="text"
                            value={accountHolder}
                            onChange={(e) => setAccountHolder(e.target.value)}
                            placeholder="Ej. Carlos Pérez"
                            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs bg-white focus:border-[#E31B23] outline-hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Métodos de Pago Manual */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-neutral-500 mb-2.5">
                    Métodos de pago manual
                  </h3>

                  <div className="space-y-2.5">
                    {/* Zelle */}
                    <div
                      onClick={() => setPaymentMethod("zelle")}
                      className={`border rounded-xl p-3.5 flex items-center justify-between transition-all cursor-pointer ${
                        paymentMethod === "zelle"
                          ? "border-[#E31B23] bg-red-50/20"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === "zelle"
                              ? "border-[#E31B23] bg-[#E31B23]"
                              : "border-neutral-300 bg-white"
                          }`}
                        >
                          {paymentMethod === "zelle" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span className="w-6 h-6 rounded-md bg-[#7414CA] text-white font-black text-xs flex items-center justify-center">
                          Z
                        </span>
                        <span className="font-bold text-sm text-neutral-900">Zelle</span>
                      </div>
                      <span className="text-xs text-neutral-400">zelle@potosburgers.com</span>
                    </div>

                    {/* Efectivo en $ */}
                    <div
                      onClick={() => setPaymentMethod("efectivo_usd")}
                      className={`border rounded-xl p-3.5 flex items-center justify-between transition-all cursor-pointer ${
                        paymentMethod === "efectivo_usd"
                          ? "border-[#E31B23] bg-red-50/20"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === "efectivo_usd"
                              ? "border-[#E31B23] bg-[#E31B23]"
                              : "border-neutral-300 bg-white"
                          }`}
                        >
                          {paymentMethod === "efectivo_usd" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                          $
                        </span>
                        <span className="font-bold text-sm text-neutral-900">Efectivo en $</span>
                      </div>
                      <span className="text-xs text-neutral-400">Al recibir</span>
                    </div>

                    {/* PayPal */}
                    <div
                      onClick={() => setPaymentMethod("paypal")}
                      className={`border rounded-xl p-3.5 flex items-center justify-between transition-all cursor-pointer ${
                        paymentMethod === "paypal"
                          ? "border-[#E31B23] bg-red-50/20"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === "paypal"
                              ? "border-[#E31B23] bg-[#E31B23]"
                              : "border-neutral-300 bg-white"
                          }`}
                        >
                          {paymentMethod === "paypal" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span className="w-6 h-6 rounded-md bg-[#003087] text-white font-black text-xs flex items-center justify-center">
                          P
                        </span>
                        <span className="font-bold text-sm text-neutral-900">Paypal</span>
                      </div>
                      <span className="text-xs text-neutral-400">Online</span>
                    </div>

                    {/* Efectivo en Bs */}
                    <div
                      onClick={() => setPaymentMethod("efectivo_bs")}
                      className={`border rounded-xl p-3.5 flex items-center justify-between transition-all cursor-pointer ${
                        paymentMethod === "efectivo_bs"
                          ? "border-[#E31B23] bg-red-50/20"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === "efectivo_bs"
                              ? "border-[#E31B23] bg-[#E31B23]"
                              : "border-neutral-300 bg-white"
                          }`}
                        >
                          {paymentMethod === "efectivo_bs" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span className="w-6 h-6 rounded-md bg-blue-700 text-white font-black text-xs flex items-center justify-center">
                          Bs
                        </span>
                        <span className="font-bold text-sm text-neutral-900">Efectivo en Bs</span>
                      </div>
                      <span className="text-xs text-neutral-400">Tasa BCV</span>
                    </div>

                    {/* Pago Combinado */}
                    <div
                      onClick={() => setPaymentMethod("combinado")}
                      className={`border rounded-xl p-3.5 flex items-center justify-between transition-all cursor-pointer ${
                        paymentMethod === "combinado"
                          ? "border-[#E31B23] bg-red-50/20"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === "combinado"
                              ? "border-[#E31B23] bg-[#E31B23]"
                              : "border-neutral-300 bg-white"
                          }`}
                        >
                          {paymentMethod === "combinado" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span className="w-6 h-6 rounded-md bg-neutral-800 text-white font-black text-xs flex items-center justify-center">
                          ⇄
                        </span>
                        <span className="font-bold text-sm text-neutral-900">Pago combinado</span>
                      </div>
                      <span className="text-xs text-neutral-400">Múltiples métodos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Tu Pedido, Cupón & Resumen (5 cols) ─────────── */}
            <div className="lg:col-span-5 flex flex-col gap-6 sticky top-20">
              {/* ── Card 1: Tu Pedido ── */}
              <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-xl text-neutral-900 tracking-tight">Tu pedido</h2>
                  <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                    {items.reduce((acc, i) => acc + i.quantity, 0)} productos
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-neutral-500 mb-3">No hay productos en tu pedido.</p>
                    <Link
                      href="/#menu"
                      className="inline-block bg-[#E31B23] hover:bg-[#c9151c] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-lg transition-colors"
                    >
                      Explorar el Menú
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 py-2.5 border-b border-neutral-100 last:border-none"
                      >
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover border border-neutral-200 bg-neutral-100 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-neutral-200 flex items-center justify-center text-lg shrink-0">
                              🍔
                            </div>
                          )}
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              ${parsePrice(item.price).toFixed(2)} c/u
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Quantity +/- */}
                          <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 text-xs font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-neutral-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 text-xs font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-xs sm:text-sm font-black text-neutral-900 w-14 text-right">
                            ${(parsePrice(item.price) * item.quantity).toFixed(2)}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-neutral-400 hover:text-red-600 text-xs p-1 cursor-pointer"
                            title="Eliminar"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Card 2: Cupón de descuento ── */}
              <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs">
                <h2 className="font-bold text-sm text-neutral-900 mb-2">Cupón de descuento</h2>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Ejemplo: POTOS10"
                    className="flex-1 rounded-xl border border-neutral-200 px-3.5 py-2.5 text-xs bg-neutral-50/50 uppercase font-bold tracking-wider focus:bg-white focus:border-[#E31B23] outline-hidden"
                  />
                  <button
                    type="submit"
                    className="bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Aplicar
                  </button>
                </form>

                {appliedCoupon && (
                  <div className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center justify-between">
                    <span>✓ Cupón {appliedCoupon.code} aplicado (-{appliedCoupon.discountPercent}%)</span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-emerald-900 hover:underline text-[11px] cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="mt-2 text-xs text-red-600 font-semibold">{couponError}</p>
                )}
              </div>

              {/* ── Card 3: Resumen & Confirmación ── */}
              <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                <h2 className="font-bold text-lg text-neutral-900">Resumen</h2>

                <div className="space-y-2 text-xs sm:text-sm text-neutral-600 border-b border-neutral-100 pb-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-900">${subtotalUSD.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span className="font-semibold text-neutral-900">
                      {deliveryMethod === "delivery" ? `$${deliveryFeeUSD.toFixed(2)}` : "Gratis"}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Descuento ({appliedCoupon.code})</span>
                      <span>-${discountAmountUSD.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="font-bold text-sm text-neutral-900 block">Total a pagar</span>
                    <span className="text-[11px] text-neutral-500">
                      Tasa BCV: Bs {formatBs(bcvRate)} ({bcvDate})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 block leading-none">
                      ${totalUSD.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-neutral-600 block mt-0.5">
                      Bs {formatBs(totalBs)}
                    </span>
                  </div>
                </div>

                {/* Primary Button: Dark navy matching screenshot */}
                <button
                  type="button"
                  disabled={isSubmitting || items.length === 0}
                  onClick={handleConfirmOrder}
                  className={`w-full py-4 px-6 rounded-xl font-heading font-black text-base sm:text-lg uppercase tracking-wider text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                    items.length === 0
                      ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                      : "bg-[#181A2A] hover:bg-[#0F101A] active:scale-[0.98]"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generando pedido...</span>
                    </span>
                  ) : deliveryMethod === "delivery" && !streetAddress.trim() ? (
                    "Agrega una dirección"
                  ) : (
                    "Confirmar y enviar pedido por WhatsApp"
                  )}
                </button>

                {/* Custom Invoice Accordion */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceForm(!showInvoiceForm)}
                    className="text-xs text-neutral-500 hover:text-neutral-900 font-semibold hover:underline cursor-pointer"
                  >
                    ¿Necesitas factura personalizada?
                  </button>

                  {showInvoiceForm && (
                    <div className="mt-3 text-left bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Razón Social / Nombre Comercial
                        </label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Empresa C.A."
                          className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          RIF / Cédula
                        </label>
                        <input
                          type="text"
                          value={rif}
                          onChange={(e) => setRif(e.target.value)}
                          placeholder="J-12345678-0"
                          className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 bg-white text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Support Button */}
                <div className="pt-1">
                  <a
                    href="https://wa.me/584149813390?text=Hola%2C%20necesito%20ayuda%20con%20mi%20pedido%20en%20Poto's%20Burgers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>💬</span>
                    <span>Contactar a soporte</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default BurgerCheckoutPage;