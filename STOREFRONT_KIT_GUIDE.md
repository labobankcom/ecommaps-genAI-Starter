# 📦 دليل استخدام Storefront Kit

إضافةً إلى الـ SDK الأساسي (`@ecommaps/client`)، يقدم إيكومابس أداة **أطقم واجهات المتاجر** القوية تحت اسم `@ecommaps/storefront-kit`. 

تم تصميم هذه الحزمة لتجريد المنطق البرمجي المعقد للتجارة الإلكترونية (Commerce Logic) عن واجهات React. بمجرد استخدامها، تضمن توحيد وعرض بيانات المتجر بطريقة مثالية للمستخدم دون الحاجة لإعادة كتابة القواعد الخفية لإدارة السلة والمنتجات في كل صفحة.

---

## 📚 الوظائف الأساسية ومجالات الاستخدام

سواءً كنت تبني صفحة منتج، مكون ذكي للمحادثة (AI Sales Chat)، أو نافذة منبثقة للسلة، تقوم الدوال التالية بتسهيل جميع مهام التجارة بسلاسة تامة.

### 1. حل وتحديد خصائص المنتج المتغير (`resolveVariantSelection`)

يعد اختيار المتغيرات الصحيحة من أكثر التحديات تعقيداً (تخيل منتجاً ذا ألوان متعددة، كل لون له قياسات وصور محددة).
تأخذ `resolveVariantSelection` سجل المنتج ككل إلى جانب خيارات المستخدم وتقوم بـ:
- تطبيق أولوية التحديد لـ `Color` (اللون) ومن ثم `Size` (القياس) عند التعارض أو التبديل العرضي بينهما.
- منع حدوث مطابقة جزئية خاطئة قد تسبب إضافة نوع غير متوفر من المنتجات لسلة التسوق.
- إرجاع حالة `requires_selection` لتنبيه المطور بوجود غموض (مثلاً: المستخدم اختار المقاس وتجاهل اللون).

**مثال تطبيقي:**
```typescript
import { resolveVariantSelection } from '@ecommaps/storefront-kit';

// القاموس الذي اختاره المستخدم (مثل: احمر ومقاس XL)
const userSelection = { color: 'Red', size: 'XL' };

const result = resolveVariantSelection(product, userSelection);

if (result.matchedVariant) {
   console.log("تم العثور على المتغير المطابق تماماً!", result.matchedVariant.id);
} else if (result.requiresMultiSelection) {
   console.log("تنبيه: يجب على المستخدم اختيار المقاس أيضاً.");
}
```

### 2. توحيد بطاقات المنتجات (`normalizeProductCard`)

بيانات المنتج القادمة من الواجهة البرمجية المعيارية تكون ضخمة ومليئة بالتفاصيل (حجم الاستجابة يختلف). تقوم أداة `normalizeProductCard` بتحجيم (Normalizing) البيانات وتوحيدها لعرضها مباشرة كبطاقة منتج نظيفة.
هذه الدالة تستخرج بأمان صورة المنتج الرئيسية، معرفات المنتجات، الخصومات الحالية (تنسيق الأسعار)، وحالة توفر المنتج في المخزون.

**مثال تطبيقي:**
```typescript
import { normalizeProductCard } from '@ecommaps/storefront-kit';

function MyProductCard({ productData }) {
  const cardData = normalizeProductCard(productData);
  
  return (
    <div>
      <img src={cardData.image} alt={cardData.name} />
      <h3>{cardData.name}</h3>
      <p>{cardData.price}</p>
      {cardData.compare_at_price && <span>{cardData.compare_at_price}</span>}
      {!cardData.available && <p>غير متوفر مؤقتاً</p>}
    </div>
  );
}
```

### 3. تصنيف وتوحيد استجابات التسعير (`classifyPromotionStatus` & `normalizeCartSummary`)

بناء عربة التسوق يتطلب حسابات دقيقة لكوبونات الخصم وقواعد الخصم التلقائية والتوصيل، وتقوم الحزمة بتسهيل الأمر بتوفير دوال للتوحيد (Normalization) بدلاً من إعادة اختراع عجلة حساب السلة:
- `normalizeCartSummary`: توحيد شكل بيانات السلة لتوافق العرض المعتمد على جميع واجهات ووكلاء إيكومابس.
- `classifyPromotionStatus`: تصنف وتقيم حالة العرض (Promotion) وتتيح للمتجر التعامل بفعالية مع الأخطاء.

**تقسيم حالات تصنيف الخصم:**
- `applied_now`: الخصم مستخدم ونجح.
- `eligible_with_conditions`: العرض يستلزم تلبية شروط مالية أو كميات محددة.
- `code_required`: يستلزم إضافة الكوبون يدوياً من المستخدم.
- `invalid_code`: خطأ في تفعيل أو كتابة الخصم.

---

> تذكر دائماً: بدلاً من بناء خوارزميات تحديد منتجات متغيرة يدوياً في كل واجهة مستخدم، ابحث عن الدوال المدمجة في حزمة `@ecommaps/storefront-kit` للحل الأمثل، الموثوق والخالي من الأخطاء!
