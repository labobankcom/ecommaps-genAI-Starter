"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { updateCartItem, removeCartItem } from "@/app/actions/cart";
import { useCartStore } from "@/store/useCartStore";
import type { EcommapsCartItem } from "@ecommaps/client";

function formatPrice(price: number): string {
    return `${price.toLocaleString("ar-DZ")} د.ج`;
}

export function CartListItem({ item }: { item: EcommapsCartItem }) {
    const [isPending, startTransition] = useTransition();
    const setCart = useCartStore((s) => s.setCart);

    const imageUrl = item.product_image || "https://placehold.co/120x120/f5f5f5/999999?text=لا+صورة";

    const handleQuantityChange = (newQty: number) => {
        if (newQty < 1) return;
        startTransition(async () => {
            const result = await updateCartItem(item.id, newQty);
            if (result.success && result.cart) {
                setCart(result.cart);
            }
        });
    };

    const handleRemove = () => {
        startTransition(async () => {
            const result = await removeCartItem(item.id);
            if (result.success && result.cart) {
                setCart(result.cart);
            }
        });
    };

    return (
        <div className={`flex items-start gap-4 py-4 ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
            {/* Product Image */}
            <div className="shrink-0">
                <img
                    src={imageUrl}
                    className="aspect-square rounded-lg object-cover size-[72px]"
                    alt={item.product_name}
                />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-semibold text-sm truncate text-right">{item.product_name}</h3>
                {(item as { variant_options?: Record<string, string> }).variant_options && (
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-1 mt-0.5">
                        {Object.entries((item as { variant_options?: Record<string, string> }).variant_options || {}).map(([key, val]) => (
                            <span key={key} className="bg-muted px-1.5 py-0.5 rounded-sm">
                                {String(val)}
                            </span>
                        ))}
                    </div>
                )}
                <p className="text-primary font-bold text-sm">{formatPrice(item.product_price)}</p>

                {/* Quantity Controls — +/- buttons */}
                <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center border rounded-lg">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-r-lg rounded-l-none"
                            onClick={() => handleQuantityChange(item.quantity + 1)}
                            disabled={isPending}
                        >
                            <Plus className="size-3.5" />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-l-lg rounded-r-none"
                            onClick={() => handleQuantityChange(item.quantity - 1)}
                            disabled={isPending || item.quantity <= 1}
                        >
                            <Minus className="size-3.5" />
                        </Button>
                    </div>

                    <span className="text-xs text-muted-foreground">
                        × {formatPrice(item.subtotal)}
                    </span>
                </div>
            </div>

            {/* Remove Button */}
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                onClick={handleRemove}
                disabled={isPending}
            >
                <Trash2 size={16} />
                <span className="sr-only">إزالة المنتج</span>
            </Button>
        </div>
    );
}
