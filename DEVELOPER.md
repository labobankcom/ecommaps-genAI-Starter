# 💻 الدليل المتقدم للمطورين (Developer Guide)

مرحباً بك في الوثيقة التقنية الشاملة لـ **Ecommaps GenAI Starter**. صُمم هذا الدليل للمهندسين والمطورين الذين يرغبون في فهم البنية التحتية للقالب، آليات الربط المعقدة مع خوادم إيكومابس، وطرق توسعة وكيل المبيعات الذكي وتخصيصه.

---

## 1. البنية المعمارية (Architecture Overview)

يعتمد القالب على هندسة منفصلة وموزعة المسؤوليات لتسهيل إجراء التعديلات، حيث ينقسم التطبيق إلى ثلاث ركائز أساسية:

1. **إدارة واجهات المستخدم (UI & Routing):** تتم من خلال **Next.js 15 App Router**. القالب يستخدم Server Components كخيار افتراضي ويعتمد بشكل خفيف على Client Components في الأجزاء التفاعلية فقط (مثل الشات، وبعض فلاتر المنتجات).
2. **منطق التجارة الإلكترونية (Commerce Logic):** يعتمد حصرياً وعبر كامل المشروع على الحزمة الرسمية `@ecommaps/client` للاستعلام وإرسال البيانات لتجنب دوات `fetch` غير المهيكلة والتأكد من توافق الـ Typescript بالكامل بنسبة 100%. ولفصل منطق الأعمال المعقد نقوم باستخدام `@ecommaps/storefront-kit`.
3. **طبقة الذكاء الاصطناعي للمبيعات (AI Sales Layer):** تدار عبر خوادم `Vercel AI SDK` مع الاعتماد على حزمة `@ecommaps/ai-sales-agent` لإنتاج أدوات الـ Tools وتحسين جودة استجابات وكيل المبيعات دون احتكار طبقة التطبيق بالكامل.

---

## 2. إدارة البيانات والخادم (Server Actions & SDK)

بديلاً عن إنشاء مسارات واجهة برمجية (API Routes)، نستخدم **Server Actions** حصرياً لإرسال المهام الثقيلة لخوادم Next.js التي تتصل بدورها بخوادم إيكومابس عبر `ecommapsClient`. هذا يقدم سرعة أكبر وحماية لبيانات الـ API Key.

### 🔌 الربط مع منصة إيكومابس
الملف `src/lib/ecommaps.ts` هو النقطة الوحيدة التي يتم فيها تهيئة وتشغيل الـ SDK الخاص بالمتجر. لا تقم باستدعاء المفاتيح مباشرة في المكونات الأخرى. 

### 🔄 مثال تطبيقي (فصل البيانات بواسطة الأفعال - Actions)

إذا أردنا الحصول على منتجات عبر قسم معين من المتجر، انظر لكيفية ترتيب الملف في `src/app/actions`:

```typescript
"use server";

import { ecommapsClient } from "@/lib/ecommaps";

export async function fetchCollectionProducts(slug: string) {
    try {
        // يجلب المنتجات المتوفرة والمفعلة فقط
        const response = await ecommapsClient.collections.retrieve(slug);
        return response.products;
    } catch (error) {
        console.error("Failed to load collection products", error);
        return [];
    }
}
```

---

## 3. طبقة الذكاء الاصطناعي (AI & Agentics)

الميزة الأساسية لهذا القالب هي تواجد **وكيل المبيعات الذكي** الجاهز لفهم أسئلة عملائك وتلقينهم تفاصيل المنتجات والمساعدة في بناء سلة التسوق بفعالية.

### 🧠 مسار المحادثة (`src/app/api/chat/route.ts`)

جميع الدردشات التي يقوم بها العميل تعالج محلياً في هذا المسار. يعتمد المسار على تهيئة الـ Tools والـ System Prompt الخاص بـ Ecommaps لجعل ردود الذكاء الاصطناعي منطقية وتحافظ على لغة عربية سليمة.
قالب الـ Starter لا يعرّف الأدوات (Tools) من الصفر، بل يستخدم `buildSalesAgentTools` الموفر لك من حزمة `@ecommaps/ai-sales-agent` لتأمين العمليات الحرجة والحصول على المكونات المعرفة.

**للإضافة إلى ذكاء الوكيل (دوال وأدوات مخصصة):**
بإمكانك تعريف أدوات إضافية جديدة لمطابقة احتياجات متجرك الخاصة (مثلاً: التحقق من التوصيل المجاني إلى ولاية أدرار) هكذا:

```typescript
const salesAgentTools = await buildSalesAgentTools({
  client: safeClient,
  latestUserText,
});

const myCustomTools = {
  ...salesAgentTools,
  checkFreeShippingConfig: tool({
    description: "Check if the store provides free shipping for a specific wilaya.",
    parameters: z.object({ wilaya: z.string() }),
    execute: async ({ wilaya }) => {
      // منطقك المخصص هنا للتحقق من تكاليف التوصيل
      return { freeShipping: wilaya === "Algiers" };
    }
  })
}
```

---

## 4. تخصيص المظهر (Theming)

يستخدم نظام التصميم الخاص بالقالب هيكلية واضحة تعتمد على **TailwindCSS** ومتغيرات الجذور المكتوبة بلغة الـ CSS للحفاظ على التناسق في الألوان.

- **الألوان والتصميم العام:** توجه إلى `src/app/globals.css`. ستجد متغيرات الـ Root مثل `--primary`، `--background`، و `--radius`. بتغييرك هذه المتغيرات، سيتم تعديل واجهة التطبيق بالكامل لتلائم هوية علامتك التجارية في دقائق.
- **تخصيص مكونات الرسوميات (shadcn/ui):** جميع مكونات الأزرار والحقول متواجدة داخل `src/components/ui/`. يمكنك التعديل المباشر عليها لوضع بصمتك المخصصة حيث أنها غير مغلفة ضمن مكاتب خارجية مبهمة.
- **خطوط عربية جاهزة ومدمجة:** القالب مضبوط لاستخدام `Plus Jakarta Sans` للروابط والأزرار باللغة اللاتينية، و `IBM Plex Sans Arabic` لجميع القوالب والمحتويات العربية، مما يعطي هوية بصرية واضحة وموثوقة لمتجرك الجزائري.

---

> ننصح بمتابعة الشرح الفني المتواجد في `STOREFRONT_KIT_GUIDE.md` و `MIGRATION.md` للاستزادة حول استخدام حزم الدواعم المنطقية (Logic Utilities).
