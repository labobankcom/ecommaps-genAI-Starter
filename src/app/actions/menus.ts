"use server";

import { ecommapsClient } from "@/lib/ecommaps";

export interface MenuLink {
    title: string;
    url: string | null;
    type?: string | null;
    position?: number;
    children?: MenuLink[];
}

export interface StoreMenu {
    id: string;
    title: string;
    handle: string;
    items?: MenuLink[];
}

// Utility to normalize legacy or incorrect URLs from the API
function normalizeUrl(url: string | null): string {
    if (!url) return "#";
    // Fix collection pluralization mismatch
    let normalized = url.replace("/collection/", "/collections/");
    // Fix product singularization mismatch (user request)
    normalized = normalized.replace("/products/", "/product/");
    return normalized;
}

const normalizeMenuItems = (items?: MenuLink[]): MenuLink[] => {
    if (!items) return [];
    return items.map(item => ({
        ...item,
        url: normalizeUrl(item.url),
        children: normalizeMenuItems(item.children)
    }));
};

export async function getStoreMenus(): Promise<StoreMenu[]> {
    try {
        const res = await ecommapsClient.store.menus.list({
            next: { revalidate: 300, tags: ["menus"] },
        });

        return res.map((menu) => ({
            ...menu,
            items: normalizeMenuItems(menu.items)
        }));
    } catch (error) {
        console.error("[getStoreMenus] Error:", error);
        return [];
    }
}

export async function getMenuByHandle(handle: string): Promise<StoreMenu | null> {
    try {
        const res = await ecommapsClient.store.menus.retrieve(handle, {
            next: { revalidate: 300, tags: [`menu-${handle}`] },
        });

        if (!res) return null;

        return {
            ...res,
            items: normalizeMenuItems(res.items)
        };
    } catch (error) {
        console.error(`[getMenuByHandle] Error fetching ${handle}:`, error);
        return null;
    }
}

export async function getPages() {
    try {
        return await ecommapsClient.store.pages.list({
            next: { revalidate: 300, tags: ["pages"] },
        });
    } catch (error) {
        console.error("[getPages] Error:", error);
        return [];
    }
}

export async function getPageBySlug(slug: string) {
    try {
        return await ecommapsClient.store.pages.retrieve(slug, {
            next: { revalidate: 300, tags: [`page-${slug}`] },
        });
    } catch (error) {
        console.error(`[getPageBySlug] Error fetching ${slug}:`, error);
        return null;
    }
}

export async function getBlogs() {
    try {
        return await ecommapsClient.store.blogs.list({
            next: { revalidate: 300, tags: ["blogs"] },
        });
    } catch (error) {
        console.error("[getBlogs] Error:", error);
        return [];
    }
}

export async function getBlogBySlug(slug: string) {
    try {
        return await ecommapsClient.store.blogs.retrieve(slug, {
            next: { revalidate: 300, tags: [`blog-${slug}`] },
        });
    } catch (error) {
        console.error(`[getBlogBySlug] Error fetching ${slug}:`, error);
        return null;
    }
}
