"use client";

import React, { useState, useEffect } from "react";
import {
  Order,
  OrderStatus,
  getOrders,
  subscribeOrders,
  updateOrderStatus,
} from "@/utils/ordersStore";
import { BCV_RATE } from "./BurgerCartDrawer";

interface BurgerOwnerDashboardProps {
  onBackToStore: () => void;
}

function formatBs(amount: number): string {
  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function BurgerOwnerDashboard({ onBackToStore }: BurgerOwnerDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"todos" | OrderStatus>("todos");
  const [bcvRate, setBcvRate] = useState<number>(BCV_RATE);

  useEffect(() => {
    // Initial load
    setOrders(getOrders());

    // Subscribe to in-memory order updates
    const unsubscribe = subscribeOrders((updatedOrders) => {
      setOrders(updatedOrders);
    });

    // Fetch official BCV rate with 3s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.promedio === "number" && data.promedio > 0) {
          setBcvRate(data.promedio);
        }
      })
      .catch(() => {
        setBcvRate(BCV_RATE);
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Metrics
  const totalOrdersCount = orders.length;
  const pendingVerificationCount = orders.filter(
    (o) => o.status === "Pago por verificar"
  ).length;
  const totalSalesUSD = orders.reduce((sum, o) => sum + o.totalUSD, 0);
  const totalSalesBs = totalSalesUSD * bcvRate;

  // Filtered orders
  const filteredOrders =
    filter === "todos"
      ? orders
      : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col select-none font-sans">
      {/* ── Demo Notice Banner ─────────────────────────────────────────────── */}
      <div className="w-full bg-amber-100 border-b-2 border-black px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-amber-900 text-center">
        <span>⚠️</span>
        <span>DATOS DE EJEMPLO (demo) — Panel administrativo en memoria de Poto&apos;s Burgers</span>
      </div>

      {/* ── Header Bar ────────────────────────────────────────────────────── */}
      <header className="w-full bg-[#FAF9F5] border-b-2 border-black px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF5500] text-white flex items-center justify-center font-heading font-black text-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            P
          </div>
          <div>
            <h1 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-wider text-black leading-none">
              PANEL DEL DUEÑO
            </h1>
            <p className="text-[11px] text-neutral-600 font-bold mt-0.5">
              Poto&apos;s Burgers · El Tigre, Anzoátegui
            </p>
          </div>
        </div>

        {/* Back to store button */}
        <button
          type="button"
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white border-2 border-black px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#FF5500] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
        >
          <span>←</span>
          <span>Volver a la tienda</span>
        </button>
      </header>

      {/* ── Main Dashboard Body ────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-white">
        {/* ── Top Metric Cards (3 Cards) ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* 1. Pedidos de hoy */}
          <div className="bg-white border-2 border-black rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-[3px_3px_0px_0px_#000]">
            <div className="flex items-center justify-between text-neutral-600 mb-2">
              <span className="text-xs font-black uppercase tracking-wider">
                Pedidos de hoy
              </span>
              <span className="text-2xl">📦</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-black text-3xl sm:text-4xl text-black">
                {totalOrdersCount}
              </span>
              <span className="text-xs text-neutral-500 font-bold">órdenes registradas</span>
            </div>
          </div>

          {/* 2. Ventas del día (USD and Bs at BCV_RATE) */}
          <div className="bg-white border-2 border-black rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-[3px_3px_0px_0px_#000]">
            <div className="flex items-center justify-between text-neutral-600 mb-2">
              <span className="text-xs font-black uppercase tracking-wider">
                Ventas del día
              </span>
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <div className="font-heading font-black text-3xl sm:text-4xl text-[#FF5500]">
                ${totalSalesUSD.toFixed(2)}
              </div>
              <div className="text-xs sm:text-sm text-neutral-700 font-bold mt-1">
                Bs {formatBs(totalSalesBs)}{" "}
                <span className="text-[10px] text-neutral-500 font-medium">
                  (Tasa BCV {formatBs(bcvRate)})
                </span>
              </div>
            </div>
          </div>

          {/* 3. Pagos por verificar */}
          <div className="bg-white border-2 border-black rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-[3px_3px_0px_0px_#000]">
            <div className="flex items-center justify-between text-neutral-600 mb-2">
              <span className="text-xs font-black uppercase tracking-wider">
                Pagos por verificar
              </span>
              <span className="text-2xl">🔍</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-heading font-black text-3xl sm:text-4xl ${
                  pendingVerificationCount > 0 ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                {pendingVerificationCount}
              </span>
              <span className="text-xs text-neutral-500 font-bold">
                {pendingVerificationCount === 1 ? "pendiente" : "pendientes"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Orders Management Section ──────────────────────────────────── */}
        <section className="bg-white border-2 border-black rounded-2xl p-4 sm:p-6 space-y-4 shadow-[4px_4px_0px_0px_#000]">
          {/* Header & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black">
            <div>
              <h2 className="font-heading font-black text-lg sm:text-xl uppercase tracking-wider text-black">
                LISTADO DE PEDIDOS ({filteredOrders.length})
              </h2>
              <p className="text-xs text-neutral-600 font-medium">
                Cambia el estado de cada orden en tiempo real.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {(
                [
                  "todos",
                  "Pago por verificar",
                  "Confirmado",
                  "Entregado",
                ] as const
              ).map((tab) => {
                const isActive = filter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilter(tab)}
                    className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 border-black cursor-pointer ${
                      isActive
                        ? "bg-[#FF5500] text-white shadow-[2px_2px_0px_0px_#000]"
                        : "bg-white text-black hover:bg-neutral-100"
                    }`}
                  >
                    {tab === "todos" ? "Todos" : tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orders List / Cards */}
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-sm font-medium">
              No hay pedidos registrados en esta categoría.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const totalBsOrder = order.totalUSD * bcvRate;

                // Status badge styling
                let statusBadgeClass = "";
                if (order.status === "Pago por verificar") {
                  statusBadgeClass =
                    "bg-amber-100 text-amber-900 border-amber-400";
                } else if (order.status === "Confirmado") {
                  statusBadgeClass =
                    "bg-blue-100 text-blue-900 border-blue-400";
                } else {
                  statusBadgeClass =
                    "bg-emerald-100 text-emerald-900 border-emerald-400";
                }

                return (
                  <div
                    key={order.id}
                    className="bg-[#FAF9F5] border-2 border-black rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transition-all"
                  >
                    {/* Left: Info Block */}
                    <div className="flex-1 space-y-2">
                      {/* Top line: ID, Time, Delivery Type, Status */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-heading font-black text-base text-[#FF5500] tracking-wider">
                          {order.id}
                        </span>
                        <span className="text-neutral-400">·</span>
                        <span className="text-neutral-600 font-semibold">{order.time}</span>
                        <span className="text-neutral-400">·</span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-black text-black font-bold text-[11px]">
                          {order.deliveryType === "Delivery" ? "🛵 Delivery" : "🏪 Retiro en local"}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[11px] font-black tracking-wide ${statusBadgeClass}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Customer & Items */}
                      <div>
                        <div className="font-heading font-black text-base sm:text-lg text-black">
                          {order.customerName}{" "}
                          <span className="font-sans text-xs text-neutral-600 font-bold">
                            ({order.customerPhone})
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-800 font-normal mt-0.5 leading-relaxed">
                          {order.items}
                        </p>
                        {order.address && (
                          <p className="text-[11px] text-neutral-600 font-medium mt-1 flex items-start gap-1">
                            <span>📍</span>
                            <span>{order.address}</span>
                          </p>
                        )}
                      </div>

                      {/* Payment & Reference */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-700 pt-1">
                        <span className="font-bold text-black">
                          Método: {order.paymentMethod}
                        </span>
                        <span className="text-neutral-400">·</span>
                        <span>
                          Ref:{" "}
                          <strong className="text-black font-mono font-bold">
                            {order.paymentReference}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Right: Amounts & Status Action Buttons */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 border-t-2 lg:border-t-0 border-neutral-300 shrink-0">
                      {/* Price */}
                      <div className="text-left lg:text-right">
                        <span className="font-heading font-black text-xl sm:text-2xl text-black block leading-none">
                          ${order.totalUSD.toFixed(2)}
                        </span>
                        <span className="text-xs text-neutral-600 block mt-1 font-bold">
                          Bs {formatBs(totalBsOrder)}
                        </span>
                      </div>

                      {/* Status Change Action Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {order.status !== "Pago por verificar" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateOrderStatus(order.id, "Pago por verificar")
                            }
                            className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-black border border-black hover:bg-amber-100 transition-colors cursor-pointer"
                            title="Mover a Pago por verificar"
                          >
                            Por verificar
                          </button>
                        )}

                        {order.status !== "Confirmado" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateOrderStatus(order.id, "Confirmado")
                            }
                            className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                            title="Confirmar pago de la orden"
                          >
                            ✓ Confirmar
                          </button>
                        )}

                        {order.status !== "Entregado" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateOrderStatus(order.id, "Entregado")
                            }
                            className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                            title="Marcar orden como entregada"
                          >
                            ✓ Entregado
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default BurgerOwnerDashboard;
