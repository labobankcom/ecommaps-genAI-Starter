import { openai } from "@ai-sdk/openai";
import { tool, type UIMessage } from "ai";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  buildSalesAgentTools,
  buildSalesSkillProfile,
  createSalesAgentRuntime,
} from "@ecommaps/ai-sales-agent/server";
import { ecommapsClient } from "@/lib/ecommaps";

export const maxDuration = 30;

const CART_COOKIE = "_ecommaps_cart_id";

type ChatRequestBody = {
  messages?: UIMessage[];
};

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" ? (value as JsonRecord) : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asRecordArray(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function normalizeArabicText(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[أإآ]/g, "ا")
    .replace(/[ة]/g, "ه")
    .replace(/[ى]/g, "ي");
}

function resolveImage(value: JsonRecord): string | null {
  const direct = asString(value.image_url) || asString(value.featured_image) || asString(value.image);
  if (direct) return direct;
  const images = Array.isArray(value.images) ? value.images : [];
  for (const img of images) {
    if (typeof img === "string" && img.trim()) return img;
    if (img && typeof img === "object") {
      const url = asString((img as JsonRecord).url) || asString((img as JsonRecord).src);
      if (url) return url;
    }
  }
  return null;
}

function hasAssistantTurn(messages: UIMessage[]): boolean {
  return messages.some((message) => message.role === "assistant");
}

function getLatestUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message.role !== "user") continue;
    const parts = Array.isArray(message.parts) ? message.parts : [];
    const text = parts
      .map((part) => {
        if (!part || typeof part !== "object") return "";
        const row = part as Record<string, unknown>;
        return typeof row.text === "string" ? row.text : "";
      })
      .join(" ")
      .trim();
    if (text) return text;
  }
  return "";
}

export async function POST(req: Request) {
  const { messages = [] } = (await req.json()) as ChatRequestBody;
  const cookieStore = await cookies();
  let createdCartId: string | null = null;

  const getOrCreateCartId = async (): Promise<string> => {
    const existing = cookieStore.get(CART_COOKIE)?.value;
    if (existing) {
      try {
        await ecommapsClient.cart.retrieve(existing);
        return existing;
      } catch {
        cookieStore.delete(CART_COOKIE);
      }
    }

    const newCart = await ecommapsClient.cart.create();
    createdCartId = newCart.id;
    cookieStore.set(CART_COOKIE, newCart.id);
    return newCart.id;
  };

  const store = await ecommapsClient.store.retrieve().catch(() => null);
  const { systemPromptBlock } = buildSalesSkillProfile({
    store: store as Record<string, unknown> | null,
    isFirstAssistantTurn: !hasAssistantTurn(messages),
  });
  const systemPrompt = `${systemPromptBlock}

قواعد تشغيل الأدوات داخل الشات:
- أسئلة "المجموعات/الكوليكشن" => استخدم أداة getStoreCollections أولاً.
- أسئلة "التخفيضات/الكوبونات/العروض" => استخدم أداة getAvailableDiscounts أولاً.
- أسئلة "السلة/ما في السلة/محتوى السلة" => استخدم أداة getCartSummary أولاً.
- أسئلة السياسات/من نحن/التواصل/الخصوصية/الاسترجاع => استخدم أداة getStorePagesSmart.
- لا تعتذر عن عدم وجود بيانات قبل استدعاء الأداة المناسبة.
- عند فشل أداة، أظهر سببًا مختصرًا وجرّب أداة بديلة مناسبة بدل التوقف.
- لا تكرر نفس الأداة الفاشلة مرتين متتاليتين بنفس المدخلات.
- عند طلب حذف منتج أو تقليل كميته: لا تستخدم addToCart، استخدم أدوات تعديل/حذف السلة.
- جملة مثل "كان 9 أريد 5 فقط" تعني تعديل كمية نفس العنصر وليس إضافة جديدة.`;

  const safeClient = {
    ...ecommapsClient,
    products: {
      ...ecommapsClient.products,
      list: async (params?: Record<string, unknown>, options?: RequestInit) => {
        const nextParams = { ...(params ?? {}) };
        const rawLimit = Number(nextParams.limit ?? 24);
        nextParams.limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(100, Math.trunc(rawLimit))) : 24;
        try {
          return await ecommapsClient.products.list(
            nextParams as Record<string, string | number | boolean | null | undefined>,
            options
          );
        } catch (error) {
          const apiError = error as { status?: number };
          if (apiError?.status === 422 && "offset" in nextParams) {
            const retryParams = { ...nextParams };
            delete retryParams.offset;
            return ecommapsClient.products.list(
              retryParams as Record<string, string | number | boolean | null | undefined>,
              options
            );
          }
          if (apiError?.status === 422) {
            return {
              data: [],
              pagination: { total: 0, limit: Number(nextParams.limit ?? 24), offset: 0, has_more: false },
            };
          }
          throw error;
        }
      },
      search: async (q: string, params?: Record<string, unknown>, options?: RequestInit) => {
        const nextParams = { ...(params ?? {}) };
        const rawLimit = Number(nextParams.limit ?? 12);
        nextParams.limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(50, Math.trunc(rawLimit))) : 12;
        const normalizedQuery = typeof q === "string" ? q.trim() : "";
        if (!normalizedQuery) {
          return {
            data: [],
            pagination: { total: 0, limit: Number(nextParams.limit ?? 12), offset: 0, has_more: false },
            query: "",
          };
        }
        try {
          return await ecommapsClient.products.search(
            normalizedQuery,
            nextParams as Record<string, string | number | boolean | null | undefined>,
            options
          );
        } catch (error) {
          const apiError = error as { status?: number };
          if (apiError?.status === 422) {
            return {
              data: [],
              pagination: { total: 0, limit: Number(nextParams.limit ?? 12), offset: 0, has_more: false },
              query: normalizedQuery,
            };
          }
          throw error;
        }
      },
    },
    cart: {
      ...ecommapsClient.cart,
      addItem: async (
        cartId: string,
        body: { product_id: string; variant_id?: string; quantity: number },
        options?: RequestInit
      ) => {
        const normalizedQuantity = Number.isFinite(body.quantity) ? Math.max(1, Math.trunc(body.quantity)) : 1;
        const normalizedVariantId = body.variant_id && body.variant_id.trim() ? body.variant_id : undefined;
        try {
          return await ecommapsClient.cart.addItem(
            cartId,
            {
              product_id: body.product_id,
              variant_id: normalizedVariantId,
              quantity: normalizedQuantity,
            },
            options
          );
        } catch (error) {
          const apiError = error as { status?: number };
          if (apiError?.status === 422 && normalizedVariantId) {
            return await ecommapsClient.cart.addItem(
              cartId,
              {
                product_id: body.product_id,
                quantity: normalizedQuantity,
              },
              options
            );
          }
          throw error;
        }
      },
    },
  };

  const latestUserText = normalizeArabicText(getLatestUserText(messages));
  const hasEditIntent = /(احذف|ازل|امسح|حذف|ازاله|قلل|خفف|انقص|اجعلها|عدل|تعديل|بدل|بدلها|استبدل)/.test(latestUserText);
  const hasAddIntent = /(اضف|اضافه|اريد اضافه|زد|زود|اختر|اطلب)/.test(latestUserText);
  const shouldBlockAddTools = hasEditIntent && !hasAddIntent;

  const baseTools = buildSalesAgentTools({
    client: safeClient,
    getOrCreateCartId,
  });
  const baseAddToCart = (baseTools as unknown as Record<string, unknown>).addToCart as
    | { execute?: (input: { product_id: string; quantity?: number; variant_id?: string; color?: string; size?: string }) => Promise<unknown> }
    | undefined;
  const baseAddMultipleToCart = (baseTools as unknown as Record<string, unknown>).addMultipleToCart as
    | { execute?: (input: { items: Array<{ product_id: string; quantity?: number; variant_id?: string; color?: string; size?: string }> }) => Promise<unknown> }
    | undefined;

  const tools = {
    ...baseTools,
    addToCart: tool({
      description: "إضافة منتج واحد إلى السلة مع اختيار متغير دقيق عند الحاجة.",
      inputSchema: z.object({
        product_id: z.string(),
        quantity: z.number().int().min(1).max(20).optional(),
        variant_id: z.string().optional(),
        color: z.string().optional(),
        size: z.string().optional(),
      }),
      execute: async (input) => {
        if (shouldBlockAddTools) {
          return {
            success: false,
            error: "هذه الرسالة تبدو طلب تعديل/حذف للسلة، استخدم updateCartItemQuantity أو removeCartItem بدل الإضافة.",
            blocked_by_intent_guard: true,
          };
        }
        if (!baseAddToCart?.execute) {
          return { success: false, error: "أداة addToCart غير متاحة حاليًا." };
        }
        return baseAddToCart.execute(input);
      },
    }),
    addMultipleToCart: tool({
      description: "إضافة عدة منتجات للسلة في طلب واحد.",
      inputSchema: z.object({
        items: z
          .array(
            z.object({
              product_id: z.string(),
              quantity: z.number().int().min(1).max(20).optional(),
              variant_id: z.string().optional(),
              color: z.string().optional(),
              size: z.string().optional(),
            })
          )
          .min(1)
          .max(8),
      }),
      execute: async (input) => {
        if (shouldBlockAddTools) {
          return {
            success: false,
            error: "النية الحالية تعديل/حذف للسلة، لا تضف عناصر جديدة واستخدم أدوات التعديل المناسبة.",
            blocked_by_intent_guard: true,
          };
        }
        if (!baseAddMultipleToCart?.execute) {
          return { success: false, error: "أداة addMultipleToCart غير متاحة حاليًا." };
        }
        return baseAddMultipleToCart.execute(input);
      },
    }),
    getCartSummary: tool({
      description: "احصل على ملخص السلة الحالية للمشتري.",
      inputSchema: z.object({}),
      execute: async () => {
        const cartId = cookieStore.get(CART_COOKIE)?.value;
        if (!cartId) {
          return { success: false, has_cart: false };
        }
        try {
          const cart = await ecommapsClient.cart.retrieve(cartId);
          const items = Array.isArray(cart.items)
            ? cart.items.map((item) => ({
                item_id: item.id,
                product_id: item.product_id ?? null,
                name: item.product_name ?? "منتج",
                quantity: item.quantity ?? 1,
                subtotal: item.subtotal ?? (item.product_price ?? 0) * (item.quantity ?? 1),
                currency: asString((cart as unknown as JsonRecord).currency) || "DZD",
              }))
            : [];
          return {
            success: true,
            has_cart: true,
            cart_id: cart.id,
            cart: cart as unknown as JsonRecord,
            cart_summary: {
              items,
              subtotal: cart.subtotal ?? 0,
              currency: asString((cart as unknown as JsonRecord).currency) || "DZD",
            },
          };
        } catch (error) {
          console.error("[chat:getCartSummary] Error:", error);
          return { success: false, has_cart: false, error: "تعذر جلب بيانات السلة." };
        }
      },
    }),
    updateCartItemQuantity: tool({
      description:
        "تحديث كمية عنصر في السلة بذكاء عبر item_id أو product_id أو product_name. استخدمها عند طلب: قلل/زِد/اجعلها X.",
      inputSchema: z.object({
        quantity: z.number().int().min(0).max(200),
        item_id: z.string().optional(),
        product_id: z.string().optional(),
        product_name: z.string().optional(),
      }),
      execute: async ({ quantity, item_id, product_id, product_name }) => {
        const cartId = cookieStore.get(CART_COOKIE)?.value;
        if (!cartId) {
          return { success: false, error: "لا توجد سلة نشطة.", cart_id: null, cart: null };
        }

        try {
          const cart = await ecommapsClient.cart.retrieve(cartId);
          const items = Array.isArray(cart.items) ? cart.items : [];
          const targetName = product_name ? normalizeArabicText(product_name) : null;

          const target = items.find((item) => {
            if (item_id && item.id === item_id) return true;
            if (product_id && item.product_id === product_id) return true;
            if (targetName && typeof item.product_name === "string") {
              const name = normalizeArabicText(item.product_name);
              return name.includes(targetName) || targetName.includes(name);
            }
            return false;
          });

          if (!target) {
            return {
              success: false,
              error: "تعذر تحديد عنصر السلة المطلوب تعديله. أرسل اسم المنتج أو اعرض السلة أولاً.",
              cart_id: cart.id,
              cart: cart as unknown as JsonRecord,
            };
          }

          const nextCart =
            quantity <= 0
              ? await ecommapsClient.cart.removeItem(cart.id, target.id)
              : await ecommapsClient.cart.updateItem(cart.id, target.id, { quantity });

          return {
            success: true,
            message:
              quantity <= 0
                ? `تم حذف "${target.product_name ?? "المنتج"}" من السلة.`
                : `تم تحديث كمية "${target.product_name ?? "المنتج"}" إلى ${quantity}.`,
            cart_id: nextCart.id,
            cart: nextCart as unknown as JsonRecord,
            resolved_item_id: target.id,
            resolved_product_id: target.product_id,
            quantity,
          };
        } catch (error) {
          console.error("[chat:updateCartItemQuantity] Error:", error);
          return { success: false, error: "تعذر تحديث الكمية في السلة.", cart_id: cartId, cart: null };
        }
      },
    }),
    removeCartItem: tool({
      description:
        "حذف عنصر من السلة باستخدام item_id أو product_id أو product_name. استخدمها عند: احذف/أزل/امسح.",
      inputSchema: z.object({
        item_id: z.string().optional(),
        product_id: z.string().optional(),
        product_name: z.string().optional(),
      }),
      execute: async ({ item_id, product_id, product_name }) => {
        const cartId = cookieStore.get(CART_COOKIE)?.value;
        if (!cartId) {
          return { success: false, error: "لا توجد سلة نشطة.", cart_id: null, cart: null };
        }

        try {
          const cart = await ecommapsClient.cart.retrieve(cartId);
          const items = Array.isArray(cart.items) ? cart.items : [];
          const targetName = product_name ? normalizeArabicText(product_name) : null;

          const target = items.find((item) => {
            if (item_id && item.id === item_id) return true;
            if (product_id && item.product_id === product_id) return true;
            if (targetName && typeof item.product_name === "string") {
              const name = normalizeArabicText(item.product_name);
              return name.includes(targetName) || targetName.includes(name);
            }
            return false;
          });

          if (!target) {
            return {
              success: false,
              error: "لم أتمكن من تحديد المنتج المطلوب حذفه من السلة.",
              cart_id: cart.id,
              cart: cart as unknown as JsonRecord,
            };
          }

          const nextCart = await ecommapsClient.cart.removeItem(cart.id, target.id);
          return {
            success: true,
            message: `تم حذف "${target.product_name ?? "المنتج"}" من السلة.`,
            cart_id: nextCart.id,
            cart: nextCart as unknown as JsonRecord,
            resolved_item_id: target.id,
            resolved_product_id: target.product_id,
          };
        } catch (error) {
          console.error("[chat:removeCartItem] Error:", error);
          return { success: false, error: "تعذر حذف المنتج من السلة.", cart_id: cartId, cart: null };
        }
      },
    }),
    getStoreCollections: tool({
      description: "اعرض مجموعات المتجر النشطة مع الصور والروابط.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(24).optional(),
      }),
      execute: async ({ limit = 8 }) => {
        try {
          const response = await ecommapsClient.collections.list();
          const rows = asRecordArray(asRecord(response).data);
          const collections = rows.slice(0, limit).map((item) => {
            const slug = asString(item.slug);
            return {
              id: asString(item.id) || null,
              title: asString(item.title) || "مجموعة",
              slug: slug || null,
              description: asString(item.description) || null,
              image: resolveImage(item),
              url: slug ? `/collections/${slug}` : null,
            };
          });
          return {
            success: true,
            total: rows.length,
            collections,
          };
        } catch (error) {
          console.error("[chat:getStoreCollections] Error:", error);
          return { success: false, collections: [], error: "تعذر جلب المجموعات حاليًا." };
        }
      },
    }),
    getAvailableDiscounts: tool({
      description: "تحقق من العروض النشطة وكوبونات الخصم باستخدام بيانات السلة الحالية.",
      inputSchema: z.object({
        coupon_code: z.string().optional(),
        cart_total: z.number().optional(),
      }),
      execute: async ({ coupon_code = "", cart_total }) => {
        try {
          const cartId = cookieStore.get(CART_COOKIE)?.value;
          let resolvedCartTotal = typeof cart_total === "number" ? cart_total : undefined;
          let items: unknown[] | undefined = undefined;

          if (cartId) {
            try {
              const cart = await ecommapsClient.cart.retrieve(cartId);
              if (typeof cart.subtotal === "number" && resolvedCartTotal === undefined) {
                resolvedCartTotal = cart.subtotal;
              }
              if (Array.isArray(cart.items)) {
                items = cart.items as unknown[];
              }
            } catch {
              // Ignore cart read errors and continue with explicit params
            }
          }

          const raw = await ecommapsClient.store.coupons.validate({
            code: coupon_code.trim(),
            cart_total: resolvedCartTotal,
            items,
          });
          const payload = asRecord(raw);
          const checkedCoupon = coupon_code.trim() || null;
          const checkedCouponValid =
            checkedCoupon !== null && typeof payload.valid === "boolean" ? Boolean(payload.valid) : null;
          const checkedCouponMessage =
            checkedCoupon !== null ? asString(payload.message) || null : null;

          const productMap = new Map<string, JsonRecord>();
          const collectionMap = new Map<string, JsonRecord>();

          const allProductIds = new Set<string>();
          const allCollectionIds = new Set<string>();
          for (const promo of [...asRecordArray(payload.applied_discounts), ...asRecordArray(payload.available_promotions)]) {
            const targetType = asString(promo.target_type);
            const targetIds = Array.isArray(promo.target_ids) ? promo.target_ids.map((id) => String(id)) : [];
            if (targetType === "products") targetIds.forEach((id) => allProductIds.add(id));
            if (targetType === "collections") targetIds.forEach((id) => allCollectionIds.add(id));
          }

          if (allProductIds.size > 0) {
            const productsResponse = await ecommapsClient.products.list({ limit: 100 }).catch(() => null);
            const products = asRecordArray(asRecord(productsResponse).data);
            for (const item of products) {
              const id = asString(item.id);
              if (id && allProductIds.has(id)) productMap.set(id, item);
            }
          }

          if (allCollectionIds.size > 0) {
            const collectionsResponse = await ecommapsClient.collections.list().catch(() => null);
            const collections = asRecordArray(asRecord(collectionsResponse).data);
            for (const item of collections) {
              const id = asString(item.id);
              if (id && allCollectionIds.has(id)) collectionMap.set(id, item);
            }
          }

          const fromApplied = asRecordArray(payload.applied_discounts).map((promo) => {
            const targetType = asString(promo.target_type);
            const targetIds = Array.isArray(promo.target_ids) ? promo.target_ids.map((id) => String(id)) : [];
            return {
              id: asString(promo.id) || null,
              code: asString(promo.code) || null,
              title: asString(promo.message) || asString(promo.code) || "عرض مطبق",
              message: asString(promo.message) || null,
              discount_type: asString(promo.discount_type) || null,
              discount_value: asNumber(promo.discount_value, 0),
              discount_amount: asNumber(promo.discount_amount, 0),
              promotion_type: asString(promo.promotion_type) || null,
              target_type: targetType || null,
              target_ids: targetIds,
              status: "applied_now" as const,
              status_label: "مطبق الآن",
              status_reason: "تم تطبيق هذا العرض على السلة الحالية.",
              products:
                targetType === "products"
                  ? targetIds
                      .map((id) => productMap.get(id))
                      .filter(Boolean)
                      .map((item) => {
                        const record = asRecord(item);
                        return {
                          id: asString(record.id),
                          slug: asString(record.slug),
                          name: asString(record.name) || asString(record.title) || "منتج",
                          description: asString(record.description) || null,
                          price: typeof record.price === "number" ? record.price : null,
                          currency: asString(record.currency) || "DZD",
                          image: resolveImage(record),
                          available: Boolean(record.available ?? record.is_active ?? true),
                        };
                      })
                  : [],
              collections:
                targetType === "collections"
                  ? targetIds
                      .map((id) => collectionMap.get(id))
                      .filter(Boolean)
                      .map((item) => {
                        const record = asRecord(item);
                        const slug = asString(record.slug);
                        return {
                          id: asString(record.id) || null,
                          title: asString(record.title) || "مجموعة",
                          slug: slug || null,
                          description: asString(record.description) || null,
                          image: resolveImage(record),
                          url: slug ? `/collections/${slug}` : null,
                        };
                      })
                  : [],
            };
          });

          const fromAvailable = asRecordArray(payload.available_promotions).map((promo) => {
            const promoType = asString(promo.promotion_type);
            const targetType = asString(promo.target_type);
            const targetIds = Array.isArray(promo.target_ids) ? promo.target_ids.map((id) => String(id)) : [];
            return {
              id: asString(promo.id) || null,
              code: asString(promo.code) || null,
              title: asString(promo.message) || asString(promo.code) || "عرض متاح",
              message: asString(promo.message) || null,
              discount_type: asString(promo.discount_type) || null,
              discount_value: asNumber(promo.discount_value, 0),
              discount_amount: asNumber(promo.discount_amount, 0),
              min_order_amount: typeof promo.min_order_amount === "number" ? promo.min_order_amount : null,
              promotion_type: promoType || null,
              target_type: targetType || null,
              target_ids: targetIds,
              status: promoType === "code" ? ("code_required" as const) : ("eligible_with_conditions" as const),
              status_label: promoType === "code" ? "يتطلب كود" : "متاح",
              status_reason:
                promoType === "code"
                  ? "يمكنك تفعيل هذا العرض عبر إدخال كود الخصم."
                  : "عرض متاح حسب شروط السلة الحالية.",
            };
          });

          const promotions = [...fromApplied, ...fromAvailable];
          return {
            success: true,
            checked_coupon: checkedCoupon,
            checked_coupon_valid: checkedCouponValid,
            checked_coupon_message: checkedCouponMessage,
            promotions,
          };
        } catch (error) {
          console.error("[chat:getAvailableDiscounts] Error:", error);
          return {
            success: false,
            checked_coupon: coupon_code.trim() || null,
            checked_coupon_valid: false,
            checked_coupon_message: "تعذر التحقق من العروض حالياً.",
            promotions: [],
          };
        }
      },
    }),
  };

  const result = await createSalesAgentRuntime({
    model: openai("gpt-4o-mini"),
    systemPrompt,
    messages,
    tools,
    maxSteps: 6,
  });

  const response = result.toUIMessageStreamResponse({
    sendReasoning: true,
  });

  if (createdCartId) {
    response.headers.append(
      "Set-Cookie",
      `${CART_COOKIE}=${createdCartId}; Path=/; HttpOnly; SameSite=Lax`
    );
  }

  return response;
}
