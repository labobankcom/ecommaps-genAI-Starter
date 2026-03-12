"use client";

import * as React from "react";
import { SearchIcon, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchProducts } from "@/app/actions/search";
import { mapProductsToCards } from "@/lib/product-mapper";
import type { ProductSix } from "@/components/commercn/product-cards/product-card-06";

export function NavbarSearch() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<ProductSix[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [activeImages, setActiveImages] = React.useState<Record<string, string>>({});
    const router = useRouter();

    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setLoading(true);
                try {
                    const apiData = await searchProducts(query);

                    // SMART SELECTION: Detect color keywords in query to pre-select variant
                    const colorKeywords = ["أحمر", "red", "أزرق", "blue", "أخضر", "green", "أسود", "black", "أبيض", "white", "أصفر", "yellow", "بنفسجي", "purple", "وردي", "pink"];
                    const activeFilters: Record<string, string[]> = {};

                    const detectedColor = colorKeywords.find(word => query.toLowerCase().includes(word));
                    if (detectedColor) {
                        // Attempt to match common attribute names
                        activeFilters["اللون"] = [detectedColor];
                        activeFilters["Color"] = [detectedColor];
                    }

                    // Map to UI-friendly ProductSix format with smart filters
                    const mapped = mapProductsToCards(apiData, activeFilters);
                    setResults(mapped.map(p => ({ ...p, activeFilters })));

                    // Initialize active images from mapped results
                    const initialImages: Record<string, string> = {};
                    mapped.forEach(p => {
                        if (p.id) initialImages[p.id] = p.image;
                    });
                    setActiveImages(initialImages);
                } catch (error) {
                    console.error("Search error:", error);
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setActiveImages({});
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (slug: string, activeFilters?: Record<string, string[]>) => {
        setOpen(false);
        setQuery("");
        setResults([]);

        let url = `/product/${slug}`;
        if (activeFilters && Object.keys(activeFilters).length > 0) {
            const params = new URLSearchParams();
            Object.entries(activeFilters).forEach(([key, values]) => {
                if (values.length > 0) {
                    // Use the first value for navigation
                    params.append(key.toLowerCase(), values[0]);
                }
            });
            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        router.push(url);
    };

    const setProductImage = (productId: string, imageUrl: string) => {
        setActiveImages(prev => ({ ...prev, [productId]: imageUrl }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Search">
                    <SearchIcon className="size-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[620px] p-0 gap-0 top-[15%] translate-y-0" dir="rtl" showCloseButton={false}>
                <DialogHeader className="p-4 border-b bg-muted/5">
                    <DialogTitle className="text-right sr-only">البحث عن المنتجات</DialogTitle>
                    <div className="relative flex items-center w-full">
                        <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="ابحث عن منتج، لون أو قياس..."
                            className="px-10 h-11 bg-white border-2 border-muted focus-visible:ring-1 focus-visible:ring-primary w-full text-right"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        <button
                            onClick={() => setQuery("")}
                            className={`absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-opacity duration-200 z-20 ${query ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                            aria-label="Clear search"
                        >
                            <X className="size-4 text-muted-foreground" />
                        </button>
                    </div>
                </DialogHeader>

                <div className="max-h-[500px] overflow-y-auto p-2 scrollbar-thin">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                            <Loader2 className="size-8 animate-spin text-primary/60" />
                            <p className="text-sm font-medium">جاري البحث عن أحدث التشكيلات...</p>
                        </div>
                    )}

                    {!loading && query.trim().length >= 2 && results.length === 0 && (
                        <div className="py-16 text-center">
                            <div className="bg-muted/30 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <SearchIcon className="size-8 text-muted-foreground/30" />
                            </div>
                            <p className="text-base font-semibold">لا توجد نتائج لـ "{query}"</p>
                            <p className="text-sm text-muted-foreground mt-1">حاول البحث بكلمات أخرى أو تفقد القسم الجديد</p>
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div className="grid gap-2 py-2">
                            <div className="px-3 pb-2 flex justify-between items-center">
                                <span className="text-xs font-bold text-muted-foreground/60">نتائج البحث</span>
                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                                    {results.length} منتج
                                </span>
                            </div>
                            {results.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center gap-4 p-2 hover:bg-muted/50 rounded-xl transition-all text-right group w-full border border-transparent hover:border-muted cursor-pointer"
                                    onClick={() => product.slug && handleSelect(product.slug, (product as any).activeFilters)}
                                >
                                    <div className="size-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/40 relative">
                                        <img
                                            src={product.id ? (activeImages[product.id] || product.image) : product.image}
                                            alt={product.title}
                                            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        {product.badge && (
                                            <div className="absolute top-1 right-1">
                                                <span className="text-[8px] bg-primary text-primary-foreground px-1 py-0.5 rounded-sm font-bold">
                                                    {product.badge}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                                        <h4 className="text-sm font-bold leading-tight truncate group-hover:text-primary transition-colors">
                                            {product.title}
                                        </h4>
                                        <div className="flex items-center gap-2 justify-start">
                                            <p className="text-base font-black text-primary">
                                                {product.price}
                                            </p>
                                            {product.originalPrice && (
                                                <span className="text-xs text-muted-foreground/60 line-through">
                                                    {product.originalPrice}
                                                </span>
                                            )}
                                        </div>

                                        {/* Variant preview */}
                                        {product.colors && product.colors.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
                                                {product.colors.map((color, i) => (
                                                    <button
                                                        key={i}
                                                        className="size-4 rounded-full border border-black/10 shadow-sm transition-all hover:scale-125 hover:ring-2 hover:ring-primary/20 ring-offset-1"
                                                        style={{ backgroundColor: color.value }}
                                                        title={color.name}
                                                        onMouseEnter={() => product.id && color.image && setProductImage(product.id, color.image)}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            product.id && color.image && setProductImage(product.id, color.image);
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <X className="size-4 text-primary rotate-45" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && !query && (
                        <div className="py-24 text-center text-muted-foreground">
                            <div className="bg-primary/5 size-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <SearchIcon className="size-10 text-primary/30" />
                            </div>
                            <p className="text-base font-bold text-foreground">ما الذي تبحث عنه اليوم؟</p>
                            <p className="text-sm opacity-60 mt-1 max-w-[280px] mx-auto">ابدأ بكتابة اسم المنتج، اللون أو حتى الماركة لتشاهد سحر البحث الذكي</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
