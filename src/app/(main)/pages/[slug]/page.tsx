import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Home, Calendar, MessageCircle } from "lucide-react";
import { getPageBySlug } from "@/app/actions/menus";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{ slug: string }>;
}

function pickStringField(
    source: Record<string, unknown>,
    key: string,
): string | undefined {
    const value = source[key];
    return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function pickFeaturedImage(content: unknown): string | undefined {
    if (!content || typeof content !== "object") return undefined;
    return pickStringField(content as Record<string, unknown>, "featured_image");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = await getPageBySlug(slug);

    if (!page) return {};

    const pageRecord = page as unknown as Record<string, unknown>;
    const seoTitle = pickStringField(pageRecord, "seo_title");
    const seoDescription = pickStringField(pageRecord, "seo_description");

    return {
        title: seoTitle || `${page.title} - متجر بداية`,
        description: seoDescription || "صفحة المعلومات والسياسات الرسمية للمتجر",
    };
}

export default async function StaticPage({ params }: PageProps) {
    const { slug } = await params;
    const page = await getPageBySlug(slug);

    if (!page || !page.is_published) {
        notFound();
    }

    const pageContent = typeof page.content === "string" ? page.content : "";
    const heroImage = pickFeaturedImage(page.content) || page.featured_image || page.image_url || undefined;

    const lastUpdated = page.updated_at ? new Date(page.updated_at).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : null;

    return (
        <div className="flex-1 bg-background pb-24 overflow-hidden">
            {/* Premium Centered Header */}
            <div className="bg-muted/30 border-b border-muted/50">
                <div className="container mx-auto max-w-screen-xl px-6 py-12 lg:py-20 text-center">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 justify-center rtl">
                        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5 group">
                            <Home className="size-4 group-hover:-translate-y-0.5 transition-transform" />
                            <span>الرئيسية</span>
                        </Link>
                        <ChevronLeft className="size-4 opacity-30 rotate-180" />
                        <span className="text-foreground font-medium">{page.title}</span>
                    </nav>

                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex flex-wrap items-center gap-3 justify-center">
                            <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase bg-primary/10 text-primary border-none">
                                وثيقة رسمية
                            </Badge>
                            {lastUpdated && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-muted-foreground/10">
                                    <Calendar className="size-3.5 text-primary" />
                                    <span>آخر تحديث: {lastUpdated}</span>
                                </div>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1] balance">
                            {page.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Featured Image */}
            {heroImage && (
                <div className="container mx-auto max-w-screen-xl px-6 -mt-10 lg:-mt-16 animate-in zoom-in-95 duration-1000">
                    <div className="relative aspect-[21/9] rounded-[40px] overflow-hidden shadow-2xl border-4 border-background bg-muted">
                        <img
                            src={heroImage}
                            alt={page.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}

            {/* Centered Content Area */}
            <div className="container mx-auto max-w-screen-xl px-6 mt-16 text-right rtl">
                {/* Main Content */}
                <div className="space-y-16 animate-in fade-in duration-1000">
                    <article
                        className="prose prose-lg lg:prose-xl dark:prose-invert max-w-none text-right rtl
                        [&_h2]:text-3xl [&_h2]:font-black [&_h2]:mt-14 [&_h2]:mb-6 [&_h2]:text-foreground
                        [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mt-10 [&_h3]:mb-4 [&_h3]:text-foreground
                        [&_p]:leading-loose [&_p]:text-muted-foreground/90 [&_p]:mb-10
                        [&_ul]:list-disc [&_ul]:mr-8 [&_ul]:mb-8 [&_ul]:space-y-4 [&_ul]:text-muted-foreground
                        [&_li]:leading-relaxed
                        [&_strong]:text-foreground [&_strong]:font-black [&_strong]:bg-primary/5 [&_strong]:px-1
                        [&_a]:text-primary [&_a]:no-underline [&_a]:font-bold [&_a:hover]:underline"
                        dangerouslySetInnerHTML={{ __html: page.body || pageContent || "" }}
                    />

                    <Separator className="bg-muted-foreground/10" />

                    {/* Questions Section - Centered Refined Design */}
                    <div className="relative group overflow-hidden bg-muted/30 rounded-[32px] p-8 lg:p-14 border border-muted/50 flex flex-col items-center text-center gap-8 rtl">
                        <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />

                        <div className="relative space-y-4 max-w-lg">
                            <h4 className="text-2xl lg:text-3xl font-black text-foreground">هل تحتاج إلى توضيح أكثر؟</h4>
                            <p className="text-base lg:text-lg text-muted-foreground/80 leading-relaxed">
                                فريقنا مستعد دائماً لإجابة استفساراتك حول سياساتنا وشروطنا لضمان أفضل تجربة تسوق ممكنة.
                            </p>
                        </div>
                        <Link href="/pages/contact" className="relative shrink-0 flex items-center justify-center rounded-2xl bg-primary px-12 py-5 text-base font-black text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/40 active:scale-95">
                            <MessageCircle className="ml-3 size-5" />
                            تحدث معنا الآن
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
