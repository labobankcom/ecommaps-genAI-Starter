"use client";

import React from "react";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

import { useWishlistStore, WishlistItem } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { addToCart } from "@/app/actions/cart";

function formatPrice(priceStr: string | number): string {
    // If it's already a formatted string, just return it
    if (typeof priceStr === 'string' && priceStr.includes('د.ج')) {
        return priceStr;
    }

    // Convert to number if it's a raw string
    const numericPrice = typeof priceStr === 'string'
        ? parseFloat(priceStr.replace(/[^\d.]/g, ''))
        : priceStr;

    if (isNaN(numericPrice)) return "0 د.ج";

    return `${numericPrice.toLocaleString("ar-DZ")} د.ج`;
}

function WishlistListItem({ item }: { item: WishlistItem }) {
    const { removeItem } = useWishlistStore();
    const { setCart, openCart } = useCartStore();
    const closeWishlist = useWishlistStore(state => state.closeWishlist);
    const router = useRouter();
    const [isAdding, setIsAdding] = React.useState(false);

    const handleAddToCart = async () => {
        // Here we ideally need to know if the product has variants to redirect.
        // For simplicity in the wishlist, we'll try to add it directly.
        // If the backend refuses due to missing variants, we should redirect.
        setIsAdding(true);
        try {
            const result = await addToCart(item.id, 1);
            if (result.success && result.cart) {
                setCart(result.cart);

                // Only redirect to Cart if this is the only item in the wishlist
                if (useWishlistStore.getState().itemsCount() === 1) {
                    closeWishlist();
                    openCart();
                }
            } else if (!result.success && result.error?.includes("variants")) {
                // Fallback: If it requires variant selection, go to product page
                closeWishlist();
                router.push(`/product/${item.slug}`);
            }
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className={`flex items-start gap-4 py-4 ${isAdding ? "opacity-50 pointer-events-none" : ""}`}>
            {/* Product Image */}
            <Link href={`/product/${item.slug}`} onClick={() => closeWishlist()} className="shrink-0">
                <img
                    src={item.image || "https://placehold.co/120x120/f5f5f5/999999?text=لا+صورة"}
                    className="aspect-square rounded-lg object-cover size-[72px] hover:opacity-80 transition-opacity"
                    alt={item.title}
                />
            </Link>

            {/* Product Info */}
            <div className="flex-1 min-w-0 space-y-1">
                <Link href={`/product/${item.slug}`} onClick={() => closeWishlist()}>
                    <h3 className="font-semibold text-sm truncate text-right hover:text-primary transition-colors">{item.title}</h3>
                </Link>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/40">
                    <p className="font-bold text-primary text-sm">{formatPrice(item.price)}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => removeItem(item.id)}
                    aria-label="إزالة من المفضلة"
                >
                    <Trash2 className="size-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="size-8 text-primary hover:bg-primary hover:text-primary-foreground rounded-full border-primary/20"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    aria-label="أضف للسلة"
                >
                    <ShoppingBag className="size-4" />
                </Button>
            </div>
        </div>
    );
}

export function WishlistDrawer() {
    const { isOpen, closeWishlist, openWishlist, items, itemsCount } = useWishlistStore();

    const handleOpenChange = (open: boolean) => {
        if (open) {
            openWishlist();
        } else {
            closeWishlist();
        }
    };

    const isEmpty = itemsCount() === 0;

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
                <SheetHeader className="border-b p-4 pb-4">
                    <SheetTitle className="font-bold lg:text-lg flex items-center gap-2">
                        <Heart className="size-5 fill-red-500 text-red-500" />
                        المفضلة
                        {itemsCount() > 0 && (
                            <span className="text-xs bg-primary text-primary-foreground rounded-full size-5 flex items-center justify-center">
                                {itemsCount()}
                            </span>
                        )}
                    </SheetTitle>
                    <SheetDescription className="sr-only">قائمة المنتجات المفضلة لديك.</SheetDescription>
                </SheetHeader>

                <div className="grow overflow-y-auto p-4 pt-0">
                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <Heart className="size-12 mb-4 opacity-30" />
                            <p className="font-medium text-lg mb-1">المفضلة فارغة</p>
                            <p className="text-sm text-center">لم تقم بإضافة أي منتجات إلى المفضلة بعد.</p>
                            <Button variant="outline" className="mt-6 rounded-full" onClick={closeWishlist}>
                                متابعة التسوق
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {items.map((item) => (
                                <WishlistListItem key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
