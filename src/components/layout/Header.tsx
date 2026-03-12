"use client";

import * as React from "react";
import Link from "next/link";
import { HeartIcon, MenuIcon, SearchIcon, ShoppingBag, LogInIcon } from "lucide-react";

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BagIcon, BeltIcon, HatIcon, JewelryIcon, OtherIcon, SunglassesIcon } from "./icons";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NavbarSearch } from "./NavbarSearch";

type ListItemType = {
    title: string;
    href?: string;
    description?: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const accessoriesMenuItems: ListItemType[] = [
    { title: "Bags", href: "#", icon: BagIcon },
    { title: "Jewelry", href: "#", icon: JewelryIcon },
    { title: "Sunglasses", href: "#", icon: SunglassesIcon },
    { title: "Hats & Beanies", href: "#", icon: HatIcon },
    { title: "Belts", href: "#", icon: BeltIcon },
    { title: "All Accessories", href: "#", icon: OtherIcon }
];

const collectionItems = [
    { title: "Trends", href: "#", description: "Discover this summer's trendy products." },
    { title: "Best Sellers", href: "#", description: "We've collected the best-selling products for you." },
    { title: "New Arrivals", href: "#", description: "Discover the most favorited products." }
];

interface HeaderProps {
    storeName?: string;
    storeLogo?: string | null;
    isLoggedIn?: boolean;
    customerName?: string;
    collections?: unknown[];
}

export function Header({ storeName, storeLogo, isLoggedIn = false, customerName, collections = [] }: HeaderProps) {
    const [open, setOpen] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);
    const openCart = useCartStore((state) => state.openCart);
    const itemsCount = useCartStore((state) => state.itemsCount());
    const openWishlist = useWishlistStore((state) => state.openWishlist);
    const wishlistItemsCount = useWishlistStore((state) => state.itemsCount());

    // Cast collections to the expected type
    const typedCollections = collections as any[];
    const featuredCollection = typedCollections.length > 0 ? typedCollections[0] : null;
    const remainingCollections = typedCollections.slice(1, 4);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Get initials for avatar fallback
    const getInitials = (name?: string) => {
        if (!name) return "م";
        const parts = name.split(" ");
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`;
        return name[0];
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-background border-b transition-colors duration-300">
                <div className="container mx-auto max-w-screen-2xl flex items-center justify-between p-4 px-6 sm:px-8">
                    {/* Store Logo / Name */}
                    <Link href="/" className="flex items-center gap-2.5">
                        {storeLogo ? (
                            <img
                                src={storeLogo}
                                alt={storeName || "Store"}
                                className="h-8 w-auto object-contain"
                            />
                        ) : null}
                        <span className="text-xl font-bold tracking-tight text-foreground">
                            {storeName || (
                                <span className="text-primary">Ecom<span className="text-foreground">maps</span></span>
                            )}
                        </span>
                    </Link>

                    {/* main navigation */}
                    <NavigationMenu className="hidden lg:flex" dir="rtl">
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>المجموعات</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid gap-0 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                        <li className="row-span-3">
                                            {featuredCollection ? (
                                                <NavigationMenuLink asChild>
                                                    <Link
                                                        href={`/collections/${featuredCollection.slug}`}
                                                        className="group block space-y-3 p-3 h-full hover:bg-muted/50 transition-colors">
                                                        <div className="aspect-[4/3] w-full rounded-xl bg-muted overflow-hidden relative">
                                                            {featuredCollection.image_url ? (
                                                                <img
                                                                    src={featuredCollection.image_url}
                                                                    alt={featuredCollection.title}
                                                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                                />
                                                            ) : (
                                                                <div className="absolute inset-0 flex items-center justify-center font-bold text-muted-foreground bg-muted/20">
                                                                    {featuredCollection.title}
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                                <span className="text-white text-xs font-bold">عرض المجموعة</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-sm leading-none font-bold">
                                                                {featuredCollection.title}
                                                            </div>
                                                            <p className="text-muted-foreground line-clamp-2 text-[12px] leading-snug">
                                                                {featuredCollection.description || "تشكيلة حصرية من أفضل المنتجات المختارة بعناية."}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                </NavigationMenuLink>
                                            ) : (
                                                <div className="p-4 text-center text-muted-foreground text-sm">لا توجد مجموعات حالياً</div>
                                            )}
                                        </li>
                                        <div className="flex flex-col py-2">
                                            {remainingCollections.map((item, i) => (
                                                <Link
                                                    key={i}
                                                    href={`/collections/${item.slug}`}
                                                    className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground gap-2 space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none block">
                                                    <div className="text-sm leading-none font-bold text-right">{item.title}</div>
                                                    <p className="text-muted-foreground line-clamp-1 text-[12px] leading-snug text-right">
                                                        {item.description || "استعرض المنتجات المميزة في هذه المجموعة."}
                                                    </p>
                                                </Link>
                                            ))}
                                            {typedCollections.length > 4 && (
                                                <Link
                                                    href="/collections"
                                                    className="text-primary text-xs font-bold p-3 hover:underline text-right mt-auto">
                                                    عرض كل المجموعات ←
                                                </Link>
                                            )}
                                        </div>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>الإكسسوارات</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[400px] list-none grid-cols-2 gap-3 lg:w-[300px] p-2">
                                        {accessoriesMenuItems.map((item, i) => (
                                            <NavigationMenuLink asChild key={i}>
                                                <Link
                                                    href={`${item.href}`}
                                                    className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex justify-center gap-2 space-y-1 rounded-md p-3 text-center leading-none no-underline transition-colors outline-none select-none flex-col items-center"
                                                    onClick={(e) => e.preventDefault()}>
                                                    {item.icon ? (
                                                        <item.icon className="text-muted-foreground mx-auto size-8" />
                                                    ) : null}
                                                    <span className="block text-sm leading-none font-medium">
                                                        {item.title}
                                                    </span>
                                                </Link>
                                            </NavigationMenuLink>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link
                                        href="#"
                                        className={navigationMenuTriggerStyle()}
                                        onClick={(e) => e.preventDefault()}>
                                        النساء
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link
                                        href="#"
                                        className={navigationMenuTriggerStyle()}
                                        onClick={(e) => e.preventDefault()}>
                                        الرجال
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    {/* left actions */}
                    <div className="flex items-center gap-1">
                        <NavbarSearch />
                        <Button variant="ghost" size="icon" className="relative cursor-pointer" aria-label="Favorites" onClick={openWishlist}>
                            <HeartIcon aria-hidden="true" />
                            {isMounted && wishlistItemsCount > 0 && (
                                <Badge className="absolute -top-1 right-0 sm:left-full sm:right-auto size-4 -translate-x-1/2 rounded-full p-0 text-[10px] flex items-center justify-center bg-red-500 hover:bg-red-600 border-none text-white">
                                    {wishlistItemsCount}
                                </Badge>
                            )}
                        </Button>
                        <Button variant="ghost" size="icon" className="relative cursor-pointer" aria-label="Cart" onClick={openCart}>
                            <ShoppingBag aria-hidden="true" />
                            {isMounted && itemsCount > 0 && (
                                <Badge className="absolute -top-1 right-0 sm:left-full sm:right-auto size-4 -translate-x-1/2 rounded-full p-0 text-[10px] flex items-center justify-center">
                                    {itemsCount}
                                </Badge>
                            )}
                        </Button>
                        <div className="ms-4 flex items-center gap-1">
                            {isLoggedIn ? (
                                <Link href="/account" className="hidden sm:inline-flex rounded-full ring-2 ring-transparent transition-all hover:ring-primary/20">
                                    <Avatar className="size-9 bg-muted border border-border shadow-sm">
                                        <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                                            {getInitials(customerName)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                            ) : (
                                <Link href="/login" className="hidden sm:inline-flex">
                                    <Button variant="outline" size="sm" className="gap-1.5 rounded-full font-medium">
                                        <LogInIcon className="size-4" />
                                        تسجيل الدخول
                                    </Button>
                                </Link>
                            )}
                            <Button variant="ghost" onClick={() => setOpen(true)} className="lg:hidden">
                                <MenuIcon />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* for mobile navigation */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent className="space-y-4 overflow-auto p-4" side="left">
                    <SheetTitle className="sr-only">القائمة</SheetTitle>

                    {/* Auth section for mobile */}
                    <div className="pb-2">
                        {isLoggedIn ? (
                            <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Avatar className="size-10 bg-primary/10 border border-border shadow-sm">
                                    <AvatarFallback className="font-bold text-sm text-primary">
                                        {getInitials(customerName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm text-right">{customerName}</p>
                                    <p className="text-xs text-muted-foreground text-right">عرض حسابي</p>
                                </div>
                            </Link>
                        ) : (
                            <Link href="/login" onClick={() => setOpen(false)}>
                                <Button variant="outline" className="w-full gap-2 font-medium">
                                    <LogInIcon className="size-4" />
                                    تسجيل الدخول
                                </Button>
                            </Link>
                        )}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <div className="font-bold text-right px-1">المجموعات</div>
                        <ul className="space-y-3">
                            {typedCollections.length > 0 ? (
                                typedCollections.map((item, i) => (
                                    <li key={i}>
                                        <Link
                                            href={`/collections/${item.slug}`}
                                            onClick={() => setOpen(false)}
                                            className="flex items-center gap-4 group p-2 hover:bg-muted/50 rounded-xl transition-colors">
                                            <div className="size-16 shrink-0 rounded-lg bg-muted overflow-hidden">
                                                {item.image_url ? (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.title}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                        {item.title[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm leading-none font-bold text-right truncate">{item.title}</div>
                                                <p className="text-muted-foreground line-clamp-1 text-[11px] leading-snug text-right mt-1">
                                                    {item.description || "استعرض المنتجات"}
                                                </p>
                                            </div>
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <p className="text-center text-xs text-muted-foreground py-4">لا توجد مجموعات</p>
                            )}
                        </ul>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <div className="font-medium text-right">الإكسسوارات</div>
                        <ul className="grid list-none grid-cols-2 gap-2">
                            {accessoriesMenuItems.map((item, i) => (
                                <Link
                                    key={i}
                                    href={`${item.href}`}
                                    className="bg-muted/50 flex flex-col justify-center gap-2 space-y-1 rounded-md p-3 text-center leading-none no-underline transition-colors items-center"
                                    onClick={(e) => e.preventDefault()}>
                                    {item.icon ? (
                                        <item.icon className="text-muted-foreground mx-auto size-8" />
                                    ) : null}
                                    <span className="block text-sm leading-none font-medium">{item.title}</span>
                                </Link>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-2 pt-4">
                        <Link
                            href="#"
                            className="bg-muted/50 flex flex-col justify-center gap-2 space-y-1 rounded-md p-3 text-center leading-none no-underline transition-colors font-semibold">
                            الرجال
                        </Link>

                        <Link
                            href="#"
                            className="bg-muted/50 flex flex-col justify-center gap-2 space-y-1 rounded-md p-3 text-center leading-none no-underline transition-colors font-semibold">
                            النساء
                        </Link>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
