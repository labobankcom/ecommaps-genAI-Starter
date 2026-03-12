import type { Metadata } from "next";
import localFont from "next/font/local";
import { DirectionProvider } from "@/components/ui/direction";
import "./globals.css";

const notoCustom = localFont({
  src: "./fonts/noto-sans-arabic.ttf",
  variable: "--font-sans",
});

import { getStoreInfo } from "@/app/actions/store";

export async function generateMetadata(): Promise<Metadata> {
  const storeInfo = await getStoreInfo();
  const logoUrl = storeInfo?.logo_url;

  return {
    title: storeInfo?.name || "Ecommaps AI Starter - Premium Storefront",
    description: storeInfo?.description || "Next-gen ecommerce starter template powered by Ecommaps & AI",
    icons: {
      icon: logoUrl || "/favicon.png",
      shortcut: logoUrl || "/favicon.png",
      apple: logoUrl || "/apple-icon.png",
    }
  };
}

import { JsonLd } from "@/components/seo/JsonLd";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storeInfo = await getStoreInfo();

  const baseUrl = (process.env.NEXT_PUBLIC_STORE_URL && process.env.NEXT_PUBLIC_STORE_URL !== "undefined")
    ? process.env.NEXT_PUBLIC_STORE_URL
    : "http://localhost:3003";

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": storeInfo?.name || "Ecommaps Store",
    "url": baseUrl,
    "logo": storeInfo?.logo_url || `${baseUrl}/favicon.png`,
    "description": storeInfo?.description,
    "sameAs": storeInfo?.social_links || [],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": storeInfo?.name || "Ecommaps Store",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={notoCustom.variable}>
      <body
        className="font-sans antialiased selection:bg-primary selection:text-primary-foreground"
      >
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
        <DirectionProvider dir="rtl">
          <main className="flex-1 flex flex-col w-full h-full">
            {children}
          </main>
        </DirectionProvider>
      </body>
    </html>
  );
}
