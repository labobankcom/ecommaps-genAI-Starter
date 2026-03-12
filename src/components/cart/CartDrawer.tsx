"use client";

import React, { useEffect, useTransition } from "react";
import { ShoppingBag, Info } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useCartStore } from "@/store/useCartStore";
import { CartListItem } from "./cart-item";
import { getCart } from "@/app/actions/cart";

function formatPrice(price: number): string {
    return `${price.toLocaleString("ar-DZ")} د.ج`;
}

export function CartDrawer() {
    const { isOpen, closeCart, openCart, cart, setCart, setLoading, isLoading } = useCartStore();
    const [isPending, startTransition] = useTransition();

    // Fetch cart data when drawer opens
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            startTransition(async () => {
                const cartData = await getCart();
                setCart(cartData);
                setLoading(false);
            });
        }
    }, [isOpen]);

    const handleOpenChange = (open: boolean) => {
        if (open) {
            openCart();
        } else {
            closeCart();
        }
    };

    const isEmpty = !cart || !cart.items || cart.items.length === 0;
    const subtotal = cart?.subtotal || 0;

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
                <SheetHeader className="border-b p-4 pb-4">
                    <SheetTitle className="font-bold lg:text-lg flex items-center gap-2">
                        سلة المشتريات
                        {cart && cart.items_count > 0 && (
                            <span className="text-xs bg-primary text-primary-foreground rounded-full size-5 flex items-center justify-center">
                                {cart.items_count}
                            </span>
                        )}
                    </SheetTitle>
                    <SheetDescription className="sr-only">قائمة المنتجات المضافة إلى سلة التسوق الخاصة بك.</SheetDescription>
                </SheetHeader>

                <div className="grow overflow-y-auto p-4 pt-0">
                    {isLoading || isPending ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-sm">جاري تحميل السلة...</p>
                        </div>
                    ) : isEmpty ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <ShoppingBag className="size-12 mb-4 opacity-30" />
                            <p className="font-medium text-lg mb-1">سلتك فارغة</p>
                            <p className="text-sm">أضف بعض المنتجات للبدء</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {cart!.items.map((item) => (
                                <CartListItem key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                {!isEmpty && (
                    <div className="bg-muted/50 flex flex-col space-y-6 rounded-lg p-6">
                        <div className="space-y-4">
                            <h2 className="font-semibold">ملخص الطلب</h2>

                            <div className="flex justify-between text-sm">
                                <p>المجموع الفرعي</p>
                                <p className="font-medium">{formatPrice(subtotal)}</p>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <p>تكلفة الشحن</p>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="text-muted-foreground mr-1 size-4 cursor-pointer" />
                                            </TooltipTrigger>
                                            <TooltipContent>يتم حساب تكلفة الشحن عند إتمام الطلب بناءً على الولاية.</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <p className="font-medium text-muted-foreground text-xs">يُحسب عند الدفع</p>
                            </div>

                            <div className="flex justify-between border-t border-border pt-4 text-sm font-medium">
                                <p>الإجمالي الفرعي</p>
                                <p className="text-primary font-bold text-base">{formatPrice(subtotal)}</p>
                            </div>
                        </div>

                        <Button
                            asChild
                            className="w-full h-12 rounded-full font-bold shadow-lg hover:-translate-y-1 transition-all"
                        >
                            <Link href="/checkout" onClick={closeCart}>إتمام الدفع</Link>
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
