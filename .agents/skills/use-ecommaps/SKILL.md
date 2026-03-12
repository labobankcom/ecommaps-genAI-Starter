# Use Ecommaps Skill

## Ecommaps Resource Model
The Ecommaps GenAI Starter is built on a specific, optimized tech stack:
- **Framework:** Next.js 15+ (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Commerce:** `@ecommaps/client` (SDK) and `@ecommaps/storefront-kit` (Hooks & Utilities)
- **AI Assist:** `@ecommaps/ai-sales-agent` (Pre-built Buyer Agent)
- **Localization:** RTL-first orientation (Arabic/French/English), targeted heavily for Algeria.

## Preflight
Before generating new code, verify the local context:
- Check if standard utilities already exist in `src/components/`, `src/lib/`, or `src/actions/`.
- Ensure paths follow the standard `src/app/` Next.js conventions.

## Routing
Load the reference that matches the user's intent. Load only what you need (one reference is usually enough, two at most).

| Intent | Reference | Use for |
|---|---|---|
| Fetch products, collections, pages, or search | `references/data-fetching.md` | Data loading from SDK via `@/lib/ecommaps` server actions. |
| Modify the buyer AI assistant | `references/ai-agent.md` | Modifying the Chat UI or AI tools logic in `@ecommaps/ai-sales-agent`. |
| Process, map, or normalize SDK responses | `references/storefront-kit.md` | Extracting prices, images, and inventory using `@ecommaps/storefront-kit`. |
| Build UI components, cards, layouts | `references/ui-components.md` | Tailwind guidelines, RTL (`ms-`, `me-`), and shadcn component usage. |

## Execution Rules
1. Never import directly from standard Ecommaps generic packages (if not installed). Always check `package.json` for installed SDK packages.
2. In Next.js, prefer Server Actions or Server Components for data fetching to protect API keys.
3. For destructive actions (e.g. deleting large component structures), confirm intent first.
