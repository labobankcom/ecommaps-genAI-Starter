# AI Agent Guide (Starter)

## الهدف

استخدام وكيل مبيعات جاهز للمشتري فقط، مبني على:

- `@ecommaps/ai-sales-agent/server` للأدوات والمهارة.
- `@ecommaps/ai-sales-agent/react` لمكونات الواجهة.

## Server side

- `buildSalesSkillProfile` لبناء شخصية الوكيل حسب بيانات المتجر.
- `buildSalesAgentTools` لتجهيز الأدوات القياسية:
  - `searchProductsSmart`
  - `addToCart`
  - `getAvailableDiscounts`
  - `getStorePagesSmart`
  - `getStoreProfile`
- `createSalesAgentRuntime` لتشغيل stream مع AI SDK v6.

## UI side

- `ReasoningBlock` لمؤشر التفكير.
- `MarkdownMessageRenderer` لعرض Markdown آمن.
- `ProductCard / CollectionCard / PromotionCard` لعرض نتائج الأدوات.
- `AIAssistantShell` لقالب نافذة المساعد.

## مبادئ مهمة

- مفتاح OpenAI مستقل عن مفاتيح Ecommaps.
- الوكيل لا ينفذ مهام التاجر، فقط مساعدة المشتري.
- أي معلومات متجر/سياسات/منتجات يجب أن تأتي من الأدوات، ليس من التخمين.
