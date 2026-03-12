"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeartIcon, Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore, type WishlistItem } from "@/store/useWishlistStore";
import { addToCart } from "@/app/actions/cart";
import type { ProductSix } from "@/components/commercn/product-cards/product-card-06";

// Fallback mock data for when no products are passed
const fallbackProducts: ProductSix[] = [
    {
        title: "تيشيرت رياضي أبيض",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000",
        price: "3,500 د.ج",
        badge: "موسم جديد",
        rating: 4,
        colors: [
            { name: "أزرق", value: "rgb(119, 119, 218)" },
            { name: "زهري", value: "rgb(218, 119, 163)" },
            { name: "سماوي", value: "rgb(125, 176, 206)" },
            { name: "أبيض", value: "rgb(255, 255, 255)" }
        ]
    },
    {
        title: "حذاء الجري الاحترافي",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000",
        price: "15,900 د.ج",
        badge: "الأكثر مبيعاً",
        rating: 5,
        colors: [
            { name: "أسود", value: "#000000" },
            { name: "أحمر", value: "#FF0000" }
        ]
    },
    {
        title: "حقيبة ظهر للسفر",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000",
        price: "8,200 د.ج",
        rating: 4,
        colors: [
            { name: "رمادي غامق", value: "#1F2937" },
            { name: "رمادي فاتح", value: "#9CA3AF" },
            { name: "أحمر", value: "#EF4444" }
        ]
    },
    {
        title: "ساعة ذكية رياضية",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1000",
        price: "12,000 د.ج",
        badge: "خصم حصري",
        rating: 5,
        colors: [
            { name: "أسود", value: "#000000" },
            { name: "فضي", value: "#CBD5E1" }
        ]
    },
];

interface ProductCarouselProps {
    products?: ProductSix[];
}

function CarouselCard({ product }: { product: ProductSix }) {
    const [activeImage, setActiveImage] = useState(product.image);
    const [isAdding, setIsAdding] = useState(false);

    const router = useRouter();
    const { setCart, openCart } = useCartStore();
    const { items: wishlistItems, toggleItem: toggleWishlist } = useWishlistStore();

    const isFavorite = wishlistItems.some((item: WishlistItem) => item.id === product.id);

    useEffect(() => {
        setActiveImage(product.image);
    }, [product.image]);

    // Handle Add to Cart logic
    const handleAddToCart = async () => {
        if (product.colors && product.colors.length > 0) {
            router.push(`/product/${product.slug || product.id}`);
            return;
        }

        if (product.id) {
            setIsAdding(true);
            try {
                const result = await addToCart(product.id, 1);
                if (result.success && result.cart) {
                    setCart(result.cart);
                    openCart();
                }
            } finally {
                setIsAdding(false);
            }
        }
    };

    return (
        <div className="snap-start shrink-0 w-[85vw] sm:w-[500px] lg:w-[600px] h-full">
            <div className="group flex flex-col md:flex-row h-full rounded-2xl border bg-card hover:shadow-xl transition-all duration-300 overflow-hidden">
                <Link href={`/product/${product.slug || "test-product"}`} className="relative block aspect-square md:aspect-auto md:w-[45%] h-[250px] md:h-auto overflow-hidden bg-muted/50">
                    <img
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={activeImage || product.image}
                        alt={product.title}
                    />
                    {product.badge && (
                        <div className="absolute top-3 right-3 z-10">
                            <Badge variant="secondary" className="bg-white/90 text-black shadow-sm hover:bg-white">{product.badge}</Badge>
                        </div>
                    )}
                </Link>
                <div className="flex flex-1 flex-col justify-between space-y-4 p-5 md:p-6 md:w-[55%]">
                    <div className="space-y-3">
                        <Link href={`/product/${product.slug || "test-product"}`}>
                            <p className="text-xl font-bold truncate hover:text-primary transition-colors" title={product.title}>{product.title}</p>
                        </Link>
                        <div className="flex items-center gap-1 rtl:flex-row-reverse justify-end">
                            <span className="text-muted-foreground mr-1 text-xs">(4.5)</span>
                            {Array(5)
                                .fill("")
                                .map((_, i) =>
                                    i < product.rating ? (
                                        <Star key={i} className="size-4 fill-amber-500 text-amber-500" />
                                    ) : (
                                        <Star key={i} className="text-muted-foreground/30 size-4" />
                                    )
                                )}
                        </div>
                        <div className="flex items-center gap-2 pt-2 w-full">
                            <p className="text-primary text-2xl font-black">{product.price}</p>
                            {product.originalPrice && (
                                <p className="text-muted-foreground text-sm line-through">{product.originalPrice}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex items-center gap-2 min-h-[24px] py-1">
                            {product.colors && product.colors.length > 0 && product.colors.map((color, idx) => (
                                <button
                                    key={idx}
                                    className="block size-5 rounded-full border border-black/20 shadow-sm transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                    onMouseEnter={() => setActiveImage(color.image || product.originalImage || product.image)}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveImage(color.image || product.originalImage || product.image);
                                    }}
                                    aria-label={`اختر اللون ${color.name}`}
                                ></button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                className="grow font-bold rounded-xl h-12 transition-transform hover:-translate-y-1"
                                disabled={isAdding}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleAddToCart();
                                }}
                            >
                                {isAdding ? <Loader2 className="size-4 animate-spin" /> : "أضف للسلة"}
                            </Button>
                            <Button
                                variant="outline"
                                className={`rounded-xl h-12 w-12 p-0 shrink-0 border-2 transition-colors ${isFavorite ? 'border-red-500 bg-red-50' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (product.id) {
                                        toggleWishlist({
                                            id: product.id,
                                            title: product.title,
                                            price: product.price,
                                            slug: product.slug || product.id,
                                            image: activeImage || product.image
                                        });
                                    }
                                }}
                            >
                                <HeartIcon className={`size-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ProductCarousel({ products }: ProductCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const displayProducts = products && products.length > 0 ? products : fallbackProducts;

    const scrollByAmount = (direction: 'next' | 'prev') => {
        if (scrollContainerRef.current) {
            const element = scrollContainerRef.current;
            const scrollAmount = 524;
            const isRtl = document.documentElement.dir === "rtl" || true;
            const sign = direction === 'next' ? (isRtl ? -1 : 1) : (isRtl ? 1 : -1);
            element.scrollBy({ left: sign * scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <section className="container mx-auto max-w-screen-2xl px-6 lg:px-8 mt-4 mb-4">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">منتجات في دائرة الضوء</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => scrollByAmount('prev')} className="rounded-full shadow-sm hover:scale-105 transition-transform shrink-0">
                        <ChevronRight className="rtl:rotate-180" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => scrollByAmount('next')} className="rounded-full shadow-sm hover:scale-105 transition-transform shrink-0">
                        <ChevronLeft className="rtl:rotate-180" />
                    </Button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

            <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 hide-scrollbar scroll-smooth"
            >
                {displayProducts.map((product, i) => (
                    <CarouselCard key={product.id || i} product={product} />
                ))}
            </div>
        </section>
    )
}
