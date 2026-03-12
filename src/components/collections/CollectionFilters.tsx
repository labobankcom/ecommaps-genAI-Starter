"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { EcommapsCollection } from "@ecommaps/client";

// ─── Sort Select ────────────────────────────────────────────────
const sortFilters = [
    { key: "newest", name: "الأحدث" },
    { key: "price_asc", name: "السعر: الأقل إلى الأعلى" },
    { key: "price_desc", name: "السعر: الأعلى إلى الأقل" },
    { key: "name_asc", name: "الاسم: أ-ي" },
    { key: "name_desc", name: "الاسم: ي-أ" },
];

function SortSelect() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleSort = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <Select
            defaultValue={searchParams.get("sort") || "newest"}
            onValueChange={handleSort}
        >
            <SelectTrigger className="w-[200px]">
                <span className="text-muted-foreground text-sm ml-1">ترتيب:</span>
                <SelectValue placeholder="ترتيب" />
            </SelectTrigger>
            <SelectContent>
                {sortFilters.map((item) => (
                    <SelectItem key={item.key} value={item.key}>
                        {item.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

// ─── Sidebar Filters ────────────────────────────────────────────
interface SidebarProps {
    collections: EcommapsCollection[];
    currentSlug: string;
    availableOptions?: Record<string, string[]>;
}

function Sidebar({ collections, currentSlug, availableOptions = {} }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const initialMinPrice = Number(searchParams.get("min_price") || 0);
    const initialMaxPrice = Number(searchParams.get("max_price") || 100000);
    const maxPriceLimit = 100000;

    const [priceRange, setPriceRange] = useState([initialMinPrice, initialMaxPrice]);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

    const updateParams = useCallback(
        (key: string, value: string | null) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            router.push(`${pathname}?${params.toString()}`);
        },
        [router, pathname, searchParams]
    );

    const formatPrice = (price: number) => {
        if (price >= maxPriceLimit) return `${price.toLocaleString("ar-DZ")}+ د.ج`;
        return `${price.toLocaleString("ar-DZ")} د.ج`;
    };

    const handlePriceCommit = (values: number[]) => {
        const params = new URLSearchParams(searchParams.toString());
        if (values[0] > 0) {
            params.set("min_price", values[0].toString());
        } else {
            params.delete("min_price");
        }
        if (values[1] < maxPriceLimit) {
            params.set("max_price", values[1].toString());
        } else {
            params.delete("max_price");
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSearch = () => {
        updateParams("q", searchQuery || null);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    const inStock = searchParams.get("in_stock") === "true";

    // Helper: get the label for an option name
    const getOptionLabel = (name: string) => {
        const lower = name.toLowerCase();
        if (lower === "size" || lower === "مقاس" || lower === "الحجم") return "المقاس";
        if (lower === "color" || lower === "colour" || lower === "لون" || lower === "اللون") return "اللون";
        return name;
    };

    // Toggle an option value in/out of a comma-separated param
    const toggleOptionValue = (optionName: string, value: string) => {
        const paramKey = `opt_${optionName.toLowerCase()}`;
        const current = searchParams.get(paramKey);
        const values = current ? current.split(",") : [];
        const idx = values.indexOf(value);

        if (idx >= 0) {
            values.splice(idx, 1);
        } else {
            values.push(value);
        }

        updateParams(paramKey, values.length > 0 ? values.join(",") : null);
    };

    const isOptionSelected = (optionName: string, value: string) => {
        const paramKey = `opt_${optionName.toLowerCase()}`;
        const current = searchParams.get(paramKey);
        if (!current) return false;
        return current.split(",").includes(value);
    };

    return (
        <aside className="space-y-8">
            {/* Search */}
            <div className="space-y-3">
                <div className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                    البحث
                </div>
                <Input
                    type="text"
                    placeholder="ابحث عن منتج..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    onBlur={handleSearch}
                    className="text-right"
                />
            </div>

            {/* Price Range */}
            <div className="space-y-3">
                <div className="text-muted-foreground flex justify-between text-sm">
                    <span className="text-[11px] font-semibold tracking-widest uppercase">
                        السعر
                    </span>
                    <Label className="text-xs">
                        من {formatPrice(priceRange[0])} إلى {formatPrice(priceRange[1])}
                    </Label>
                </div>
                <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    onValueCommit={handlePriceCommit}
                    min={0}
                    max={maxPriceLimit}
                    step={500}
                    aria-label="فلتر نطاق السعر"
                />
            </div>

            {/* Collections */}
            <div className="space-y-3">
                <div className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                    المجموعات
                </div>
                <div className="space-y-2">
                    {collections.map((col) => (
                        <Link
                            key={col.id}
                            href={`/collections/${col.slug}`}
                            className={cn(
                                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                                col.slug === currentSlug
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground"
                            )}
                        >
                            <span className={cn(
                                "h-2 w-2 rounded-full",
                                col.slug === currentSlug ? "bg-primary" : "bg-muted-foreground/30"
                            )} />
                            {col.title}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Dynamic Variant Options (Sizes, Colors, ...) */}
            {Object.entries(availableOptions).map(([optionName, values]) => (
                <div key={optionName} className="space-y-3">
                    <div className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                        {getOptionLabel(optionName)}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {values.map((val) => {
                            const selected = isOptionSelected(optionName, val);
                            return (
                                <button
                                    key={val}
                                    onClick={() => toggleOptionValue(optionName, val)}
                                    className={cn(
                                        "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                                        selected
                                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                    )}
                                >
                                    {val}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* In Stock Filter */}
            <div className="space-y-3">
                <div className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                    التوفر
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="in-stock"
                        checked={inStock}
                        onCheckedChange={(checked) => {
                            updateParams("in_stock", checked ? "true" : null);
                        }}
                    />
                    <Label htmlFor="in-stock" className="text-sm text-muted-foreground cursor-pointer">
                        المنتجات المتوفرة فقط
                    </Label>
                </div>
            </div>
        </aside>
    );
}

// ─── Named Exports ──────────────────────────────────────────────
export { SortSelect, Sidebar as CollectionSidebar };
