import { Metadata } from "next";
import { ProductDetailsOne } from "@/components/commercn/product-details/product-details-01";
import { ProductCardSix } from "@/components/commercn/product-cards/product-card-06";
import { getProduct, getProducts } from "@/app/actions/products";
import { mapProductsToCards } from "@/lib/product-mapper";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const product = await getProduct(resolvedParams.handle);

    return {
        title: product ? `${product.name} | Ecommaps` : `${resolvedParams.handle} | Ecommaps`,
        description: product?.description || `تسوق ${resolvedParams.handle} الآن من متجر إيكومابس`,
    };
}

import { JsonLd } from "@/components/seo/JsonLd";

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
    const resolvedParams = await params;

    // Fetch product data from the API
    const product = await getProduct(resolvedParams.handle);

    // Fetch related products (same category or latest)
    const { data: relatedApiProducts } = await getProducts({
        limit: 4,
        category: product?.category || undefined,
        sort: "newest",
    });

    // Filter out the current product from related
    const filteredRelated = relatedApiProducts.filter(p => p.slug !== resolvedParams.handle);
    const relatedProducts = mapProductsToCards(filteredRelated.slice(0, 4));

    // Construct Product JSON-LD
    const baseUrl = (process.env.NEXT_PUBLIC_STORE_URL && process.env.NEXT_PUBLIC_STORE_URL !== "undefined")
        ? process.env.NEXT_PUBLIC_STORE_URL
        : "http://localhost:3003";
    const normalizedProduct = product ? {
        ...product,
        images: product.images?.map((image) => {
            if (typeof image === "string") return image;
            if (image && typeof image === "object") {
                const url = image.url || image.src || image.image_url;
                if (url) return { url };
            }
            return undefined;
        }).filter((image): image is string | { url: string } => Boolean(image)) ?? undefined,
        options: product.options?.map((option) => ({
            name: option.name,
            values: Array.isArray(option.values) ? option.values : [],
        })) ?? undefined,
        variants: product.variants?.map((variant) => ({
            id: variant.id ?? undefined,
            option_values: variant.option_values ?? undefined,
            price: variant.price ?? product.price,
            compare_at_price: variant.compare_at_price ?? undefined,
            image_url: variant.image_url ?? undefined,
        })) ?? undefined,
    } : undefined;

    let productImage = "";
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
        const firstImg = product.images[0];
        productImage = typeof firstImg === "string" ? firstImg : (firstImg as { url: string }).url || "";
    }

    const productJsonLd = product ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": productImage,
        "sku": product.id,
        "brand": {
            "@type": "Brand",
            "name": "Ecommaps"
        },
        "offers": {
            "@type": "Offer",
            "url": `${baseUrl}/product/${product.slug}`,
            "priceCurrency": "DZD",
            "price": product.price,
            "availability": (product.inventory_quantity ?? 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
        }
    } : null;

    return (
        <div className="flex-1 w-full pb-20">
            {productJsonLd && <JsonLd data={productJsonLd} />}
            <ProductDetailsOne product={normalizedProduct} />

            {relatedProducts.length > 0 && (
                <section className="mx-auto max-w-screen-2xl px-6 lg:px-8 mt-4 lg:mt-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold tracking-tight">منتجات ذات صلة</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((p, index) => (
                            <ProductCardSix key={p.id || index} product={p} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
