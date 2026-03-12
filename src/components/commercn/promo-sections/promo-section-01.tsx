"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function PromoSection() {
    // Set target date to 7 days from now
    const [targetDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date;
    });

    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = targetDate.getTime() - new Date().getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const formatNumber = (num: number) => String(num).padStart(2, "0");

    return (
        <section className="relative py-10 lg:py-20 bg-muted/30 overflow-hidden">
            <div className="mx-auto max-w-screen-2xl px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    {/* Right Side (Text) in RTL */}
                    <div className="space-y-10 order-2 lg:order-1">
                        <div className="mb-4">
                            <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">تخفيضات أسبوعية مذهلة!</h1>
                            <p className="text-muted-foreground text-lg mt-4 max-w-lg">
                                خصومات تصل إلى 50% على تشكيلة مختارة من أفضل المنتجات. العرض ساري لفترة محدودة فقط، لا تفوت الفرصة.
                            </p>
                        </div>

                        {/* Countdown Timer */}
                        <div className="flex gap-4">
                            <div className="bg-background shadow-md shadow-black/5 size-20 md:size-24 rounded-2xl p-3 md:p-4 text-center border">
                                <div className="text-3xl md:text-4xl font-black text-primary" dir="ltr">{formatNumber(timeLeft.days)}</div>
                                <div className="text-muted-foreground text-xs md:text-sm font-semibold mt-1">أيام</div>
                            </div>
                            <div className="bg-background shadow-md shadow-black/5 size-20 md:size-24 rounded-2xl p-3 md:p-4 text-center border">
                                <div className="text-3xl md:text-4xl font-black text-primary" dir="ltr">{formatNumber(timeLeft.hours)}</div>
                                <div className="text-muted-foreground text-xs md:text-sm font-semibold mt-1">ساعات</div>
                            </div>
                            <div className="bg-background shadow-md shadow-black/5 size-20 md:size-24 rounded-2xl p-3 md:p-4 text-center border">
                                <div className="text-3xl md:text-4xl font-black text-primary" dir="ltr">{formatNumber(timeLeft.minutes)}</div>
                                <div className="text-muted-foreground text-xs md:text-sm font-semibold mt-1">دقائق</div>
                            </div>
                            <div className="bg-background shadow-md shadow-black/5 size-20 md:size-24 rounded-2xl p-3 md:p-4 text-center border">
                                <div className="text-3xl md:text-4xl font-black text-primary" dir="ltr">{formatNumber(timeLeft.seconds)}</div>
                                <div className="text-muted-foreground text-xs md:text-sm font-semibold mt-1">ثواني</div>
                            </div>
                        </div>

                        <Button size="lg" className="rounded-xl h-14 px-8 text-lg font-bold">تسوق التخفيضات الآن</Button>
                    </div>

                    {/* Left Side (Images) in RTL - Randomly Positioned Images */}
                    <div className="relative hidden h-[450px] lg:block order-1 lg:order-2 w-full max-w-lg mx-auto">
                        <figure className="absolute top-0 end-0 aspect-square w-[260px] md:w-[280px] rotate-[-12deg] rtl:rotate-[12deg] transform overflow-hidden rounded-2xl shadow-xl transition-transform duration-500 hover:rotate-3 z-10 bg-background">
                            <img
                                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600"
                                alt="حذاء رياضي"
                                className="h-full w-full object-cover"
                            />
                        </figure>
                        <figure className="absolute top-[20%] start-0 aspect-square w-[260px] md:w-[280px] rotate-[12deg] rtl:-rotate-[12deg] transform overflow-hidden rounded-2xl shadow-xl transition-transform duration-500 hover:-rotate-3 z-20 bg-background">
                            <img
                                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600"
                                alt="ساعة ذكية"
                                className="h-full w-full object-cover"
                            />
                        </figure>
                        <figure className="absolute -bottom-8 end-[15%] aspect-square w-[260px] md:w-[280px] -rotate-2 transform overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 hover:rotate-2 z-30 bg-background">
                            <img
                                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600"
                                alt="سماعات"
                                className="h-full w-full object-cover"
                            />
                        </figure>
                    </div>
                </div>
            </div>
        </section>
    );
}
