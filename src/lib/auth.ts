import { cookies } from "next/headers";

const AUTH_COOKIE = "_ecommaps_auth_token";

/**
 * Get the stored JWT auth token from cookies (server-side).
 */
export async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_COOKIE)?.value || null;
}

/**
 * Set the auth token in cookies (server-side).
 */
export async function setAuthToken(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 8, // 8 days (matching backend config)
        path: "/",
    });
}

/**
 * Clear the auth token from cookies (server-side).
 */
export async function clearAuthToken() {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE);
}

/**
 * Build request options with Authorization header if user is logged in.
 */
export async function withAuth(options?: RequestInit): Promise<RequestInit> {
    const token = await getAuthToken();
    if (!token) return options || {};

    return {
        ...options,
        headers: {
            ...(options?.headers || {}),
            Authorization: `Bearer ${token}`,
        },
    };
}
