"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { EcommapsCustomer } from "@ecommaps/client";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, UserRound, CalendarDays } from "lucide-react";

const profileSchema = z.object({
    fullName: z.string().min(3, { message: "الاسم الكامل يجب أن يحتوي على 3 أحرف على الأقل" }),
    email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صحيح" }),
    phone: z.string().optional(),
});

interface ProfileTabProps {
    customer: EcommapsCustomer | null;
}

export default function ProfileTab({ customer }: ProfileTabProps) {
    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: customer?.full_name || "",
            email: customer?.email || "",
            phone: customer?.phone || "",
        }
    });

    const createdAt = customer?.created_at
        ? new Date(customer.created_at).toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric" })
        : "—";

    const quickCards = [
        { icon: UserRound, label: "اسم العميل", value: customer?.full_name || "غير محدد", dir: "rtl" as const },
        { icon: Mail, label: "البريد الإلكتروني", value: customer?.email || "غير محدد", dir: "ltr" as const },
        { icon: Phone, label: "رقم الهاتف", value: customer?.phone || "غير مضاف", dir: "ltr" as const },
    ];

    return (
        <Card className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-background shadow-sm">
            <CardHeader className="border-b bg-gradient-to-r from-muted/40 to-background px-6 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="text-right">
                        <CardTitle className="text-2xl font-black">المعلومات الشخصية</CardTitle>
                        <CardDescription className="mt-2 text-sm font-medium">معلومات حسابك الأساسية كما تظهر داخل تجربة الشراء.</CardDescription>
                    </div>
                    <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-bold">
                        حساب موثق
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="grid gap-4 md:grid-cols-3">
                    {quickCards.map((item) => (
                        <div key={item.label} className="rounded-2xl border bg-muted/30 p-4 text-right shadow-sm">
                            <div className="mb-3 inline-flex size-10 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
                                <item.icon className="size-5" />
                            </div>
                            <p className="text-sm text-muted-foreground">{item.label}</p>
                            <p className="mt-1 font-black" dir={item.dir}>{item.value}</p>
                        </div>
                    ))}
                </div>

                <Form {...form}>
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem className="text-right">
                                        <FormLabel className="font-bold">الاسم الكامل</FormLabel>
                                        <FormControl>
                                            <Input placeholder="الاسم الكامل" className="h-12 rounded-2xl border-border/70 bg-muted/20 text-right text-base" dir="rtl" readOnly {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="text-right">
                                        <FormLabel className="font-bold">البريد الإلكتروني</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="البريد الإلكتروني" className="h-12 rounded-2xl border-border/70 bg-muted/20 text-right text-base" dir="ltr" readOnly {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem className="text-right md:col-span-2">
                                        <FormLabel className="font-bold">رقم الهاتف</FormLabel>
                                        <FormControl>
                                            <Input type="tel" placeholder="رقم الهاتف" className="h-12 rounded-2xl border-border/70 bg-muted/20 text-right text-base" dir="ltr" readOnly {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex items-center justify-start gap-3 rounded-2xl border bg-background p-4 text-right">
                            <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <CalendarDays className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">تاريخ التسجيل</p>
                                <p className="mt-1 font-bold">{createdAt}</p>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
