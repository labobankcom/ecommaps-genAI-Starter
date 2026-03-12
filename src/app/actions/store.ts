"use server";

import { ecommapsClient } from "@/lib/ecommaps";
import type { EcommapsSite } from "@ecommaps/client";

/**
 * Fetch store info (name, logo, contact, social_links).
 */
export async function getStoreInfo(): Promise<EcommapsSite | null> {
    try {
        return await ecommapsClient.store.retrieve({
            next: { revalidate: 300, tags: ["store"] },
        });
    } catch (error) {
        console.error("[getStoreInfo] Error:", error);
        return null;
    }
}

/**
 * Fetch store navigation menus.
 */
export async function getStoreMenus() {
    try {
        return await ecommapsClient.store.menus.list({
            next: { revalidate: 300, tags: ["menus"] },
        });
    } catch (error) {
        console.error("[getStoreMenus] Error:", error);
        return [];
    }
}
