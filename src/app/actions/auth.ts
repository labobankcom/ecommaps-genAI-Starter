"use server";

import { ecommapsClient } from "@/lib/ecommaps";
import { getAuthToken, setAuthToken, clearAuthToken, withAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Login a customer to a store.
 */
export async function loginAction(email: string, password: string) {
    try {
        const result = await ecommapsClient.auth.login({ email, password });
        await setAuthToken(result.token);
        return { success: true, user: result.user };
    } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        console.error("[loginAction] Error:", error?.message || error);
        const msg = error?.message || "فشل تسجيل الدخول";
        if (msg === "Invalid credentials" || msg.includes("Invalid")) {
            return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
        }
        return { success: false, error: msg };
    }
}

/**
 * Register a new customer.
 */
export async function signupAction(data: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
}) {
    try {
        // Ensure we send the correct payload structure
        const payload: Record<string, string | null> = {
            email: data.email,
            password: data.password,
            full_name: data.full_name,
        };
        if (data.phone) payload.phone = data.phone;

        const result = await ecommapsClient.auth.signup(payload);
        await setAuthToken(result.token);
        return { success: true, user: result.user };
    } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        console.error("[signupAction] Full error:", JSON.stringify(error, null, 2));
        console.error("[signupAction] Error message:", error?.message);
        const msg = error?.message || "فشل إنشاء الحساب";
        if (msg.includes("already registered")) {
            return { success: false, error: "هذا البريد الإلكتروني مسجل مسبقاً" };
        }
        if (msg.includes("Internal Server Error") || msg.includes("500")) {
            return { success: false, error: "خطأ في الخادم. تأكد من صحة البيانات وحاول مرة أخرى." };
        }
        return { success: false, error: msg };
    }
}

/**
 * Get the current authenticated customer's details.
 */
export async function getCustomer() {
    try {
        const token = await getAuthToken();
        if (!token) return null;

        const options = await withAuth();
        const result = await ecommapsClient.auth.me(options);
        return result.customer;
    } catch (error) {
        console.error("[getCustomer] Error:", error);
        return null;
    }
}

/**
 * Check if user is logged in (lightweight check).
 */
export async function isAuthenticated(): Promise<boolean> {
    const token = await getAuthToken();
    return !!token;
}

/**
 * Logout — clear the auth token and redirect.
 */
export async function logoutAction() {
    await clearAuthToken();
    redirect("/");
}

/**
 * Add address to the current customer.
 */
export async function addAddressAction(data: {
    line1: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    phone: string;
    label?: string;
    is_default?: boolean;
}) {
    try {
        const options = await withAuth();
        const result = await ecommapsClient.auth.addAddress(data, options);
        return { success: true, address: result.address };
    } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        console.error("[addAddressAction] Error:", error);
        return { success: false, error: error?.message || "فشل إضافة العنوان" };
    }
}

/**
 * Set an address as default
 */
export async function setDefaultAddressAction(addressId: string) {
    try {
        const options = await withAuth();
        const result = await ecommapsClient.auth.setDefaultAddress(addressId, options);
        revalidatePath("/account");
        return { success: true, addresses: result.addresses };
    } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        console.error("[setDefaultAddressAction] Error:", error);
        return { success: false, error: error?.message || "فشل تعيين العنوان كافتراضي" };
    }
}

/**
 * Delete an address
 */
export async function deleteAddressAction(addressId: string) {
    try {
        const options = await withAuth();
        const result = await ecommapsClient.auth.deleteAddress(addressId, options);
        revalidatePath("/account");
        return { success: true, addresses: result.addresses };
    } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        console.error("[deleteAddressAction] Error:", error);
        return { success: false, error: error?.message || "فشل حذف العنوان" };
    }
}

