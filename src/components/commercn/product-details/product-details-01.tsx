"use client";

import { useState } from "react";
import { HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { addToCart } from "@/app/actions/cart";
import { useCartStore } from "@/store/useCartStore";

interface ProductDetailsProps {
    product?: {
        id: string;
        name: string;
        slug: string;
        description?: string | null;
        price: number;
        compare_at_price?: number | null;
        currency?: string | null;
        images?: (string | { url: string })[];
        category?: string | null;
        tags?: string[] | null;
        sku?: string | null;
        vendor?: string | null;
        variants?: { id?: string; option_values?: Record<string, string>; price: number; compare_at_price?: number | null; image_url?: string }[];
        options?: { name: string; values: string[] }[];
        inventory_quantity?: number | null;
        is_active?: boolean | null;
    };
}

const mockProduct = {
    id: "mock",
    name: "حذاء رياضي احترافي",
    slug: "mock-product",
    description: null,
    price: 15900,
    compare_at_price: 18900,
    category: null,
    vendor: null,
    sku: null,
    images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000",
        "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=1000",
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1000",
    ],
    options: [],
    variants: [],
};

function getImageUrl(img: string | { url: string } | unknown): string {
    if (typeof img === "string") return img;
    if (typeof img === "object" && img !== null && "url" in img) {
        return (img as { url: string }).url;
    }
    return "https://placehold.co/600x600/f5f5f5/999999?text=لا+صورة";
}

function formatPrice(price: number): string {
    return `${price.toLocaleString("ar-DZ")} د.ج`;
}

function normalizeOptionName(name: string): string {
    const lower = name.toLowerCase();
    if (lower === "size") return "المقاس";
    if (lower === "color" || lower === "colour") return "اللون";
    return name;
}

function normalizeOptionValue(value: string): string {
    const map: Record<string, string> = {
        red: "أحمر",
        blue: "أزرق",
        black: "أسود",
        white: "أبيض",
        green: "أخضر",
        yellow: "أصفر",
        grey: "رمادي",
        gray: "رمادي",
        brown: "بني",
        pink: "وردي",
        purple: "بنفسجي",
        orange: "برتقالي",
        beige: "بيج",
        silver: "فضي",
        gold: "ذهبي",
    };
    return map[value.toLowerCase()] || value;
}

export function ProductDetailsOne({ product }: ProductDetailsProps) {
    const p = product || mockProduct;
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [selectedImage, setSelectedImage] = useState(0);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const activeVariant = p.variants?.find((v) => {
        if (!v.option_values) return false;
        const selectedEntries = Object.entries(selectedOptions);
        if (selectedEntries.length === 0) return false;
        return selectedEntries.every(([key, val]) => v.option_values![key] === val);
    }) || null;

    const displayPrice = activeVariant && activeVariant.price > 0 ? activeVariant.price : p.price;
    const displayCompareAt = activeVariant && activeVariant.compare_at_price
        ? activeVariant.compare_at_price
        : (p.compare_at_price || null);

    const images: string[] = p.images && Array.isArray(p.images) && p.images.length > 0
        ? p.images.map(getImageUrl)
        : mockProduct.images;

    const variantImage = activeVariant?.image_url;
    const mainImageUrl = variantImage && selectedImage === 0 ? variantImage : images[selectedImage];

    const descriptionLines = p.description
        ? p.description.split(/[.،\n]/).filter((s: string) => s.trim().length > 0).slice(0, 4)
        : [];

    const { setCart, openCart } = useCartStore();

    const handleAddToCart = async () => {
        if (p.id === "mock") return;

        if (p.options && p.options.length > 0) {
            const hasUnselectedOptions = p.options.some((opt) => !selectedOptions[opt.name]);
            if (hasUnselectedOptions) {
                setValidationError("الرجاء تحديد جميع الخيارات المطلوبة قبل الإضافة إلى السلة.");
                return;
            }
        }

        setValidationError(null);
        setIsAddingToCart(true);
        try {
            const variantId = activeVariant?.id;
            const result = await addToCart(p.id, 1, variantId);
            if (result.success && result.cart) {
                setCart(result.cart);
                openCart();
            }
        } finally {
            setIsAddingToCart(false);
        }
    };

    const hasDiscount = !!displayCompareAt && displayCompareAt > displayPrice;
    const discountPercentage = hasDiscount ? Math.round(((displayCompareAt - displayPrice) / displayCompareAt) * 100) : 0;
    return (
        <section className="py-8 lg:py-12" dir="rtl">
            <div className="mx-auto max-w-screen-2xl px-6 lg:px-8">
                <div className="grid gap-8 xl:grid-cols-[1.15fr_.85fr]">
                    <div className="grid gap-4 lg:grid-cols-[88px_minmax(0,1fr)]">
                        <div className="order-2 flex flex-row gap-3 overflow-x-auto pb-1 lg:order-1 lg:flex-col lg:overflow-visible">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={cn(
                                        "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border bg-background transition-all md:h-24 md:w-24",
                                        selectedImage === index
                                            ? "border-primary shadow-lg shadow-primary/15"
                                            : "border-border hover:border-primary/40"
                                    )}
                                >
                                    <img
                                        src={image}
                                        alt={`صورة المنتج ${index + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="order-1 space-y-4 lg:order-2">
                            <figure className="group relative aspect-square overflow-hidden rounded-[2rem] border border-border/70 bg-[#edf1f5] shadow-sm">
                                <div className="absolute right-5 top-5 z-10 flex flex-wrap gap-2">
                                    {hasDiscount && (
                                        <Badge className="rounded-full bg-destructive px-3 py-1 text-sm font-bold text-white">
                                            خصم {discountPercentage}%
                                        </Badge>
                                    )}
                                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm font-semibold">
                                        متوفر الآن
                                    </Badge>
                                </div>
                                <img
                                    src={mainImageUrl}
                                    alt={p.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                />
                            </figure>

                        </div>
                    </div>

                    <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
                        <div className="space-y-4 rounded-[2rem] border border-border/70 bg-background/95 p-6 shadow-sm">
                            <div className="flex flex-wrap items-center gap-2">
                                {p.category && (
                                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm font-semibold">
                                        {p.category}
                                    </Badge>
                                )}
                                {p.vendor && (
                                    <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-semibold">
                                        {p.vendor}
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-3 text-right">
                                <h1 className="text-3xl font-black leading-tight text-foreground md:text-5xl">
                                    {p.name}
                                </h1>
                            </div>

                            <div className="rounded-[1.5rem] bg-muted/40 p-5 text-right">
                                <div className="flex items-end justify-between gap-4">
                                    <div className="text-left">
                                        {hasDiscount && (
                                            <p className="text-sm text-muted-foreground line-through">
                                                {formatPrice(displayCompareAt)}
                                            </p>
                                        )}
                                        <p className="text-4xl font-black text-primary md:text-5xl">
                                            {formatPrice(displayPrice)}
                                        </p>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <p>السعر شامل الضرائب</p>
                                        <p className="mt-1">والدفع متاح عند الاستلام</p>
                                    </div>
                                </div>
                            </div>

                            {p.options && p.options.length > 0 && (
                                <div className="space-y-5">
                                    {p.options.map((option) => (
                                        <div key={option.name} className="space-y-3">
                                            <div className="text-right">
                                                <h3 className="text-sm font-bold">{normalizeOptionName(option.name)}</h3>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {selectedOptions[option.name]
                                                        ? `المحدد: ${normalizeOptionValue(selectedOptions[option.name])}`
                                                        : "يرجى اختيار قيمة"}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap justify-start gap-2">
                                                {option.values.map((val: string) => {
                                                    const isSelected = selectedOptions[option.name] === val;
                                                    return (
                                                        <Button
                                                            key={val}
                                                            variant={isSelected ? "default" : "outline"}
                                                            onClick={() => {
                                                                setValidationError(null);
                                                                setSelectedOptions((prev) => ({ ...prev, [option.name]: val }));
                                                            }}
                                                            className={cn(
                                                                "min-w-[78px] rounded-full px-5 font-bold",
                                                                isSelected ? "shadow-sm" : "bg-background"
                                                            )}
                                                        >
                                                            {normalizeOptionValue(val)}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Separator />

                            <div className="rounded-[1.5rem] border bg-muted/20 p-5 text-right">
                                <h2 className="mb-4 text-lg font-black">تفاصيل المنتج</h2>
                                <ul className="space-y-3">
                                    {(descriptionLines.length > 0 ? descriptionLines : ["لا توجد تفاصيل إضافية حالياً"]).map((line: string, i: number) => (
                                        <li key={i} className="flex items-start justify-start gap-3 text-base text-muted-foreground">
                                            <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                                            <span>{line.trim()}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {validationError && (
                                <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">
                                    {validationError}
                                </p>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 w-14 rounded-2xl border-border bg-background"
                                >
                                    <HeartIcon className="size-5" />
                                </Button>
                                <Button
                                    size="lg"
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart}
                                    className="h-14 flex-1 rounded-2xl bg-foreground text-lg font-black text-background shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-foreground/95"
                                >
                                    {isAddingToCart ? "جاري الإضافة..." : "إضافة للسلة"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
