"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeartIcon, Star, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore, type WishlistItem } from "@/store/useWishlistStore";
import { addToCart } from "@/app/actions/cart";

export interface ProductColor {
    name: string;
    value: string;
    image?: string;
}

export interface ProductSix {
    id?: string;
    slug?: string;
    title: string;
    image: string;
    originalImage?: string;
    price: string;
    originalPrice?: string;
    badge?: string;
    rating: number;
    colors: ProductColor[];
}

export function ProductCardSix({ product }: { product: ProductSix }) {
    const [activeImage, setActiveImage] = useState(product.image);
    const [isAdding, setIsAdding] = useState(false);

    const router = useRouter();
    const { setCart, openCart } = useCartStore();
    const { items: wishlistItems, toggleItem: toggleWishlist } = useWishlistStore();

    const isFavorite = wishlistItems.some((item: WishlistItem) => item.id === product.id);

    // Sync activeImage if the parent passes a new product.image (e.g. from URL filters)
    useEffect(() => {
        setActiveImage(product.image);
    }, [product.image]);

    // Handle Add to Cart logic
    const handleAddToCart = async () => {
        // If product has variants (colors > 0), redirect to detail page to select size/color
        if (product.colors && product.colors.length > 0) {
            router.push(`/product/${product.slug || product.id}`);
            return;
        }

        // Otherwise, add to cart directly using server action
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
        <div className="group flex flex-col rounded-2xl border bg-card hover:shadow-lg transition-all">
            <Link href={`/product/${product.slug || "test-product"}`} className="relative aspect-square w-full overflow-hidden rounded-t-2xl object-cover bg-muted/50 block">
                <img
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={activeImage || product.image}
                    alt={product.title}
                />
                {product.badge && (
                    <div className="absolute top-3 right-3 z-10">
                        <Badge variant="secondary" className="bg-white/90 text-black hover:bg-white">{product.badge}</Badge>
                    </div>
                )}
            </Link>
            <div className="flex flex-1 flex-col justify-between space-y-3 p-5">
                <div className="space-y-2">
                    <Link href={`/product/${product.slug || "test-product"}`}>
                        <h3 className="text-xl font-bold truncate hover:text-primary transition-colors" title={product.title}>{product.title}</h3>
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

                    <div className="flex items-center gap-2">
                        <p className="text-primary text-xl font-black">{product.price}</p>
                        {product.originalPrice && (
                            <p className="text-muted-foreground text-sm line-through">{product.originalPrice}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 py-1 min-h-[24px]">
                    {product.colors && product.colors.map((color, i) => (
                        <button
                            key={i}
                            className="block size-4 md:size-5 rounded-full border border-black/20 shadow-sm transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
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

                <div className="flex gap-2 pt-2">
                    <Button
                        className="grow font-bold rounded-xl h-11 transition-all hover:-translate-y-1"
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
                        className={`rounded-xl h-11 w-11 p-0 shrink-0 border-2 transition-colors ${isFavorite ? 'border-red-500 bg-red-50' : ''}`}
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
    );
}
