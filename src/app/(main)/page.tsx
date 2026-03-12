import { HeroSection } from "@/components/sections/HeroSection";
import { ArrowLeft } from "lucide-react";
import { ProductCardSix } from "@/components/commercn/product-cards/product-card-06";
import { PromoSection } from "@/components/commercn/promo-sections/promo-section-01";
import { ProductCarousel } from "@/components/commercn/product-carousel/product-carousel";
import { getProducts } from "@/app/actions/products";
import { mapProductsToCards } from "@/lib/product-mapper";

export default async function Home() {
  // Fetch real products from the Ecommaps API
  const { data: apiProducts } = await getProducts({ limit: 8, sort: "newest" });
  const featuredProducts = mapProductsToCards(apiProducts);

  // Split: first 4 for carousel, next 4 for grid (or reuse if < 8)
  const carouselProducts = featuredProducts.slice(0, Math.min(featuredProducts.length, 6));
  const gridProducts = featuredProducts.length > 4
    ? featuredProducts.slice(4)
    : featuredProducts;

  return (
    <div className="flex flex-col gap-10 pb-12 overflow-x-hidden">
      <HeroSection />

      <ProductCarousel products={carouselProducts} />

      <PromoSection />

      {/* Latest Products Grid */}
      <section className="container mx-auto max-w-screen-2xl px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">أحدث التشكيلات</h2>
          <a href="#" className="text-primary text-sm font-medium hover:underline flex items-center">
            عرض الكل <ArrowLeft className="mr-1 w-4 h-4 rtl:rotate-180" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gridProducts.length > 0 ? (
            gridProducts.map((product, i) => (
              <ProductCardSix key={product.id || i} product={product} />
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground py-12">
              لا توجد منتجات حالياً
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
