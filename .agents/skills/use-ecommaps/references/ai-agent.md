# AI Agent Integration Reference

<description>
This reference instructs the AI on how to extend and modify the built-in AI Sales Agent inside the Ecommaps Starter template.
</description>

<context>
- The starter uses the `@ecommaps/ai-sales-agent` package for server-side logic and UI elements.
- This agent is primarily a **Buyer Assistant** (helping customers find products, add to cart, read policies), not an admin agent.
- It operates using `ai` (Vercel AI SDK) underneath and relies on an `OPENAI_API_KEY`.
</context>

<available-tools>
The `@ecommaps/ai-sales-agent` package automatically provides the following robust tools into the Vercel AI SDK execution context. **You do not need to re-invent these tools:**
- `getStoreProfile`: Returns store name, currency, logo, and social links.
- `searchProductsSmart`: Searches products by query and filters by `color` and `size` using internal variants logic. Limits to 6-12 items.
- `getProductDetails`: Fetches deep details of a single product using its `product_id`.
- `addToCart`: Adds a specific `product_id` (and optionally `variant_id`, `color`, `size`) to the user's cart cookie. Has intent guards against destructive edits.
- `updateCartItemQuantity`: Changes qty or removes it if set to 0.
- `getCartSummary`: Displays current cart totals.
- `getAvailableDiscounts`: Evaluates coupons and automatic promotions against the cart using `classifyPromotionStatus` logic.
- `getStorePagesSmart`: Searches legal pages, refund policies, and about pages natively.
</available-tools>

<instructions>
1. **Adding Custom Tools:** If the user asks for a new AI feature not listed above (e.g. "Suggest matching outfits"), modify `src/app/api/chat/route.ts` where we call the setup and inject custom tools overriding or extending the built-in ones.
2. **Restrict Scope:** Always remind the agent internally that it assists *shoppers*. Frame prompts from a helpful sales persona.
3. **Do not hallucinate products.** Rely heavily on `searchProductsSmart` which returns actual `id`, `slug`, and `price` fields. Never invent product IDs.
</instructions>

<examples>
<example>
### Basic Chat API Setup (src/app/api/chat/route.ts)
```typescript
import { createSalesAgentRuntime } from '@ecommaps/ai-sales-agent/server';

// Depending on integration style, it may expose a runtime or handler directly.
```
*Note: Consult the exact file in the starter codebase (`src/app/api/chat/route.ts`) to see the current implementation.*
</example>
</examples>

<execution-rules>
- Use the `@ecommaps/ai-sales-agent/ui` components for rendering frontend chat elements if generating custom UIs.
- Treat the AI Agent module as an isolated black box unless tasked to modify its internals.
</execution-rules>
