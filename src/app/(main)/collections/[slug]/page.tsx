import { getCollection, getCollections } from "@/app/actions/collections";
import { getProducts } from "@/app/actions/products";
import { mapProductsToCards } from "@/lib/product-mapper";
import { SortSelect, CollectionSidebar } from "@/components/collections/CollectionFilters";
import { ProductCardSix } from "@/components/commercn/product-cards/product-card-06";
import { notFound } from "next/navigation";
import type { EcommapsProduct, EcommapsProductOption, EcommapsProductVariant } from "@ecommaps/client";

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

/**
 * Extract unique option names and their values from all products in the collection.
 * e.g. { "Size": ["S", "M", "L", "XL"], "color": ["red", "blue"] }
 */
function extractAvailableOptions(products: EcommapsProduct[]): Record<string, string[]> {
    const optionsMap: Record<string, Set<string>> = {};

    for (const product of products) {
        if (product.options && Array.isArray(product.options)) {
            for (const opt of product.options) {
                const name = opt.name;
                if (!name) continue;

                if (!optionsMap[name]) optionsMap[name] = new Set();

                const vals = Array.isArray(opt.values) ? opt.values : [];

                vals.forEach((v: string) => {
                    if (v) optionsMap[name].add(v);
                });
            }
        }
    }

    const result: Record<string, string[]> = {};
    for (const [name, set] of Object.entries(optionsMap)) {
        result[name] = Array.from(set);
    }
    return result;
}

export default async function CollectionPage({ params, searchParams }: PageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { slug } = resolvedParams;

    // Fetch collection details
    const collectionData = await getCollection(slug);
    if (!collectionData) notFound();

    const { collection } = collectionData;

    // Fetch all collections for the sidebar filter
    const allCollections = await getCollections();

    // Build product query from search params
    const productParams: Record<string, string | number> = {
        collection: slug,
        limit: 24,
    };

    if (resolvedSearchParams.sort) productParams.sort = resolvedSearchParams.sort;
    if (resolvedSearchParams.q) productParams.q = resolvedSearchParams.q;
    if (resolvedSearchParams.min_price) productParams.min_price = resolvedSearchParams.min_price;
    if (resolvedSearchParams.max_price) productParams.max_price = resolvedSearchParams.max_price;
    if (resolvedSearchParams.in_stock) productParams.in_stock = resolvedSearchParams.in_stock;

    // Fetch products filtered by this collection
    const { data: products, pagination } = await getProducts(productParams);

    // ── Collect active option filters from URL (opt_size=M,L  opt_color=red) ──
    const selectedOptionFilters: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(resolvedSearchParams)) {
        if (key.startsWith("opt_") && value) {
            const optionName = key.slice(4); // strip "opt_"
            selectedOptionFilters[optionName] = value.split(",");
        }
    }

    // ── Filter products: keep only those whose variants match ALL selected option filters ──
    const hasActiveFilters = Object.keys(selectedOptionFilters).length > 0;
    const filteredProducts = hasActiveFilters
        ? products.filter((product: EcommapsProduct) => {
            // Products without variants/options pass through
            if (!product.variants || product.variants.length === 0) return false;
            if (!product.options || product.options.length === 0) return false;

            // Check if the product has at least one variant matching ALL filters
            return product.variants.some((variant: EcommapsProductVariant) => {
                const optionValues = variant.option_values || variant.options || {};
                // optionValues could be array or object
                // From the API: options = option_values which is an array ["S", "red"]
                // Product.options = [{name: "Size", values: "S,M,L"}, {name: "color", values: "red,blue"}]
                const productOptions = (product.options || []) as EcommapsProductOption[];

                return Object.entries(selectedOptionFilters).every(([filterKey, filterValues]) => {
                    // Find which position this option name is in
                    const optIndex = productOptions.findIndex(
                        (o: EcommapsProductOption) => o.name.toLowerCase() === filterKey.toLowerCase()
                    );
                    if (optIndex === -1) return false;

                    // Get the exact original option name from the product schema to match the dictionary key
                    const optName = productOptions[optIndex].name;
                    let variantValue: string | undefined;
                    if (Array.isArray(optionValues)) {
                        variantValue = optionValues[optIndex];
                    } else if (optionValues && typeof optionValues === "object") {
                        variantValue = (optionValues as Record<string, string>)[optName];
                    }
                    if (!variantValue || typeof variantValue !== "string") return false;

                    return filterValues.includes(variantValue);
                });
            });
        })
        : products;

    const productCards = mapProductsToCards(filteredProducts, selectedOptionFilters);

    // Extract available options (sizes, colors, …) from ALL products (not filtered)
    const availableOptions = extractAvailableOptions(products);

    return (
        <section className="py-5 lg:py-8">
            <div className="container mx-auto max-w-screen-2xl px-6 lg:px-8">
                {/* Header Row */}
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
                    <div className="hidden lg:block" />
                    <header className="mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold lg:text-3xl">{collection.title}</h1>
                            {collection.description && (
                                <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>
                            )}
                        </div>
                        <SortSelect />
                    </header>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
                    {/* Sidebar Filters */}
                    <CollectionSidebar
                        collections={allCollections}
                        currentSlug={slug}
                        availableOptions={availableOptions}
                    />

                    {/* Products Grid */}
                    <div>
                        {productCards.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <p className="text-lg text-muted-foreground">لا توجد منتجات في هذه المجموعة</p>
                                <p className="mt-1 text-sm text-muted-foreground/70">جرّب تغيير الفلاتر أو البحث</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                                    {productCards.map((product, i) => (
                                        <ProductCardSix key={product.id || i} product={product} />
                                    ))}
                                </div>
                                {pagination.has_more && (
                                    <div className="mt-8 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            عرض {products.length} من {pagination.total} منتج
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
