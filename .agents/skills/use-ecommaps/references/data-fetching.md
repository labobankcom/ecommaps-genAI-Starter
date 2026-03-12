# Data Fetching Reference

<description>
This reference guides the AI on how to fetch data (products, cart, search results) inside the Ecommaps GenAI Starter using the preferred Ecommaps HTTP Client SDK methods and Next.js Server Actions.
</description>

<context>
- Ecommaps relies on `@ecommaps/client` for all storefront API calls.
- **Local Wrapper:** The local instance is always imported from `import { ecommapsClient } from "@/lib/ecommaps"`. DO NOT instantiate a new client manually. 
- **Next.js Paradigms:** We prefer fetching data in **Server Components** or **Server Actions** (`"use server"`) to protect credentials.
</context>

<instructions>
1. **Always use the SDK Wrapper.** Do not use raw `fetch` for Ecommaps APIs. Use `ecommapsClient.products.list()`, `ecommapsClient.store.retrieve()`, etc.
2. **Next.js Caching:** When calling the SDK, pass Next.js fetch options via the second argument: `ecommapsClient.products.retrieve(slug, { next: { revalidate: 60, tags: [\`product-\${slug}\`] } })`.
3. **Handle Errors Safely:** Wrap calls in `try/catch`. Return safe fallbacks (e.g. `{ data: [], pagination: { total: 0, limit: 20, offset: 0, has_more: false } }` for paginated lists) instead of crashing the UI.
4. **Cart Management:** Cart state relies on cookies. Import `cookies` from `next/headers` and read/write the `_ecommaps_cart_id` cookie. After mutations, call `revalidateTag("cart")`.
</instructions>

<examples>
<example>
### Server Action: Fetching Paginated Products
```typescript
"use server";
import { ecommapsClient } from "@/lib/ecommaps";
import type { EcommapsProduct, PaginatedResponse } from "@ecommaps/client";

export async function getProducts(params?: {
    limit?: number; offset?: number; category?: string; q?: string;
}): Promise<PaginatedResponse<EcommapsProduct>> {
    try {
        const queryParams: Record<string, string | number> = {};
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.category) queryParams.category = params.category;
        
        return await ecommapsClient.products.list(queryParams, {
            next: { revalidate: 60, tags: ["products"] },
        });
    } catch (error) {
        console.error("[getProducts] Error:", error);
        return { data: [], pagination: { total: 0, limit: 20, offset: 0, has_more: false } };
    }
}
```
</example>

<example>
### Server Action: Cart Mutation with Cookies
```typescript
"use server";
import { ecommapsClient } from "@/lib/ecommaps";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

const CART_COOKIE = "_ecommaps_cart_id";

export async function addToCart(productId: string, quantity: number = 1, variantId?: string) {
    const cookieStore = await cookies();
    let cartId = cookieStore.get(CART_COOKIE)?.value;

    try {
        if (!cartId) {
            const newCart = await ecommapsClient.cart.create();
            cartId = newCart.id;
            cookieStore.set(CART_COOKIE, cartId);
        }
        const updatedCart = await ecommapsClient.cart.addItem(cartId, {
            product_id: productId,
            variant_id: variantId,
            quantity
        });
        
        revalidateTag("cart");
        return { success: true, cart: updatedCart };
    } catch (error) {
        return { success: false, error: "فشل إضافة المنتج إلى السلة" };
    }
}
```
</example>
</examples>

<execution-rules>
- Do not assume the SDK shape. Use `import type { EcommapsProduct, EcommapsCart, EcommapsMenu } from "@ecommaps/client"`.
- Use the standard `data` property when unpacking paginated lists (e.g. `result.data`).
- Always use `@/lib/ecommaps` for the client instance.
</execution-rules>
