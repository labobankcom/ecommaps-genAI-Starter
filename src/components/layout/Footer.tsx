import { SendIcon } from "lucide-react";
import Link from "next/link";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { getMenuByHandle, StoreMenu } from "@/app/actions/menus";

interface FooterProps {
    storeName?: string;
    storeLogo?: string | null;
    storeDescription?: string | null;
}

export async function Footer({ storeName, storeLogo, storeDescription }: FooterProps) {
    const displayName = storeName || "Ecommaps";
    const displayDescription = storeDescription || "ارتقِ بتجربتك في التجارة الإلكترونية مع إيكومابس. انضم إلى عائلة النجاح اليوم وابدأ بيع منتجاتك بذكاء.";

    const [menuCollections, menuTopSeller, menuLegal] = await Promise.all([
        getMenuByHandle("topcollection"),
        getMenuByHandle("topseller"),
        getMenuByHandle("legal"),
    ]);

    const footerMenus: (StoreMenu | null)[] = [menuCollections, menuTopSeller, menuLegal];

    const renderMenuLinks = (menu: StoreMenu | null, defaultTitle: string, defaultLinks: { title: string; url: string }[]) => {
        const title = menu?.title || defaultTitle;
        const items = menu?.items || [];

        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">{title}</h3>
                <ul className="[&_li_a]:text-muted-foreground [&_li_a]:hover:text-foreground space-y-2 [&_li_a]:block [&_li_a]:text-sm [&_li_a]:transition-colors [&_li_a]:hover:underline">
                    {items.length > 0 ? (
                        items.map((item, idx) => (
                            <li key={idx}>
                                <Link href={item.url || "#"}>{item.title}</Link>
                            </li>
                        ))
                    ) : (
                        defaultLinks.map((link, idx) => (
                            <li key={idx}>
                                <Link href={link.url}>{link.title}</Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        );
    };

    return (
        <footer className="py-12 border-t bg-muted/20">
            <div className="container mx-auto max-w-screen-2xl space-y-6 px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-5">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2.5">
                            {storeLogo ? (
                                <img
                                    src={storeLogo}
                                    alt={displayName}
                                    className="h-8 w-auto object-contain"
                                />
                            ) : (
                                <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">{displayName[0]}</div>
                            )}
                            <span className="text-2xl font-bold tracking-tight">{displayName}</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {displayDescription}
                        </p>
                    </div>
                    {renderMenuLinks(menuCollections, "التشكيلات", [
                        { title: "أحدث الأطقم", url: "#" },
                        { title: "الإكسسوارات الذكية", url: "#" },
                        { title: "أدوات العافية", url: "#" },
                        { title: "التدريب الشخصي", url: "#" },
                    ])}
                    {renderMenuLinks(menuTopSeller, "الأكثر مبيعاً", [
                        { title: "تخفيضات ساخنة", url: "#" },
                        { title: "أفضل المنتجات", url: "#" },
                        { title: "منتجات حصرية", url: "#" },
                        { title: "عروض الموسم", url: "#" },
                    ])}
                    {renderMenuLinks(menuLegal, "روابط قانونية", [
                        { title: "سياسة الخصوصية", url: "#" },
                        { title: "شروط الخدمة", url: "#" },
                        { title: "سياسة الاسترجاع", url: "#" },
                        { title: "سياسة التوصيل", url: "#" },
                    ])}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">النشرة البريدية</h3>
                        <p className="text-muted-foreground text-sm">
                            ابقَ على اطلاع بأحدث نصائح التجارة والعروض الحصرية.
                        </p>
                        <div className="flex gap-2">
                            <InputGroup>
                                <InputGroupInput type="email" placeholder="بريدك الإلكتروني" />
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton variant="secondary" className="font-bold">
                                        <span className="hidden lg:inline">اشترك الآن</span>
                                        <SendIcon className="inline lg:hidden size-4" />
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                        </div>
                    </div>
                </div>
                <Separator className="lg:mt-10" />
                <div className="text-muted-foreground text-center">
                    <div className="text-xs">
                        &copy; {new Date().getFullYear()} {displayName}. جميع الحقوق محفوظة.
                    </div>
                </div>
            </div>
        </footer>
    );
}
