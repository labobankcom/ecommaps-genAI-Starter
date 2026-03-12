"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Eye, PackageSearch, Clock3, CheckCircle2, WalletCards } from "lucide-react";
import Link from "next/link";

const statusStyles: Record<string, { label: string; className: string }> = {
    delivered: { label: "تم التوصيل", className: "bg-zinc-100 text-zinc-700 hover:bg-zinc-100/80 dark:bg-zinc-900/40 dark:text-zinc-300 border-zinc-200" },
    processing: { label: "قيد المعالجة", className: "bg-neutral-100 text-neutral-700 hover:bg-neutral-100/80 dark:bg-neutral-900/40 dark:text-neutral-300 border-neutral-200" },
    shipped: { label: "تم الشحن", className: "bg-slate-100 text-slate-700 hover:bg-slate-100/80 dark:bg-slate-900/40 dark:text-slate-300 border-slate-200" },
    cancelled: { label: "ملغي", className: "bg-stone-100 text-stone-700 hover:bg-stone-100/80 dark:bg-stone-900/40 dark:text-stone-300 border-stone-200" },
    pending: { label: "في الانتظار", className: "bg-gray-100 text-gray-700 hover:bg-gray-100/80 dark:bg-gray-900/40 dark:text-gray-300 border-gray-200" },
    confirmed: { label: "مؤكد", className: "bg-zinc-200 text-zinc-800 hover:bg-zinc-200/80 dark:bg-zinc-800/60 dark:text-zinc-200 border-zinc-300" },
};

function formatPrice(price: number): string {
    return `${price.toLocaleString("ar-DZ")} د.ج`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("ar-DZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

interface OrdersTabProps {
    orders: Record<string, unknown>[];
}

export default function OrdersTab({ orders }: OrdersTabProps) {
    const pendingCount = orders.filter((order) => ((order.status as string) || "pending") === "pending").length;
    const shippedCount = orders.filter((order) => ((order.status as string) || "") === "shipped").length;
    const paidTotal = orders.reduce((sum, order) => sum + (typeof order.total === "number" ? order.total : 0), 0);

    return (
        <Card className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-background shadow-sm">
            <CardHeader className="border-b bg-gradient-to-r from-muted/40 to-background px-6 py-6">
                <div>
                    <CardTitle className="text-2xl font-black">الطلبات السابقة</CardTitle>
                    <CardDescription className="mt-2 text-sm font-medium leading-6">تابع حالة طلباتك الحالية واستعرض سجل مشترياتك ضمن واجهة أوضح وأسهل للمراجعة.</CardDescription>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border bg-background p-4 text-right shadow-sm">
                        <div className="mb-2 inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Clock3 className="size-5" />
                        </div>
                        <p className="text-sm text-muted-foreground">قيد الانتظار</p>
                        <p className="mt-1 text-2xl font-black">{pendingCount}</p>
                    </div>
                    <div className="rounded-2xl border bg-background p-4 text-right shadow-sm">
                        <div className="mb-2 inline-flex size-10 items-center justify-center rounded-2xl bg-slate-500/10 text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="size-5" />
                        </div>
                        <p className="text-sm text-muted-foreground">تم الشحن</p>
                        <p className="mt-1 text-2xl font-black">{shippedCount}</p>
                    </div>
                    <div className="rounded-2xl border bg-background p-4 text-right shadow-sm">
                        <div className="mb-2 inline-flex size-10 items-center justify-center rounded-2xl bg-zinc-800/10 text-zinc-700 dark:text-zinc-300">
                            <WalletCards className="size-5" />
                        </div>
                        <p className="text-sm text-muted-foreground">إجمالي المشتريات</p>
                        <p className="mt-1 text-2xl font-black text-primary">{formatPrice(paidTotal)}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table className="w-full text-right" dir="rtl">
                            <TableHeader className="bg-muted/20">
                                <TableRow className="border-b">
                                    <TableHead className="w-[220px] px-6 py-4 text-right font-bold text-muted-foreground">رقم الطلب</TableHead>
                                    <TableHead className="px-6 py-4 text-right font-bold text-muted-foreground">التاريخ</TableHead>
                                    <TableHead className="px-6 py-4 text-right font-bold text-muted-foreground">حالة الطلب</TableHead>
                                    <TableHead className="px-6 py-4 text-right font-bold text-muted-foreground">المبلغ الإجمالي</TableHead>
                                    <TableHead className="px-6 py-4 text-left font-bold text-muted-foreground">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => {
                                    const status = (order.status as string) || "pending";
                                    const badgeStyle = statusStyles[status] || statusStyles.pending;

                                    return (
                                        <TableRow key={(order.order_number as string) || (order.id as string)} className="border-b transition-colors hover:bg-muted/20">
                                            <TableCell className="px-6 py-5 font-black">
                                                #{(order.order_number as string) || (order.id as string)?.slice(0, 8)}
                                            </TableCell>
                                            <TableCell className="px-6 py-5 font-medium text-muted-foreground">
                                                {(order.created_at as string) ? formatDate(order.created_at as string) : "—"}
                                            </TableCell>
                                            <TableCell className="px-6 py-5">
                                                <Badge variant="outline" className={`px-3 py-1 font-bold ${badgeStyle.className}`}>
                                                    {badgeStyle.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-5 font-bold text-primary">
                                                {typeof order.total === "number" ? formatPrice(order.total) : (order.total as React.ReactNode) || "—"}
                                                {(order.items_count as number) > 0 && (
                                                    <span className="block text-xs font-normal text-muted-foreground">لـ {order.items_count as React.ReactNode} منتجات</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-6 py-5 text-left">
                                                <Button variant="ghost" size="sm" className="rounded-full px-3 font-bold text-muted-foreground hover:text-primary">
                                                    <Eye className="ml-1 size-4" />
                                                    التفاصيل
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <PackageSearch className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold">لا توجد طلبات سابقة</h3>
                        <p className="mt-2 max-w-sm text-muted-foreground">يبدو أنك لم تقم بأي طلبات بعد، تصفح المتجر واكتشف منتجاتنا المميزة.</p>
                        <Button asChild className="mt-6 rounded-xl font-bold">
                            <Link href="/">تسوق الآن</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
