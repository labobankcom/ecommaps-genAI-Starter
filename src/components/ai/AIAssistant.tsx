"use client";

import { useEffect, useMemo, useRef, useState, type FC, type ReactNode } from "react";
import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  MessagePrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  AuiIf,
  useMessageTiming,
  useAuiState,
} from "@assistant-ui/react";
import { AssistantChatTransport, useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import { useChat, type UIMessage } from "@ai-sdk/react";
import type { EcommapsCart } from "@ecommaps/client";
import {
  ProductCard as AgentProductCard,
  CollectionCard as AgentCollectionCard,
  PromotionCard as AgentPromotionCard,
  MarkdownMessageRenderer as AgentMarkdownMessageRenderer,
} from "@ecommaps/ai-sales-agent/react";
import { Bot, Send, X, User, Sparkles, ShoppingCart, BadgeCheck, Square, Loader2, CheckCircle2, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { ReasoningBlock } from "@/components/ai/ReasoningBlock";

const CHAT_HISTORY_STORAGE_KEY = "ecommaps:shopper-ai:history:v1";
const CART_COOKIE = "_ecommaps_cart_id";

interface AIAssistantProps {
  storeLogo?: string | null;
  storeName?: string;
}

function normalizeStoreName(name?: string): string | null {
  const trimmed = name?.trim();
  return trimmed ? trimmed : null;
}

function getAgentHeaderContent(storeName?: string): { title: string; subtitle: string } {
  const normalizedStoreName = normalizeStoreName(storeName);
  if (normalizedStoreName) {
    return {
      title: `وكيل المبيعات الذكي • ${normalizedStoreName}`,
      subtitle: `أتصفح منتجات ${normalizedStoreName} وأساعدك على اختيار الأنسب وإتمام الشراء عبر الشات.`,
    };
  }

  return {
    title: "وكيل المبيعات الذكي",
    subtitle: "أقترح المنتجات الأنسب وأدير رحلة الشراء خطوة بخطوة داخل المتجر.",
  };
}

function loadPersistedMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;

    if (Array.isArray(parsed)) {
      return parsed as UIMessage[];
    }

    if (parsed && typeof parsed === "object") {
      const obj = parsed as { messages?: unknown[] };
      if (Array.isArray(obj.messages) && obj.messages.length > 0) {
        const first = obj.messages[0] as Record<string, unknown>;
        if (first && typeof first === "object" && "role" in first) {
          return obj.messages as UIMessage[];
        }
        if (first && typeof first === "object" && "message" in first) {
          return obj.messages
            .map((item) => {
              const row = item as { message?: unknown };
              return row.message;
            })
            .filter((msg): msg is UIMessage => Boolean(msg && typeof msg === "object" && "role" in (msg as Record<string, unknown>)));
        }
      }
    }

    return [];
  } catch {
    return [];
  }
}

type ProductCard = {
  id?: string;
  slug?: string;
  name?: string;
  description?: string;
  price?: number | null;
  currency?: string;
  image?: string | null;
  available?: boolean;
};

type CollectionCard = {
  id?: string | null;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  image?: string | null;
  url?: string | null;
};

type PageCard = {
  id?: string | null;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  snippet?: string | null;
  key_points?: string[];
  image?: string | null;
  url?: string | null;
  is_legal?: boolean;
  relevance_score?: number;
  updated_at?: string | null;
};

type PromotionCard = {
  id?: string | null;
  code?: string | null;
  title?: string | null;
  message?: string | null;
  discount_type?: string | null;
  discount_value?: number | null;
  discount_amount?: number | null;
  min_order_amount?: number | null;
  max_discount_amount?: number | null;
  promotion_type?: string | null;
  target_type?: string | null;
  target_ids?: string[];
  starts_at?: string | null;
  expires_at?: string | null;
  status?: "applied_now" | "eligible_with_conditions" | "code_required" | "invalid_code";
  status_label?: string | null;
  status_reason?: string | null;
  products?: ProductCard[];
  collections?: CollectionCard[];
};

type ToolPart = {
  toolName: string;
  status?: { type?: string; reason?: string };
  result?: unknown;
};

type MessagePartLike = {
  type?: string;
  text?: string;
  status?: { type?: string; reason?: string };
};

function formatMoney(price: number | null | undefined, currency = "DZD") {
  if (typeof price !== "number") return "السعر عند الطلب";
  try {
    return `${price.toLocaleString("ar-DZ")} ${currency === "DZD" ? "د.ج" : currency}`;
  } catch {
    return `${price} ${currency}`;
  }
}

const CART_TOOL_NAMES = new Set([
  "addToCart",
  "addMultipleToCart",
  "getCartSummary",
  "updateCartItemQuantity",
  "removeCartItem",
]);

function isCartLike(value: unknown): value is EcommapsCart {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && Array.isArray(record.items);
}

function extractLatestCartSync(messages: UIMessage[]): { cart: EcommapsCart | null; cartId: string | null } {
  let latestCart: EcommapsCart | null = null;
  let latestCartId: string | null = null;

  for (let m = messages.length - 1; m >= 0; m -= 1) {
    const message = messages[m] as unknown as Record<string, unknown>;
    const parts = Array.isArray(message.parts) ? (message.parts as unknown[]) : [];

    for (let p = parts.length - 1; p >= 0; p -= 1) {
      const part = (parts[p] ?? {}) as Record<string, unknown>;
      const toolName =
        typeof part.toolName === "string"
          ? part.toolName
          : typeof part.type === "string" && part.type.startsWith("tool-")
            ? part.type.slice(5)
            : null;

      if (!toolName || !CART_TOOL_NAMES.has(toolName)) continue;

      const payload = (part.result ?? part.output ?? null) as Record<string, unknown> | null;
      if (!payload || typeof payload !== "object") continue;
      const payloadCart = payload.cart;

      if (!latestCart && isCartLike(payloadCart)) {
        latestCart = payloadCart;
      }

      if (!latestCartId) {
        if (typeof payload.cart_id === "string" && payload.cart_id.trim()) {
          latestCartId = payload.cart_id;
        } else if (isCartLike(payloadCart) && typeof payloadCart.id === "string") {
          latestCartId = payloadCart.id;
        }
      }
    }

    if (latestCart && latestCartId) break;
  }

  return { cart: latestCart, cartId: latestCartId };
}

function cookieExists(name: string): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .some((entry) => entry.startsWith(`${name}=`));
}

const MessageThinkingFallback: FC = () => {
  const messageStatusType = useAuiState((s) => (s.message?.status?.type ?? "complete") as string);
  const hasReasoning = useAuiState((s) => {
    const parts = Array.isArray(s.message?.parts) ? (s.message.parts as MessagePartLike[]) : [];
    for (const part of parts) {
      if (part?.type === "reasoning") return true;
    }
    return false;
  });
  const isStreaming = messageStatusType === "running";

  if (!isStreaming || hasReasoning) return null;

  return <ReasoningBlock isStreaming className="mb-2" />;
};

const ReasoningGroupRenderer: FC<{ startIndex: number; endIndex: number }> = ({ startIndex, endIndex }) => {
  const messageStatusType = useAuiState((s) => (s.message?.status?.type ?? "complete") as string);
  const reasoningText = useAuiState((s) => {
    const parts = (Array.isArray(s.message?.parts) ? s.message.parts : []) as MessagePartLike[];
    const fragments: string[] = [];
    for (let i = startIndex; i <= endIndex; i += 1) {
      const part = parts[i];
      if (part?.type === "reasoning" && typeof part.text === "string" && part.text.trim()) {
        fragments.push(part.text);
      }
    }
    return fragments.join("\n\n").trim();
  });
  const hasReasoning = useAuiState((s) => {
    const parts = (Array.isArray(s.message?.parts) ? s.message.parts : []) as MessagePartLike[];
    for (let i = startIndex; i <= endIndex; i += 1) {
      if (parts[i]?.type === "reasoning") return true;
    }
    return false;
  });
  const lastGroupedPartType = useAuiState((s) => {
    const parts = (Array.isArray(s.message?.parts) ? s.message.parts : []) as MessagePartLike[];
    const part = parts[endIndex];
    return typeof part?.type === "string" ? part.type : "";
  });
  const timing = useMessageTiming();
  if (!hasReasoning && !reasoningText) return null;
  const isReasoningStreaming = messageStatusType === "running" && lastGroupedPartType === "reasoning";
  const durationSeconds =
    typeof timing?.totalStreamTime === "number" && timing.totalStreamTime > 0
      ? Math.ceil(timing.totalStreamTime / 1000)
      : undefined;

  return <ReasoningBlock isStreaming={isReasoningStreaming} duration={durationSeconds} text={reasoningText} className="mb-2" />;
};

const AssistantTextPart: FC<{ text?: string }> = ({ text = "" }) => {
  const messageStatusType = useAuiState((s) => (s.message?.status?.type ?? "complete") as string);
  const isStreaming = messageStatusType === "running";
  return <AgentMarkdownMessageRenderer text={text} isStreaming={isStreaming} />;
};

const ProductCardView: FC<{ item: ProductCard }> = ({ item }) => {
  return <AgentProductCard item={item} />;
};

const CollectionCardView: FC<{ item: CollectionCard }> = ({ item }) => {
  return <AgentCollectionCard item={item} />;
};

const PageCardView: FC<{ item: PageCard }> = ({ item }) => {
  const title = item.title?.trim() || "صفحة معلومات";
  const description = item.description?.trim() || item.snippet?.trim() || "معلومات إضافية حول المتجر.";
  const href = item.url?.trim() || (item.slug ? `/pages/${item.slug}` : "#");
  const badge = item.is_legal ? "سياسة" : "معلومة";

  return (
    <div className="rounded-2xl border bg-background p-3 shadow-sm">
      {item.image ? (
        <img
          src={item.image}
          alt={title}
          className="mb-3 h-36 w-full rounded-xl border object-cover"
          loading="lazy"
        />
      ) : (
        <div className="mb-3 flex h-20 items-center justify-center rounded-xl border bg-muted/40 text-sm text-muted-foreground">
          صفحة {badge}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground">{badge}</span>
          {typeof item.relevance_score === "number" ? (
            <span className="text-xs text-muted-foreground">مطابقة {Math.round(item.relevance_score * 100)}%</span>
          ) : null}
        </div>
        <h4 className="line-clamp-2 text-sm font-semibold">{title}</h4>
        <p className="line-clamp-3 text-xs text-muted-foreground">{description}</p>
        <a
          href={href}
          className="inline-flex w-full items-center justify-center rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted/50"
        >
          عرض التفاصيل
        </a>
      </div>
    </div>
  );
};

const PromotionCardView: FC<{ item: PromotionCard }> = ({ item }) => {
  const hasProducts = Array.isArray(item.products) && item.products.length > 0;
  const hasCollections = Array.isArray(item.collections) && item.collections.length > 0;

  return (
    <div className="space-y-3">
      <AgentPromotionCard item={item} />
      {hasCollections ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(item.collections ?? []).map((collection, idx) => (
            <CollectionCardView key={`${collection.id ?? collection.slug ?? "promo-collection"}-${idx}`} item={collection} />
          ))}
        </div>
      ) : null}
      {hasProducts ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(item.products ?? []).map((product, idx) => (
            <ProductCardView key={`${product.id ?? product.slug ?? "promo-product"}-${idx}`} item={product} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const SearchProductsToolPart: FC<ToolPart> = ({ status, result }) => {
  if (status?.type === "running") {
    return (
      <div className="mt-2 inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> جاري البحث عن المنتجات...
      </div>
    );
  }

  const payload = (result ?? {}) as { results?: ProductCard[]; products?: ProductCard[]; error?: string; total_found?: number; total?: number };

  if (payload.error) {
    return (
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <AlertTriangle className="size-3.5" /> {payload.error}
      </div>
    );
  }

  const items = Array.isArray(payload.results) ? payload.results : Array.isArray(payload.products) ? payload.products : [];

  if (items.length === 0) {
    return (
      <div className="mt-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">
        لم يتم العثور على نتائج مطابقة في هذه المحاولة.
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-muted-foreground">نتائج البحث: {typeof payload.total_found === "number" ? payload.total_found : typeof payload.total === "number" ? payload.total : items.length}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item, idx) => (
          <ProductCardView key={`${item.id ?? item.slug ?? "p"}-${idx}`} item={item} />
        ))}
      </div>
    </div>
  );
};

const ProductDetailsToolPart: FC<ToolPart> = ({ status, result }) => {
  if (status?.type === "running") {
    return (
      <div className="mt-2 inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> جاري جلب تفاصيل المنتج...
      </div>
    );
  }

  const payload = (result ?? {}) as ProductCard & { error?: string; product?: ProductCard; success?: boolean };

  if (payload.error) {
    return <div className="mt-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">{payload.error}</div>;
  }

  const card = payload.product ?? payload;
  return (
    <div className="mt-3">
      <ProductCardView item={card} />
    </div>
  );
};

const AddToCartToolPart: FC<ToolPart> = ({ status, result }) => {
  if (status?.type === "running") {
    return (
      <div className="mt-2 inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> جاري إضافة المنتج إلى السلة...
      </div>
    );
  }

  const payload = (result ?? {}) as { success?: boolean; message?: string; error?: string };

  if (payload.success) {
    return (
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-xs text-zinc-900">
        <CheckCircle2 className="size-3.5" /> {payload.message ?? "تمت الإضافة إلى السلة"}
      </div>
    );
  }

  if (payload.error) {
    return (
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <AlertTriangle className="size-3.5" /> {payload.error}
      </div>
    );
  }

  return null;
};

const CartSummaryToolPart: FC<ToolPart> = ({ status, result }) => {
  if (status?.type === "running") {
    return (
      <div className="mt-2 inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> جاري جلب السلة...
      </div>
    );
  }

  const payload = (result ?? {}) as {
    success?: boolean;
    has_cart?: boolean;
    cart_summary?: {
      items?: Array<{ item_id?: string; name?: string; quantity?: number; subtotal?: number; currency?: string }>;
      subtotal?: number;
      currency?: string;
    };
  };

  if (payload.success === false || payload.has_cart === false) {
    return <div className="mt-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">السلة فارغة حاليًا.</div>;
  }

  const summary = payload.cart_summary;
  const items = Array.isArray(summary?.items) ? summary.items : [];
  return (
    <div className="mt-2 rounded-xl border bg-background p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>عدد العناصر: {items.length}</span>
        <span className="font-semibold text-foreground">{formatMoney(summary?.subtotal ?? null, summary?.currency ?? "DZD")}</span>
      </div>
      <div className="space-y-1.5">
        {items.slice(0, 6).map((item, idx) => (
          <div key={`${item.item_id ?? "item"}-${idx}`} className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5 text-xs">
            <span className="line-clamp-1">{item.name ?? "منتج"}</span>
            <span>x{item.quantity ?? 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CollectionsToolPart: FC<ToolPart> = ({ status, result }) => {
  if (status?.type === "running") {
    return (
      <div className="mt-2 inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> جاري تحميل المجموعات...
      </div>
    );
  }

  const payload = (result ?? {}) as { success?: boolean; collections?: CollectionCard[]; error?: string };
  if (payload.error) {
    return <div className="mt-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">{payload.error}</div>;
  }
  const items = Array.isArray(payload.collections) ? payload.collections : [];
  if (items.length === 0) {
    return <div className="mt-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">لا توجد مجموعات متاحة الآن.</div>;
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-muted-foreground">المجموعات المتاحة: {items.length}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item, idx) => (
          <CollectionCardView key={`${item.id ?? item.slug ?? "collection"}-${idx}`} item={item} />
        ))}
      </div>
    </div>
  );
};

const PagesToolPart: FC<ToolPart> = ({ status, result }) => {
  if (status?.type === "running") {
    return (
      <div className="mt-2 inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> جاري البحث في صفحات المتجر...
      </div>
    );
  }

  const payload = (result ?? {}) as { success?: boolean; pages?: PageCard[]; error?: string; total_pages?: number };
  if (payload.error) {
    return <div className="mt-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">{payload.error}</div>;
  }

  const items = Array.isArray(payload.pages) ? payload.pages : [];
  if (items.length === 0) {
    return <div className="mt-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">لا توجد صفحات مطابقة حاليًا.</div>;
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-muted-foreground">
        صفحات معلومات متاحة: {typeof payload.total_pages === "number" ? payload.total_pages : items.length}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item, idx) => (
          <PageCardView key={`${item.id ?? item.slug ?? "page"}-${idx}`} item={item} />
        ))}
      </div>
    </div>
  );
};

const DiscountsToolPart: FC<ToolPart> = ({ status, result }) => {
  if (status?.type === "running") {
    return (
      <div className="mt-2 inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> جاري تحميل العروض...
      </div>
    );
  }

  const payload = (result ?? {}) as {
    success?: boolean;
    promotions?: PromotionCard[];
    error?: string;
    checked_coupon?: string | null;
    checked_coupon_valid?: boolean | null;
    checked_coupon_message?: string | null;
  };
  if (payload.error) {
    return <div className="mt-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">{payload.error}</div>;
  }
  const items = Array.isArray(payload.promotions) ? payload.promotions : [];
  if (items.length === 0) {
    return <div className="mt-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">لا توجد عروض ظاهرة حاليًا.</div>;
  }

  return (
    <div className="mt-3 space-y-2">
      {payload.checked_coupon ? (
        <div
          className={cn(
            "rounded-lg border px-3 py-2 text-xs",
            payload.checked_coupon_valid === true
              ? "border-zinc-300 bg-zinc-100 text-zinc-900"
              : payload.checked_coupon_valid === false
                ? "border-amber-300 bg-amber-50 text-amber-800"
                : "border-border bg-background text-muted-foreground",
          )}
        >
          <p className="font-semibold">فحص الكود: {payload.checked_coupon}</p>
          {payload.checked_coupon_message ? <p className="mt-1">{payload.checked_coupon_message}</p> : null}
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">العروض المتاحة: {items.length}</p>
      <div className="grid grid-cols-1 gap-2">
        {items.map((item, idx) => (
          <PromotionCardView key={`${item.id ?? item.code ?? "promotion"}-${idx}`} item={item} />
        ))}
      </div>
    </div>
  );
};

const ToolFallbackPart: FC<ToolPart> = ({ status }) => {
  if (status?.type === "running") {
    return (
      <div className="mt-2 inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> جاري التنفيذ...
      </div>
    );
  }

  return null;
};

export function AIAssistant({ storeLogo, storeName }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const setCart = useCartStore((state) => state.setCart);
  const agentHeader = useMemo(() => getAgentHeaderContent(storeName), [storeName]);
  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/chat",
      }),
    [],
  );
  const initialMessages = useMemo(() => loadPersistedMessages(), []);
  const chat = useChat({
    id: "ecommaps-shopper-assistant-main-thread",
    transport,
    messages: initialMessages,
  });
  const runtime = useAISDKRuntime(chat);
  const lastSyncedCartSignature = useRef<string | null>(null);
  const didRestoreMessagesRef = useRef(false);

  useEffect(() => {
    if (didRestoreMessagesRef.current) return;
    if (chat.messages.length > 0) {
      didRestoreMessagesRef.current = true;
      return;
    }
    const restored = loadPersistedMessages();
    if (restored.length > 0) {
      didRestoreMessagesRef.current = true;
      chat.setMessages(restored);
      return;
    }
    didRestoreMessagesRef.current = true;
  }, [chat.messages.length, chat.setMessages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(chat.messages));
    } catch {
      // ignore localStorage errors
    }
  }, [chat.messages]);

  useEffect(() => {
    const { cart, cartId } = extractLatestCartSync(chat.messages);
    const cartSignature = cart ? `${cart.id}:${cart.items_count ?? 0}:${cart.subtotal ?? 0}` : null;

    if (cart && cartSignature !== lastSyncedCartSignature.current) {
      setCart(cart);
      lastSyncedCartSignature.current = cartSignature;
    } else if (!cart && lastSyncedCartSignature.current !== null) {
      setCart(null);
      lastSyncedCartSignature.current = null;
    }

    if (cartId && !cookieExists(CART_COOKIE) && typeof document !== "undefined") {
      document.cookie = `${CART_COOKIE}=${encodeURIComponent(cartId)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    }
  }, [chat.messages.length, setCart]);

  const handleNewChat = () => {
    chat.setMessages([]);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
      } catch {
        // ignore localStorage errors
      }
    }
  };

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="فتح المساعد الذكي"
        className={cn(
          "fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground shadow-2xl ring-1 ring-border/70 transition-all hover:scale-105 hover:bg-secondary/90 sm:right-6 sm:bottom-6 sm:size-16",
          isOpen && "pointer-events-none scale-0 opacity-0",
        )}
      >
        {storeLogo ? (
          <img src={storeLogo} alt={storeName || "Store"} className="size-7 rounded-full object-cover sm:size-8" loading="lazy" />
        ) : (
          <Bot className="size-6 sm:size-7" />
        )}
        <span className="absolute -top-1 -left-1 inline-flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
          <Sparkles className="size-3" />
        </span>
      </button>

      {isOpen && (
        <section
          className="fixed inset-2 z-50 flex flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl sm:inset-y-3 sm:right-3 sm:left-auto sm:w-[92vw] sm:max-w-[560px] md:w-[46vw] md:max-w-[560px] lg:w-[38vw] lg:max-w-[540px] xl:w-[32vw] xl:max-w-[520px] 2xl:w-[28vw] 2xl:max-w-[500px]"
          dir="rtl"
        >
          <header className="shrink-0 border-b bg-primary/95 px-4 py-3 text-primary-foreground sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-white/15">
                  {storeLogo ? (
                    <img src={storeLogo} alt={storeName || "Store"} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <ShoppingCart className="size-5" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold sm:text-lg">{agentHeader.title}</h3>
                  <p className="flex items-center gap-1 text-xs text-primary-foreground/90">
                    <BadgeCheck className="size-3.5" />
                    {agentHeader.subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-primary-foreground/90 transition-colors hover:bg-white/15"
                aria-label="إغلاق"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-2 flex justify-start">
              <button
                type="button"
                onClick={handleNewChat}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-white/20"
                aria-label="محادثة جديدة"
              >
                <RotateCcw className="size-3.5" />
                محادثة جديدة
              </button>
            </div>
          </header>

          <ShopperThread storeLogo={storeLogo} storeName={storeName} />
        </section>
      )}
    </AssistantRuntimeProvider>
  );
}

const ShopperThread: FC<{ storeLogo?: string | null; storeName?: string }> = ({ storeLogo, storeName }) => {
  const AssistantMessageWithBrand = useMemo(() => {
    const Wrapped: FC = () => <AssistantMessage storeLogo={storeLogo} storeName={storeName} />;
    Wrapped.displayName = "AssistantMessageWithBrand";
    return Wrapped;
  }, [storeLogo, storeName]);
  const threadComponents = useMemo(
    () => ({
      UserMessage,
      AssistantMessage: AssistantMessageWithBrand,
      EditComposer,
    }),
    [AssistantMessageWithBrand],
  );

  return (
    <ThreadPrimitive.Root className="flex h-full min-h-0 flex-1 flex-col bg-background">
      <ThreadPrimitive.Viewport className="min-h-0 flex-1 overflow-y-auto px-3 pt-3 sm:px-4 sm:pt-4">
        <AuiIf condition={(s) => s.thread.isEmpty}>
          <div className="mx-auto my-10 w-full max-w-md rounded-2xl border bg-muted/40 p-4 text-center">
            <p className="text-sm font-semibold text-foreground">جاهز لمساعدتك في اختيار المنتج المناسب</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              اكتب احتياجك، الميزانية، أو اللون والمقاس وسأقترح منتجات مناسبة من المتجر.
            </p>
          </div>
        </AuiIf>

        <ThreadPrimitive.Messages
          components={threadComponents}
        />
      </ThreadPrimitive.Viewport>

      <div className="shrink-0 border-t bg-background/95 px-3 py-3 backdrop-blur sm:px-4 sm:py-4">
        <Composer />
      </div>
    </ThreadPrimitive.Root>
  );
};

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="w-full">
      <div className="flex items-end gap-2 rounded-2xl border bg-background px-2 py-2 shadow-sm">
        <ComposerPrimitive.Input
          rows={1}
          autoFocus
          placeholder="ابحث عن منتج، قارن بين الخيارات، أو اطلب إضافة للسلة..."
          className="min-h-10 max-h-32 w-full resize-none bg-transparent px-2 py-1 text-sm leading-7 text-foreground outline-none placeholder:text-muted-foreground"
        />

        <AuiIf condition={(s) => !s.thread.isRunning}>
          <ComposerPrimitive.Send asChild>
            <Button size="icon" className="size-9 rounded-full" aria-label="إرسال">
              <Send className="size-4" />
            </Button>
          </ComposerPrimitive.Send>
        </AuiIf>

        <AuiIf condition={(s) => s.thread.isRunning}>
          <ComposerPrimitive.Cancel asChild>
            <Button size="icon" className="size-9 rounded-full" aria-label="إيقاف">
              <Square className="size-3.5 fill-current" />
            </Button>
          </ComposerPrimitive.Cancel>
        </AuiIf>
      </div>
    </ComposerPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="mx-auto w-full max-w-4xl py-2" data-role="user">
      <div dir="ltr" className="flex w-full items-start justify-end gap-2">
        <div dir="rtl" className="max-w-[88%] rounded-2xl bg-primary px-4 py-2.5 text-right text-sm leading-7 text-primary-foreground shadow-sm">
          <MessagePrimitive.Parts />
        </div>
        <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <User className="size-4" />
        </span>
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantMessage: FC<{ storeLogo?: string | null; storeName?: string }> = ({ storeLogo, storeName }) => {
  const messagePartComponents = useMemo(
    () => ({
      Text: (part: { text?: string }) => <AssistantTextPart text={part.text} />,
      Reasoning: () => null,
      ReasoningGroup: ({ startIndex, endIndex }: { startIndex: number; endIndex: number }) => (
        <ReasoningGroupRenderer startIndex={startIndex} endIndex={endIndex} />
      ),
      tools: {
        by_name: {
          searchProductsSmart: SearchProductsToolPart,
          getProductDetails: ProductDetailsToolPart,
          addToCart: AddToCartToolPart,
          addMultipleToCart: AddToCartToolPart,
          getCartSummary: CartSummaryToolPart,
          updateCartItemQuantity: AddToCartToolPart,
          removeCartItem: AddToCartToolPart,
          getAvailableDiscounts: DiscountsToolPart,
          getStoreCollections: CollectionsToolPart,
          getStorePagesSmart: PagesToolPart,
        },
        Fallback: ToolFallbackPart,
      },
    }),
    [],
  );

  return (
    <MessagePrimitive.Root className="mx-auto w-full max-w-4xl py-2" data-role="assistant">
      <div dir="ltr" className="flex w-full items-start justify-start gap-2">
        <span className="mt-1 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground">
          {storeLogo ? (
            <img src={storeLogo} alt={storeName || "Store"} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <Bot className="size-4" />
          )}
        </span>
        <div dir="rtl" className={cn("max-w-[95%] space-y-2 rounded-2xl bg-muted px-4 py-2.5 text-right text-sm leading-7 text-foreground shadow-sm")}>
          <MessageThinkingFallback />
          <MessagePrimitive.Parts components={messagePartComponents} />
          <MessagePrimitive.Error>
            <ErrorPrimitive.Root className="mt-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
              <ErrorPrimitive.Message />
            </ErrorPrimitive.Root>
          </MessagePrimitive.Error>
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <MessagePrimitive.Root className="mx-auto w-full max-w-4xl py-2">
      <ComposerPrimitive.Root className="mr-auto w-full max-w-[88%] rounded-2xl border bg-muted/60 p-2">
        <ComposerPrimitive.Input autoFocus className="min-h-12 w-full resize-none bg-transparent px-2 py-1 text-sm outline-none" />
        <div className="mt-2 flex items-center justify-end gap-2">
          <ComposerPrimitive.Cancel asChild>
            <Button size="sm" variant="ghost">إلغاء</Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm">تحديث</Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  );
};
