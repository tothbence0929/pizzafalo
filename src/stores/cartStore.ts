import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ShopifyProduct } from "@/lib/shopify";
import { trackAddToCart } from "@/lib/analytics";
import {
  createShopifyCart,
  addLineToShopifyCart,
  updateShopifyCartLine,
  removeLineFromShopifyCart,
  getCart,
  formatCheckoutUrl,
} from "@/lib/shopify";

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  discountCode: string | null;
  discountAmount: number;
  discountType: "percentage" | "fixed" | null;
  postalCode: string;
  setPostalCode: (code: string) => void;
  fulfillment: "delivery" | "pickup";
  setFulfillment: (mode: "delivery" | "pickup") => void;
  /** "asap" = mielőbb, "scheduled" = előrendelés adott időpontra */
  orderTiming: "asap" | "scheduled";
  /** "YYYY-MM-DDTHH:mm" budapesti helyi idő, csak előrendelésnél */
  scheduledAt: string | null;
  setOrderTiming: (timing: "asap" | "scheduled") => void;
  setScheduledAt: (value: string | null) => void;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
  getSubtotal: () => number;
  getTotalQuantity: () => number;
  setDiscount: (code: string | null, amount: number, type: "percentage" | "fixed" | null) => void;
  setCheckoutUrl: (url: string | null) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      discountCode: null,
      discountAmount: 0,
      discountType: null,
      postalCode: "",
      fulfillment: "delivery",
      orderTiming: "asap",
      scheduledAt: null,

      setPostalCode: (code) => set({ postalCode: code }),
      setFulfillment: (mode) => set({ fulfillment: mode }),
      setOrderTiming: (timing) =>
        set(timing === "asap" ? { orderTiming: timing, scheduledAt: null } : { orderTiming: timing }),
      setScheduledAt: (value) =>
        set({ scheduledAt: value, orderTiming: value ? "scheduled" : "asap" }),

      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existingItem = items.find((i) => i.variantId === item.variantId);
        let added = false;

        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart({
              variantId: item.variantId,
              quantity: item.quantity,
            });
            if (result) {
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: [{ ...item, lineId: result.lineId }],
              });
              added = true;
            }
          } else if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            if (!existingItem.lineId) {
              console.error("Cannot update quantity for item without lineId:", existingItem);
              return;
            }
            const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
            if (result.success) {
              const currentItems = get().items;
              set({
                items: currentItems.map((i) =>
                  i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i,
                ),
              });
              added = true;
            } else if (result.cartNotFound) {
              clearCart();
            }
          } else {
            const result = await addLineToShopifyCart(cartId, {
              variantId: item.variantId,
              quantity: item.quantity,
            });
            if (result.success) {
              const currentItems = get().items;
              set({
                items: [...currentItems, { ...item, lineId: result.lineId ?? null }],
              });
              added = true;
            } else if (result.cartNotFound) {
              clearCart();
            }
          }
        } catch (error) {
          console.error("Failed to add item:", error);
        } finally {
          set({ isLoading: false });
        }

        if (added) {
          trackAddToCart({
            id: item.variantId,
            name: item.product.node.title,
            price: parseFloat(item.price.amount),
            quantity: item.quantity,
            variant: item.variantTitle,
            category: item.product.node.productType,
          });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }

        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;

        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            const currentItems = get().items;
            set({
              items: currentItems.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
            });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to update quantity:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;

        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const currentItems = get().items;
            const newItems = currentItems.filter((i) => i.variantId !== variantId);
            newItems.length === 0 ? clearCart() : set({ items: newItems });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to remove item:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () =>
        set({
          items: [],
          cartId: null,
          checkoutUrl: null,
          discountCode: null,
          discountAmount: 0,
          discountType: null,
        }),

      // Always re-normalize: carts persisted before the domain fix stored a
      // checkout URL on the storefront's own domain, which 404s.
      getCheckoutUrl: () => {
        const url = get().checkoutUrl;
        return url ? formatCheckoutUrl(url) : null;
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
          0,
        );
      },

      getTotalQuantity: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      setDiscount: (code, amount, type) =>
        set({ discountCode: code, discountAmount: amount, discountType: type }),

      setCheckoutUrl: (url) => set({ checkoutUrl: url }),

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;

        set({ isSyncing: true });
        try {
          const cart = await getCart(cartId);
          if (!cart || cart.totalQuantity === 0) {
            clearCart();
          } else if (cart.checkoutUrl) {
            set({ checkoutUrl: formatCheckoutUrl(cart.checkoutUrl) });
          }
        } catch (error) {
          console.error("Failed to sync cart with Shopify:", error);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "shopify-cart",
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persisted: unknown) => {
        const state = persisted as { checkoutUrl?: string | null } | null;
        if (state?.checkoutUrl) {
          return { ...state, checkoutUrl: formatCheckoutUrl(state.checkoutUrl) };
        }
        return state as never;
      },
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
        checkoutUrl: state.checkoutUrl,
        discountCode: state.discountCode,
        discountAmount: state.discountAmount,
        discountType: state.discountType,
        postalCode: state.postalCode,
        fulfillment: state.fulfillment,
        orderTiming: state.orderTiming,
        scheduledAt: state.scheduledAt,
      }),
    },
  ),
);
