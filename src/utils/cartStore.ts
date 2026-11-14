// ── Cart Store & Persistent State ──────────────────────────────────────────
// Lightweight pub/sub with localStorage sync so that menu, drawer, and checkout
// share the exact same cart items seamlessly.

export interface CartItem {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  quantity: number;
  image?: string;
}

const STORAGE_KEY = "potos_cart_items";

let cartCount = 0;
let cartDrawerOpen = false;

const countListeners = new Set<(count: number) => void>();
const drawerListeners = new Set<(open: boolean) => void>();
const bumpListeners = new Set<() => void>();
const flyListeners = new Set<(data: { x: number; y: number; name: string }) => void>();
const itemsListeners = new Set<(items: CartItem[]) => void>();

export function getStoredCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setStoredCartItems(items: CartItem[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }
  const count = items.reduce((acc, item) => acc + item.quantity, 0);
  setCartCount(count);
  itemsListeners.forEach((cb) => {
    try { cb(items); } catch { /* ignore */ }
  });
}

export function subscribeCartItems(cb: (items: CartItem[]) => void): () => void {
  itemsListeners.add(cb);
  return () => { itemsListeners.delete(cb); };
}

export function getCartCount(): number {
  return cartCount;
}

export function setCartCount(count: number): void {
  cartCount = count;
  countListeners.forEach((cb) => {
    try { cb(count); } catch { /* ignore */ }
  });
}

export function triggerCartBump(): void {
  bumpListeners.forEach((cb) => {
    try { cb(); } catch { /* ignore */ }
  });
}

export function subscribeCartBump(cb: () => void): () => void {
  bumpListeners.add(cb);
  return () => { bumpListeners.delete(cb); };
}

export function triggerFlyItem(data: { x: number; y: number; name: string }): void {
  flyListeners.forEach((cb) => {
    try { cb(data); } catch { /* ignore */ }
  });
}

export function subscribeFlyItem(
  cb: (data: { x: number; y: number; name: string }) => void
): () => void {
  flyListeners.add(cb);
  return () => { flyListeners.delete(cb); };
}

export function subscribeCartCount(cb: (count: number) => void): () => void {
  countListeners.add(cb);
  return () => { countListeners.delete(cb); };
}

export function getCartDrawerOpen(): boolean {
  return cartDrawerOpen;
}

export function openCartDrawer(): void {
  cartDrawerOpen = true;
  drawerListeners.forEach((cb) => {
    try { cb(true); } catch { /* ignore */ }
  });
}

export function closeCartDrawer(): void {
  cartDrawerOpen = false;
  drawerListeners.forEach((cb) => {
    try { cb(false); } catch { /* ignore */ }
  });
}

export function subscribeCartDrawer(cb: (open: boolean) => void): () => void {
  drawerListeners.add(cb);
  return () => { drawerListeners.delete(cb); };
}
