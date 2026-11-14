// ── In-Memory Orders Store for Owner Dashboard ──────────────────────────────
// Shared in-memory state between storefront checkout and owner panel.
// No real data storage (all data resets on hard reload).

export type OrderStatus = "Pago por verificar" | "Confirmado" | "Entregado";

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: string;
  totalUSD: number;
  paymentMethod: "Pago Móvil" | "Zelle" | "Binance USDT" | "Efectivo";
  paymentReference: string;
  deliveryType: "Delivery" | "Retiro en local";
  address?: string;
  time: string;
  status: OrderStatus;
}

// 4 realistic pre-loaded demo orders for El Tigre, Anzoátegui
const initialOrders: Order[] = [
  {
    id: "#1041",
    customerName: "Carlos Mendoza",
    customerPhone: "0414-9812233",
    items: "2x Hamburguesa doble, 1x Papas locas clásicas, 2x Coca-Cola",
    totalUSD: 40.0,
    paymentMethod: "Pago Móvil",
    paymentReference: "948201",
    deliveryType: "Delivery",
    address: "Urb. San José, Calle 4, Casa 18",
    time: "12:15 PM",
    status: "Entregado",
  },
  {
    id: "#1042",
    customerName: "Mariana Rojas",
    customerPhone: "0424-8194455",
    items: "1x Parrilla para dos, 2x Malta Polar",
    totalUSD: 33.0,
    paymentMethod: "Zelle",
    paymentReference: "ZEL-482019",
    deliveryType: "Retiro en local",
    time: "12:35 PM",
    status: "Confirmado",
  },
  {
    id: "#1043",
    customerName: "Alejandro Silva",
    customerPhone: "0412-3349900",
    items: "1x Pizza Pepperoni, 1x Papas con pollo crispy",
    totalUSD: 23.5,
    paymentMethod: "Binance USDT",
    paymentReference: "TX-7819024",
    deliveryType: "Delivery",
    address: "Sector Pueblo Nuevo Sur, Carrera 12",
    time: "12:52 PM",
    status: "Pago por verificar",
  },
  {
    id: "#1044",
    customerName: "Patricia Gómez",
    customerPhone: "0414-5561122",
    items: "2x Perro caliente clásico, 1x Hamburguesa clásica",
    totalUSD: 19.0,
    paymentMethod: "Efectivo",
    paymentReference: "Efectivo al recibir",
    deliveryType: "Delivery",
    address: "Av. Francisco de Miranda, Edif. Los Olivos, Apto 3B",
    time: "01:05 PM",
    status: "Pago por verificar",
  },
];

let orders: Order[] = [...initialOrders];
let nextOrderSequence = 1045;
const subscribers = new Set<(orders: Order[]) => void>();

function notifySubscribers() {
  subscribers.forEach((callback) => {
    try {
      callback([...orders]);
    } catch {
      // Ignore callback errors
    }
  });
}

export function getOrders(): Order[] {
  return [...orders];
}

export function subscribeOrders(callback: (orders: Order[]) => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

export function addOrder(
  orderData: Omit<Order, "id" | "time" | "status">
): Order {
  const now = new Date();
  const timeString = now.toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const newOrder: Order = {
    ...orderData,
    id: `#${nextOrderSequence++}`,
    time: timeString,
    status: "Pago por verificar",
  };

  orders = [newOrder, ...orders];
  notifySubscribers();
  return newOrder;
}

export function updateOrderStatus(orderId: string, nextStatus: OrderStatus): void {
  orders = orders.map((ord) =>
    ord.id === orderId ? { ...ord, status: nextStatus } : ord
  );
  notifySubscribers();
}
