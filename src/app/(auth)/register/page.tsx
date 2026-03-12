"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { EcommapsSite } from "@ecommaps/client";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signupAction } from "@/app/actions/auth";
import { getStoreInfo } from "@/app/actions/store";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    fullName: z.string().min(3, { message: "الاسم الكامل يجب أن يحتوي على 3 أحرف على الأقل" }),
    email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صحيح" }),
    phone: z.string().optional(),
    password: z.string().min(8, { message: "كلمة المرور يجب أن لا تقل عن 8 أحرف" })
});

export default function RegisterPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [storeInfo, setStoreInfo] = useState<EcommapsSite | null>(null);

    useEffect(() => {
        getStoreInfo().then(setStoreInfo);
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            password: ""
        }
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setError(null);
        startTransition(async () => {
            const result = await signupAction({
                full_name: values.fullName,
                email: values.email,
                password: values.password,
                phone: values.phone || undefined,
            });
            if (result.success) {
                router.push("/account");
                router.refresh();
            } else {
                setError(result.error || "فشل إنشاء الحساب");
            }
        });
    }

    return (
        <div className="flex flex-1 w-full h-full items-center justify-center bg-[url('https://images.unsplash.com/photo-1755593574938-6d66d28f8e57?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1080')] bg-cover bg-center bg-no-repeat lg:grid-cols-2">

            <div className="w-full max-w-sm z-10 p-4">
                <Card className="mx-auto flex w-full flex-col items-center gap-8 border-0 shadow-lg rounded-xl overflow-hidden bg-background">
                    <CardContent className="space-y-8 text-center p-8 sm:p-10 w-full">
                        {/* Logo and Header */}
                        <div className="mb-2 flex flex-col items-center justify-center gap-2 text-center">
                            <Link href="/" className="mb-4 text-primary flex justify-center w-full">
                                {storeInfo?.logo_url ? (
                                    <img src={storeInfo.logo_url} alt={storeInfo.name || "Store Logo"} className="h-12 w-auto object-contain" />
                                ) : (
                                    <span className="text-3xl font-bold tracking-tighter">{((storeInfo?.name as string) || "") || "Ecommaps"}</span>
                                )}
                            </Link>
                            <h1 className="font-heading text-center text-3xl font-black">إنشاء حساب جديد</h1>
                            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                لديك حساب بالفعل؟{" "}
                                <Link href="/login" className="text-primary hover:underline font-bold">
                                    سجل الدخول هنا
                                </Link>
                            </p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm font-medium text-right">
                                {error}
                            </div>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4 text-right">

                                {/* Full Name */}
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="الاسم الكامل" className="h-12 text-right rounded-lg bg-transparent" dir="rtl" disabled={isPending} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Email */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input type="email" placeholder="البريد الإلكتروني" className="h-12 text-right rounded-lg bg-transparent" dir="rtl" disabled={isPending} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Phone (Optional) */}
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input type="tel" placeholder="رقم الهاتف (اختياري)" className="h-12 text-right rounded-lg bg-transparent" dir="rtl" disabled={isPending} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Password */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input type="password" placeholder="كلمة المرور" className="h-12 text-right rounded-lg bg-transparent" dir="rtl" disabled={isPending} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="pt-4">
                                    <Button type="submit" className="w-full h-12 font-bold text-lg rounded-lg" disabled={isPending}>
                                        {isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="size-4 animate-spin" />
                                                جاري إنشاء الحساب...
                                            </span>
                                        ) : (
                                            "إنشاء الحساب"
                                        )}
                                    </Button>
                                </div>

                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
