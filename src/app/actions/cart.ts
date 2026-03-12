"use server";

import { ecommapsClient } from "@/lib/ecommaps";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import type { EcommapsCart } from "@ecommaps/client";

const CART_COOKIE = "_ecommaps_cart_id";

/**
 * Get the current cart, or null if none exists.
 */
export async function getCart(): Promise<EcommapsCart | null> {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE)?.value;

    if (!cartId) return null;

    try {
        const cart = await ecommapsClient.cart.retrieve(cartId, {
            next: { tags: ["cart"] }
        });
        return cart;
    } catch (error: any) {
        if (error.status === 404) {
            console.warn(`Cart ${cartId} not found, clearing cookie.`);
            cookieStore.delete(CART_COOKIE);
        } else {
            console.error("Failed to fetch cart:", error);
        }
        return null;
    }
}

/**
 * Add item to cart (creates cart if it doesn't exist).
 */
export async function addToCart(productId: string, quantity: number = 1, variantId?: string) {
    const cookieStore = await cookies();
    let cartId = cookieStore.get(CART_COOKIE)?.value;

    try {
        if (!cartId) {
            const newCart = await ecommapsClient.cart.create();
            cartId = newCart.id;
            cookieStore.set(CART_COOKIE, cartId);
        }

        try {
            const updatedCart = await ecommapsClient.cart.addItem(cartId, {
                product_id: productId,
                variant_id: variantId,
                quantity
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            revalidateTag("cart");
            return { success: true, cart: updatedCart };
        } catch (error: any) {
            // If cart not found, clear cookie and try one more time (recursive call will handle it)
            if (error.status === 404) {
                cookieStore.delete(CART_COOKIE);
                return addToCart(productId, quantity, variantId);
            }
            throw error;
        }
    } catch (error) {
        console.error("Failed to add to cart:", error);
        return { success: false, error: "فشل إضافة المنتج إلى السلة" };
    }
}

/**
 * Update quantity of a cart item.
 */
export async function updateCartItem(itemId: string, quantity: number) {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE)?.value;

    if (!cartId) return { success: false, error: "السلة غير موجودة" };

    try {
        const updatedCart = await ecommapsClient.cart.updateItem(cartId, itemId, { quantity });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        revalidateTag("cart");
        return { success: true, cart: updatedCart };
    } catch (error) {
        console.error("Failed to update cart item:", error);
        return { success: false, error: "فشل تحديث الكمية" };
    }
}

/**
 * Remove an item from cart.
 */
export async function removeCartItem(itemId: string) {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE)?.value;

    if (!cartId) return { success: false, error: "السلة غير موجودة" };

    try {
        const updatedCart = await ecommapsClient.cart.removeItem(cartId, itemId);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        revalidateTag("cart");
        return { success: true, cart: updatedCart };
    } catch (error) {
        console.error("Failed to remove cart item:", error);
        return { success: false, error: "فشل إزالة المنتج" };
    }
}

/**
 * Clear the cart cookie (e.g. after order completion).
 */
export async function clearCart() {
    const cookieStore = await cookies();
    cookieStore.delete(CART_COOKIE);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    revalidateTag("cart");
}

/**
 * Create an order from the current cart.
 * Must be a server action because the SDK requires the API key (server-only env var).
 */
export async function createOrder(data: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    customer_wilaya?: string;
    customer_commune?: string;
    shipping_address?: Record<string, string>;
    payment_method?: string;
    customer_notes?: string;
    coupon_code?: string;
}) {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE)?.value;

    if (!cartId) {
        return { success: false, error: "السلة فارغة. أضف منتجات أولاً." };
    }

    try {
        const orderPayload = {
            cart_id: cartId,
            ...data,
        };

        const result = await ecommapsClient.orders.create(orderPayload);

        // Clear cart cookie after successful order
        cookieStore.delete(CART_COOKIE);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        revalidateTag("cart");

        return { success: true, order: result };
    } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        console.error("[createOrder] Error:", error?.message || error);
        const msg = error?.message || "فشل إرسال الطلب";
        return { success: false, error: msg };
    }
}

/**
 * Validate a coupon code.
 */
export async function validateCoupon(code: string, cartTotal?: number, items?: unknown[]) {
    try {
        const result = await ecommapsClient.store.coupons.validate({
            code,
            cart_total: cartTotal,
            items
        });
        return result;
    } catch (error: any) {
        console.error("[validateCoupon] Error:", error?.message || error);
        return { valid: false, message: error?.message || "فشل التحقق من الكوبون" };
    }
}
