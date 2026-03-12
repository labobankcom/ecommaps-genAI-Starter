import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { EcommapsCart } from '@ecommaps/client';

interface CartState {
    // UI state
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;

    // Cart data state
    cart: EcommapsCart | null;
    isLoading: boolean;
    setCart: (cart: EcommapsCart | null) => void;
    setLoading: (loading: boolean) => void;

    // Computed helpers
    itemsCount: () => number;
    subtotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            // UI state
            isOpen: false,
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

            // Cart data
            cart: null,
            isLoading: false,
            setCart: (cart) => set({ cart }),
            setLoading: (isLoading) => set({ isLoading }),

            // Computed
            itemsCount: () => {
                const { cart } = get();
                return cart?.items_count || 0;
            },
            subtotal: () => {
                const { cart } = get();
                return cart?.subtotal || 0;
            },
        }),
        {
            name: 'ecommaps-cart',
            storage: createJSONStorage(() => {
                // SSR-safe: return a no-op storage if window not available
                if (typeof window === 'undefined') {
                    return {
                        getItem: () => null,
                        setItem: () => { },
                        removeItem: () => { },
                    };
                }
                return localStorage;
            }),
            // Only persist cart data, not UI state or loading
            partialize: (state) => ({
                cart: state.cart,
            }),
        }
    )
);
