import type { EcommapsProduct } from "@ecommaps/client";
import { normalizeProductCard } from "@ecommaps/storefront-kit";
import type { ProductSix } from "@/components/commercn/product-cards/product-card-06";

function toCurrencyLabel(currency?: string | null): string {
  return currency === "DZD" || !currency ? "د.ج" : currency;
}

function buildColorSwatches(product: EcommapsProduct): ProductSix["colors"] {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const colorsMap = new Map<string, string>();

  for (const variant of variants) {
    const v = variant as unknown as Record<string, unknown>;
    const optionValues = (v.option_values ?? {}) as Record<string, unknown>;
    const colorRaw = (optionValues.color ?? optionValues.Color ?? optionValues.colour ?? optionValues.Colour) as string | undefined;
    if (!colorRaw || colorsMap.has(colorRaw)) continue;
    const image = typeof v.image_url === "string" ? v.image_url : undefined;
    colorsMap.set(colorRaw, image ?? "");
  }

  return Array.from(colorsMap.entries()).map(([name, image]) => ({
    name,
    value: "#D1D5DB",
    image: image || undefined,
  }));
}

export function mapProductToCard(
  product: EcommapsProduct,
  selectedOptions: Record<string, string[]> = {},
): ProductSix {
  const normalized = normalizeProductCard(product as unknown as Record<string, unknown>);
  const formattedPrice = typeof normalized.price === "number"
    ? `${normalized.price.toLocaleString("ar-DZ")} ${toCurrencyLabel(normalized.currency)}`
    : "السعر عند الطلب";
  const formattedOriginalPrice = typeof normalized.compare_at_price === "number"
    ? `${normalized.compare_at_price.toLocaleString("ar-DZ")} ${toCurrencyLabel(normalized.currency)}`
    : undefined;

  const colors = buildColorSwatches(product);
  const selectedColor = Object.keys(selectedOptions).find((key) => key.toLowerCase() === "color" || key.toLowerCase() === "colour");
  const preferredColor = selectedColor ? selectedOptions[selectedColor]?.[0] : undefined;
  const preferredImage = preferredColor
    ? colors.find((c) => c.name.toLowerCase() === preferredColor.toLowerCase())?.image
    : undefined;

  return {
    id: normalized.id ?? product.id,
    slug: normalized.slug ?? product.slug,
    title: normalized.name ?? product.name ?? "منتج",
    image: preferredImage || normalized.image || "/placeholder.svg",
    originalImage: normalized.image || "/placeholder.svg",
    price: formattedPrice,
    originalPrice: formattedOriginalPrice,
    badge: normalized.available ? undefined : "غير متوفر",
    rating: 4,
    colors,
  };
}

export function mapProductsToCards(
  products: EcommapsProduct[],
  selectedOptions: Record<string, string[]> = {},
): ProductSix[] {
  return products.map((product) => mapProductToCard(product, selectedOptions));
}
