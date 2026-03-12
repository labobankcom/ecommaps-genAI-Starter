"use server";

import { ecommapsClient } from "@/lib/ecommaps";
import type { EcommapsProduct } from "@ecommaps/client";

/**
 * Search products by query.
 */
export async function searchProducts(q: string): Promise<EcommapsProduct[]> {
    if (!q || q.trim().length < 2) {
        return [];
    }

    try {
        const response = await ecommapsClient.products.search(q, {
            limit: 10,
        });
        return response.data;
    } catch (error) {
        console.error("❌ [searchProducts] Error:", error);
        return [];
    }
}
