# Storefront Kit Reference

<description>
This reference guides the AI on using utility functions from `@ecommaps/storefront-kit` to standardise incoming Ecommaps API responses into clean React-ready models.
</description>

<context>
- The Ecommaps API responses can be deeply nested. `@ecommaps/storefront-kit` provides pure functions to normalize these into flat concepts (e.g. calculating final prices, extracting images).
</context>

<instructions>
1. **Always Normalize Products:** When mapping over `products.list()` data, pass the raw item through `normalizeProductCard(item)`.
2. **Cart Summaries:** Use `normalizeCartSummary(cart)` to extract `items_count`, `subtotal`, and a clean flat `items` array.
</instructions>

<examples>
<example>
### Normalizing a Product List
```typescript
import { normalizeProductCard, type NormalizedProductCard } from "@ecommaps/storefront-kit";
import type { EcommapsProduct } from "@ecommaps/client";

export function renderProductCards(rawProducts: EcommapsProduct[]) {
  const cards: NormalizedProductCard[] = rawProducts.map(normalizeProductCard);
  
  // The normalized card has predictable shallow fields:
  // - id, slug, name, description
  // - price, compare_at_price, currency
  // - available (boolean calculated from inventory rules)
  // - image (string | null), images (string[])
  
  return cards.map(card => <ProductCard key={card.id} product={card} />);
}
```
</example>
</examples>

<execution-rules>
- Do not write manual math or inventory status checks for products. Always use `normalizeProductCard`.
</execution-rules>
