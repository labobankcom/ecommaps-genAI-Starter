import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
    id: string;
    title: string;
    price: string;
    image: string;
    slug: string;
}

interface WishlistState {
    // UI State
    isOpen: boolean;
    openWishlist: () => void;
    closeWishlist: () => void;
    toggleWishlist: () => void;

    // Data State
    items: WishlistItem[];
    toggleItem: (item: WishlistItem) => void;
    removeItem: (id: string) => void;
    clearWishlist: () => void;
    itemsCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            // UI State
            isOpen: false,
            openWishlist: () => set({ isOpen: true }),
            closeWishlist: () => set({ isOpen: false }),
            toggleWishlist: () => set((state) => ({ isOpen: !state.isOpen })),

            // Data State
            items: [],
            toggleItem: (item) => {
                const currentItems = get().items;
                const exists = currentItems.some((i) => i.id === item.id);
                if (exists) {
                    set({ items: currentItems.filter((i) => i.id !== item.id) });
                } else {
                    set({ items: [...currentItems, item] });
                }
            },
            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                })),
            clearWishlist: () => set({ items: [] }),
            itemsCount: () => get().items.length,
        }),
        {
            name: "ecommaps-wishlist-storage",
            // Only persist items, not UI state
            partialize: (state) => ({
                items: state.items,
            }),
        }
    )
);
