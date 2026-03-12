import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VideoModal } from "./VideoModal";

export function HeroSection() {
    return (
        <section className="py-8 lg:py-12">
            <div className="mx-auto max-w-screen-2xl px-6 lg:px-8">
                <div className="grid items-center gap-8 lg:grid-cols-2">
                    <header className="flex flex-col items-center text-center lg:items-start lg:text-right rtl:lg:text-right ltr:lg:text-left">
                        <Badge variant="outline" className="gap-2">
                            🚀 إطلاق أسرع
                            <ArrowUpRight className="size-4" />
                        </Badge>
                        <h1 className="font-heading my-4 text-4xl text-balance md:text-5xl lg:leading-14 font-bold">
                            منصة متكاملة لإدارة متجرك الإلكتروني بالذكاء الاصطناعي
                        </h1>
                        <p className="text-muted-foreground mb-8 text-balance lg:text-lg">
                            قم بتبسيط العمليات، وتتبع المقاييس، وتوسيع نطاق أعمال التجارة الإلكترونية الخاصة بك بسهولة. كل ما تحتاجه في لوحة تحكم واحدة قوية.
                        </p>
                        <div className="flex justify-center lg:justify-start gap-2">
                            <Button asChild className="rounded-full h-12 px-8">
                                <Link href="#">ابدأ تجربة مجانية</Link>
                            </Button>
                            <Button asChild variant="outline" className="rounded-full h-12 px-8">
                                <Link href="#">طلب عرض توضيحي</Link>
                            </Button>
                        </div>
                    </header>
                    <figure className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1763503834047-ac85c4105c0b?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            alt="Dashboard interface of the platform"
                            className="aspect-square w-full rounded-3xl object-cover shadow-2xl"
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                            <VideoModal videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
                        </div>
                    </figure>
                </div>
            </div>
        </section>
    );
}
