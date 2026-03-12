import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WishlistDrawer } from "@/components/cart/WishlistDrawer";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { PromoBannerThree } from "@/components/commercn/promo-banners/promo-banner-03";
import { getStoreInfo } from "@/app/actions/store";
import { getCustomer, isAuthenticated } from "@/app/actions/auth";
import { getCollections } from "@/app/actions/collections";

export default async function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Fetch store info, collections and auth state in parallel
    const [storeInfo, collections, loggedIn] = await Promise.all([
        getStoreInfo(),
        getCollections(),
        isAuthenticated(),
    ]);

    // Get customer name if logged in
    let customerName: string | undefined;
    if (loggedIn) {
        const customer = await getCustomer();
        customerName = customer?.full_name;
    }

    return (
        <>
            <PromoBannerThree />
            <Header
                storeName={storeInfo?.name || undefined}
                storeLogo={storeInfo?.logo_url}
                isLoggedIn={loggedIn}
                customerName={customerName}
                collections={collections}
            />
            {children}
            <Footer
                storeName={storeInfo?.name || undefined}
                storeLogo={storeInfo?.logo_url}
                storeDescription={storeInfo?.description}
            />
            <CartDrawer />
            <WishlistDrawer />
            <AIAssistant
                storeLogo={storeInfo?.logo_url || null}
                storeName={storeInfo?.name || undefined}
            />
        </>
    );
}
