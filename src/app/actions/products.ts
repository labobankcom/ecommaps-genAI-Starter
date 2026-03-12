"use server";

import { ecommapsClient } from "@/lib/ecommaps";
import type { EcommapsProduct, PaginatedResponse } from "@ecommaps/client";

/**
 * Fetch a paginated list of products with optional filters.
 */
export async function getProducts(params?: {
    limit?: number;
    offset?: number;
    category?: string;
    collection?: string;
    sort?: string;
    q?: string;
    in_stock?: boolean;
    min_price?: string | number;
    max_price?: string | number;
}): Promise<PaginatedResponse<EcommapsProduct>> {
    try {
        const queryParams: Record<string, string | number> = {};
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.offset) queryParams.offset = params.offset;
        if (params?.category) queryParams.category = params.category;
        if (params?.collection) queryParams.collection = params.collection;
        if (params?.sort) queryParams.sort = params.sort;
        if (params?.q) queryParams.q = params.q;
        if (params?.in_stock !== undefined) queryParams.in_stock = params.in_stock ? "true" : "false";
        if (params?.min_price !== undefined) queryParams.min_price = params.min_price;
        if (params?.max_price !== undefined) queryParams.max_price = params.max_price;

        return await ecommapsClient.products.list(queryParams, {
            next: { revalidate: 60, tags: ["products"] },
        });
    } catch (error) {
        console.error("[getProducts] Error:", error);
        return { data: [], pagination: { total: 0, limit: 20, offset: 0, has_more: false } };
    }
}

/**
 * Fetch a single product by slug.
 */
export async function getProduct(slug: string): Promise<EcommapsProduct | null> {
    try {
        return await ecommapsClient.products.retrieve(slug, {
            next: { revalidate: 60, tags: [`product-${slug}`] },
        });
    } catch (error) {
        console.error(`[getProduct] Error for slug "${slug}":`, error);
        return null;
    }
}
