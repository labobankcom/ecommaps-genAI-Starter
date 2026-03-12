import { getBlogs } from "@/app/actions/menus";
import Link from "next/link";
import { Home, Newspaper, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export const metadata = {
    title: "المدونة - متجر بداية",
    description: "اكتشف آخر المقالات والأخبار والنصائح في مدونتنا الرسمية.",
};

export default async function BlogsIndexPage() {
    const blogPosts = await getBlogs();

    return (
        <div className="flex-1 bg-background pb-24">
            {/* Header Section */}
            <div className="bg-muted/30 border-b border-muted/50">
                <div className="container mx-auto max-w-screen-xl px-6 py-16 lg:py-24 text-center">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 justify-center rtl">
                        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5 group">
                            <Home className="size-4 group-hover:-translate-y-0.5 transition-transform" />
                            <span>الرئيسية</span>
                        </Link>
                        <span className="opacity-30">/</span>
                        <span className="text-foreground font-medium">المدونة</span>
                    </nav>

                    <div className="space-y-6">
                        <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase bg-primary/10 text-primary border-none">
                            مقالات حصرية
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
                            المدونة الرسمية
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            وجهتك الأولى لمتابعة آخر تحديثات المتجر، والتعرف على نصائح الخبراء في التجارة الإلكترونية.
                        </p>
                    </div>
                </div>
            </div>

            {/* Blogs Grid */}
            <div className="container mx-auto max-w-screen-xl px-6 mt-16 rtl">
                {blogPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 bg-muted/20 rounded-[40px] border border-dashed border-muted-foreground/20">
                        <Newspaper className="size-16 text-muted-foreground/20" />
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-foreground">لا توجد مقالات حالياً</h3>
                            <p className="text-muted-foreground max-w-xs">نحن نعمل على تجهيز محتوى قيم لك. يرجى العودة قريباً!</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((post: any) => (
                            <Link key={post.id} href={`/blogs/${post.slug}`} className="group h-full">
                                <Card className="h-full border-muted/50 bg-card rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 group-hover:border-primary/20">
                                    <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                                        {(post.content?.featured_image || post.featured_image) ? (
                                            <img
                                                src={post.content?.featured_image || post.featured_image}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                                                <Newspaper className="size-12 text-primary/20 group-hover:scale-110 transition-transform duration-700" />
                                            </div>
                                        )}
                                    </div>
                                    <CardHeader className="p-8 pb-3">
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                                            <div className="flex items-center gap-1.5 bg-muted/80 px-2.5 py-1 rounded-full border border-muted-foreground/5">
                                                <Calendar className="size-3.5 text-primary" />
                                                <span>{new Date(post.updated_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black text-foreground leading-tight group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h3>
                                    </CardHeader>
                                    <CardContent className="px-8 py-0">
                                        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                                            {post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 150) || "لا يوجد وصف متاح لهذا المقال..."}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="p-8 pt-6">
                                        <div className="flex items-center text-sm font-black text-primary group-hover:gap-2 transition-all">
                                            <span>اقرأ المزيد</span>
                                            <ArrowRight className="size-4 mr-2 rotate-180 group-hover:mr-0" />
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
