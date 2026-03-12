"use server";

import { ecommapsClient } from "@/lib/ecommaps";
import type { EcommapsCollection } from "@ecommaps/client";

/**
 * Fetch all active collections.
 */
export async function getCollections(): Promise<EcommapsCollection[]> {
    try {
        const res = await ecommapsClient.collections.list({
            next: { revalidate: 120, tags: ["collections"] },
        });
        return res.data || [];
    } catch (error) {
        console.error("[getCollections] Error:", error);
        return [];
    }
}

/**
 * Fetch a single collection with its products.
 */
export async function getCollection(slug: string, limit = 20, offset = 0) {
    try {
        return await ecommapsClient.collections.retrieve(slug, limit, offset, {
            next: { revalidate: 60, tags: [`collection-${slug}`] },
        });
    } catch (error) {
        console.error(`[getCollection] Error for slug "${slug}":`, error);
        return null;
    }
}
