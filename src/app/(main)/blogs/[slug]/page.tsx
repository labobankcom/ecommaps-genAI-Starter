import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Home, Calendar, MessageCircle, Newspaper, ArrowRight, User, Clock } from "lucide-react";
import { getBlogBySlug, getBlogs } from "@/app/actions/menus";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "next";
import { SocialShare } from "@/components/commercn/SocialShare";
import { headers } from "next/headers";

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
    const page = await getBlogBySlug(slug);

    if (!page) return {};

    const pageRecord = page as unknown as Record<string, unknown>;
    const seoTitle = pickStringField(pageRecord, "seo_title");
    const seoDescription = pickStringField(pageRecord, "seo_description");

    return {
        title: seoTitle || `${page.title} - المدونة`,
        description: seoDescription || page.excerpt || "مقالات وأخبار متجرنا الرسمية",
    };
}

export default async function BlogPage({ params }: PageProps) {
    const { slug } = await params;

    // Fetch current blog, latest blogs, and headers for absolute URL
    const [page, allBlogs, headersList] = await Promise.all([
        getBlogBySlug(slug),
        getBlogs(),
        headers()
    ]);

    if (!page || !page.is_published) {
        notFound();
    }

    const pageRecord = page as unknown as Record<string, unknown>;

    // Filter latest blogs avoiding current one
    const latestBlogs = (allBlogs || [])
        .filter((b: any) => b.slug !== slug && b.is_published)
        .slice(0, 4);

    const publishDate = pickStringField(pageRecord, "published_at") || page.created_at;
    const heroImage = pickFeaturedImage(page.content) || page.featured_image || page.image_url || undefined;
    const formattedDate = publishDate ? new Date(publishDate).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : null;

    // Construct absolute share URL
    const host = headersList.get("host") || "localhost:3003";
    const protocol = host.includes("localhost") ? "http" : "https";
    const shareUrl = `${protocol}://${host}/blogs/${slug}`;

    return (
        <div className="flex-1 bg-white dark:bg-zinc-950 pb-24 overflow-hidden selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
            {/* Header: Minimal & Premium */}
            <div className="container mx-auto max-w-screen-xl px-6 pt-12 text-center rtl">
                <nav className="flex items-center gap-2 text-[11px] text-zinc-400 mb-12 justify-center uppercase tracking-[0.2em] font-medium">
                    <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">الرئيسية</Link>
                    <ChevronLeft className="size-3 opacity-30 rotate-180" />
                    <Link href="/blogs" className="hover:text-black dark:hover:text-white transition-colors">المدونة</Link>
                    <ChevronLeft className="size-3 opacity-20 rotate-180" />
                    <span className="text-zinc-600 dark:text-zinc-400">{page.title}</span>
                </nav>

                <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <div className="flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">
                        <span>مقالاتنا</span>
                        <span className="h-[1px] w-8 bg-zinc-200" />
                        <span>{formattedDate}</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-black dark:text-white leading-[1.1] text-center uppercase">
                        {page.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-8 pt-4">
                        <div className="flex items-center gap-2">
                            <div className="size-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                                <User className="size-4 text-zinc-400" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest leading-none mb-1">الكاتب</p>
                                <p className="text-sm font-bold text-black dark:text-white">إدارة المتجر</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                                <Clock className="size-4 text-zinc-400" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest leading-none mb-1">وقت القراءة</p>
                                <p className="text-sm font-bold text-black dark:text-white">5 دقائق</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Image Section */}
            {heroImage && (
                <div className="px-6 py-20 animate-in fade-in duration-1000 delay-200">
                    <div className="container mx-auto max-w-screen-xl">
                        <div className="relative aspect-[21/9] lg:aspect-[21/8] overflow-hidden rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 group shadow-2xl">
                            <img
                                src={heroImage}
                                alt={page.title}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/5" />
                        </div>
                    </div>
                </div>
            )}

            {/* Content Body Grid */}
            <div className="container mx-auto max-w-screen-xl px-6 rtl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                    {/* Share on desktop: Left Sidebar */}
                    <aside className="hidden lg:block lg:col-span-1 sticky top-24 h-fit">
                        <div className="flex flex-col gap-6 items-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 [writing-mode:vertical-rl] flex items-center gap-4">
                                <span className="h-10 w-[1px] bg-zinc-200" />
                                شارك المحتوى
                            </span>
                            <SocialShare url={shareUrl} title={page.title} />
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <article className="lg:col-span-7 prose prose-zinc dark:prose-invert max-w-none 
                        prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
                        prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-[1.8] prose-p:text-lg
                        prose-strong:text-black dark:prose-strong:text-white prose-strong:bg-zinc-50 dark:prose-strong:bg-zinc-900 prose-strong:px-1
                        prose-a:text-black dark:prose-a:text-white prose-a:font-black prose-a:underline-offset-4
                        prose-img:rounded-[2rem] prose-img:shadow-2xl text-right">

                        {page.excerpt && (
                            <div className="mb-16 border-r-4 border-black dark:border-white pr-8 py-2">
                                <p className="text-2xl font-black italic text-black dark:text-white leading-relaxed">
                                    {page.excerpt}
                                </p>
                            </div>
                        )}

                        <div
                            dangerouslySetInnerHTML={{ __html: page.body || page.content || "" }}
                            className="[&_img]:w-full [&_img]:h-auto"
                        />

                        {/* Mobile Share */}
                        <div className="mt-16 lg:hidden border-t pt-12">
                            <SocialShare url={shareUrl} title={page.title} />
                        </div>
                    </article>

                    {/* Right Sidebar: Latest Posts */}
                    <aside className="lg:col-span-4 space-y-16">
                        <div className="sticky top-24 space-y-16">
                            {/* Latest Articles */}
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-black dark:text-white">أحدث المقالات</h3>
                                    <Link href="/blogs" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors">عرض الكل</Link>
                                </div>
                                <div className="space-y-8 text-right">
                                    {latestBlogs.map((item: any) => (
                                        <Link key={item.id} href={`/blogs/${item.slug}`} className="group block space-y-4">
                                            {(item.content?.featured_image || item.featured_image) && (
                                                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                                    <img
                                                        src={item.content?.featured_image || item.featured_image}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                                                    />
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                    {new Date(item.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                                                </p>
                                                <h4 className="text-lg font-black leading-tight group-hover:underline underline-offset-4 truncate">
                                                    {item.title}
                                                </h4>
                                            </div>
                                        </Link>
                                    ))}
                                    {latestBlogs.length === 0 && (
                                        <p className="text-zinc-400 text-sm">لا توجد مقالات أخرى حالياً.</p>
                                    )}
                                </div>
                            </div>

                            {/* Newsletter/CTA */}
                            <div className="p-12 bg-zinc-950 dark:bg-white text-white dark:text-black rounded-[2.5rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 size-32 bg-zinc-800 dark:bg-zinc-200 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
                                <div className="relative z-10 space-y-8">
                                    <h4 className="text-2xl font-black uppercase tracking-tighter leading-none">اشترك في قائمتنا</h4>
                                    <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 leading-relaxed">
                                        كن أول من يحصل على أحدث التوجهات والنصائح في عالم التجارة الإلكترونية مباشرة لبريدك.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="h-14 bg-zinc-900 dark:bg-zinc-100 rounded-full border border-zinc-800 dark:border-zinc-200 flex items-center px-6 text-white dark:text-black">
                                            <input
                                                type="email"
                                                placeholder="بريدك الإلكتروني"
                                                className="bg-transparent border-none outline-none w-full text-xs font-bold placeholder:text-zinc-600"
                                            />
                                        </div>
                                        <button className="w-full h-14 bg-white dark:bg-black text-black dark:text-white rounded-full font-black text-xs uppercase tracking-[0.2em] transition-transform hover:scale-105 active:scale-95">
                                            انضم إلينا
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Read More Section (Bottom) */}
            <div className="container mx-auto max-w-screen-xl px-6 mt-32 rtl">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">اقرأ المزيد</h2>
                    <div className="h-[1px] flex-1 mx-12 bg-zinc-100 dark:bg-zinc-900" />
                    <Link href="/blogs" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] hover:translate-x-[-8px] transition-transform duration-500">
                        المدونة كاملة
                        <ArrowRight className="size-4 rotate-180" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {latestBlogs.slice(0, 3).map((item: any) => (
                        <Link key={item.id} href={`/blogs/${item.slug}`} className="group space-y-6">
                            {(item.content?.featured_image || item.featured_image) && (
                                <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                    <img
                                        src={item.content?.featured_image || item.featured_image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}
                            <div className="space-y-4 pr-2">
                                <h3 className="text-xl font-black leading-none group-hover:underline underline-offset-8 decoration-2 uppercase tracking-tighter">
                                    {item.title}
                                </h3>
                                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                                    {formattedDate} — 5 دقائق
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bottom Floating CTA Button (Mobile) */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 lg:hidden">
                <Link href="/blogs" className="flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black font-black px-8 py-4 rounded-full shadow-2xl tracking-widest text-[10px] uppercase transition-transform active:scale-95">
                    العودة للمدونة
                    <ArrowRight className="size-4 rotate-180" />
                </Link>
            </div>
        </div>
    );
}
