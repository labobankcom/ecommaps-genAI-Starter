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
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { EcommapsSite } from "@ecommaps/client";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { getStoreInfo } from "@/app/actions/store";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صحيح" }),
    password: z.string().min(8, { message: "كلمة المرور يجب أن لا تقل عن 8 أحرف" })
});

export default function LoginPage() {
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
            email: "",
            password: ""
        }
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setError(null);
        startTransition(async () => {
            const result = await loginAction(values.email, values.password);
            if (result.success) {
                router.push("/account");
                router.refresh();
            } else {
                setError(result.error || "فشل تسجيل الدخول");
            }
        });
    }

    return (
        <div className="flex flex-1 w-full h-full items-center justify-center bg-[url('https://images.unsplash.com/photo-1755593574938-6d66d28f8e57?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1080')] bg-cover bg-center bg-no-repeat lg:grid-cols-2">

            <div className="w-full max-w-sm z-10 p-4">
                <Card className="mx-auto flex w-full flex-col items-center gap-8 border-0 shadow-lg rounded-xl overflow-hidden bg-background">
                    <CardContent className="space-y-8 text-center p-8 sm:p-10 w-full">
                        {/* Logo */}
                        <div className="mb-2 flex flex-col items-center justify-center gap-2 text-center">
                            <Link href="/" className="mb-4 text-primary flex justify-center w-full">
                                {storeInfo?.logo_url ? (
                                    <img src={storeInfo.logo_url} alt={storeInfo.name || "Store Logo"} className="h-12 w-auto object-contain" />
                                ) : (
                                    <span className="text-3xl font-bold tracking-tighter">{((storeInfo?.name as string) || "") || "Ecommaps"}</span>
                                )}
                            </Link>
                            <h1 className="font-heading text-center text-3xl font-black">تسجيل الدخول لحسابك</h1>
                            <p className="text-muted-foreground text-sm font-medium leading-relaxed">أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى حسابك.</p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm font-medium text-right">
                                {error}
                            </div>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 text-right">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-right w-full block">البريد الإلكتروني</FormLabel>
                                            <FormControl>
                                                <Input type="email" className="h-10 text-left" dir="ltr" disabled={isPending} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex flex-row-reverse items-center justify-between">
                                                <Link href="#" className="text-muted-foreground hover:text-primary text-xs font-medium underline underline-offset-4">
                                                    نسيت كلمة المرور؟
                                                </Link>
                                                <FormLabel className="text-right">كلمة المرور</FormLabel>
                                            </div>

                                            <FormControl>
                                                <Input type="password" className="h-10 text-left" dir="ltr" disabled={isPending} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="pt-2">
                                    <Button type="submit" className="w-full h-10 font-bold" disabled={isPending}>
                                        {isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="size-4 animate-spin" />
                                                جاري التسجيل...
                                            </span>
                                        ) : (
                                            "تسجيل الدخول"
                                        )}
                                    </Button>
                                </div>

                                <p className="text-muted-foreground text-sm text-center font-medium mt-4">
                                    ليس لديك حساب؟{" "}
                                    <Link href="/register" className="underline underline-offset-4 hover:text-primary">
                                        سجل الآن
                                    </Link>
                                </p>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
