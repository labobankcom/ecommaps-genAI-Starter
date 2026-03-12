"use server";

import { ecommapsClient } from "@/lib/ecommaps";
import { withAuth, getAuthToken } from "@/lib/auth";

type OrderRecord = Record<string, unknown>;
type OrdersResult = {
    data: OrderRecord[];
    pagination: Record<string, unknown>;
};

function toOrderRecords(value: unknown): OrderRecord[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is OrderRecord => typeof item === "object" && item !== null);
}

/**
 * Fetch the current customer's orders.
 */
export async function getMyOrders(limit = 20, offset = 0) {
    try {
        const token = await getAuthToken();
        if (!token) {
            return {
                data: [],
                pagination: { total: 0, limit, offset, has_more: false },
            } satisfies OrdersResult;
        }

        const options = await withAuth();
        const result = await ecommapsClient.orders.list({
            ...options,
            params: { limit, offset },
        });

        const rawData = (result as { data?: unknown })?.data;
        const rawPagination = (result as { pagination?: unknown })?.pagination;

        return {
            data: toOrderRecords(rawData),
            pagination:
                rawPagination && typeof rawPagination === "object"
                    ? (rawPagination as Record<string, unknown>)
                    : { total: 0, limit, offset, has_more: false },
        } satisfies OrdersResult;
    } catch (error) {
        console.error("[getMyOrders] Error:", error);
        return {
            data: [],
            pagination: { total: 0, limit, offset, has_more: false },
        } satisfies OrdersResult;
    }
}

/**
 * Track a specific order by its order number.
 */
export async function trackOrder(orderNumber: string) {
    try {
        return await ecommapsClient.orders.retrieve(orderNumber);
    } catch (error) {
        console.error(`[trackOrder] Error for order "${orderNumber}":`, error);
        return null;
    }
}
