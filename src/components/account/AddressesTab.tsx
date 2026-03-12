"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Loader2, Trash2, Home, Phone } from "lucide-react";
import { useState } from "react";
import { setDefaultAddressAction, deleteAddressAction } from "@/app/actions/auth";
import { toast } from "sonner";
import AddAddressModal from "./AddAddressModal";

interface AddressesTabProps {
    addresses: Record<string, unknown>[];
}

export default function AddressesTab({ addresses }: AddressesTabProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleSetDefault = async (id: string) => {
        setLoadingId(id);
        const result = await setDefaultAddressAction(id);
        setLoadingId(null);
        if (result.success) {
            toast.success("تم تعيين العنوان كافتراضي بنجاح");
        } else {
            toast.error(result.error || "حدث خطأ أثناء التحديث");
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        const result = await deleteAddressAction(id);
        setDeletingId(null);
        if (result.success) {
            toast.success("تم حذف العنوان بنجاح");
        } else {
            toast.error(result.error || "حدث خطأ أثناء الحذف");
        }
    };

    const defaultLabel = addresses.find((address) => address.is_default)?.label as string | undefined;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 rounded-[1.75rem] border border-border/70 bg-background/95 p-6 shadow-sm md:grid-cols-[1.15fr_.85fr]">
                <div className="space-y-2 text-right">
                    <h2 className="text-2xl font-black">إدارة العناوين</h2>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">إدارة عناوين الشحن الافتراضية والمحفوظة.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-muted/40 p-4 text-right">
                        <p className="text-sm text-muted-foreground">إجمالي العناوين</p>
                        <p className="mt-2 text-2xl font-black">{addresses.length}</p>
                    </div>
                    <div className="rounded-2xl border bg-muted/40 p-4 text-right">
                        <p className="text-sm text-muted-foreground">العنوان الافتراضي</p>
                        <p className="mt-2 text-lg font-black">{defaultLabel || "غير محدد"}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <AddAddressModal>
                    <Card className="group flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-border bg-gradient-to-br from-background to-muted/40 shadow-none transition-all hover:border-primary/50 hover:shadow-sm">
                        <CardContent className="flex w-full flex-col items-center justify-center p-6 text-center">
                            <div className="mb-4 flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                                <Plus className="size-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-black">إضافة عنوان جديد</h3>
                            <p className="max-w-xs text-sm leading-6 text-muted-foreground">أضف عنوانًا جديدًا بتفاصيل مرتبة حتى تصبح عملية الطلب والشحن أسرع وأكثر دقة.</p>
                        </CardContent>
                    </Card>
                </AddAddressModal>

                {addresses.map((address, index) => {
                    const isDefault = (address.is_default as boolean) || false;
                    const label = (address.label as string) || (address.title as string) || `عنوان ${index + 1}`;
                    const isLoading = loadingId === (address.id as string);
                    const isDeleting = deletingId === (address.id as string);

                    return (
                        <Card key={(address.id as string) || index} className={`group relative flex flex-col overflow-hidden rounded-[1.75rem] border transition-all shadow-sm ${isDefault ? "border-primary/50 bg-primary/[0.03]" : "border-border/70 bg-background"}`}>
                            {isDefault && (
                                <div className="absolute right-5 top-5 z-10">
                                    <Badge className="pointer-events-none rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                                        الافتراضي
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className="px-5 pb-3 pt-5">
                                <CardTitle className="flex flex-row-reverse items-center justify-between gap-3 text-lg font-black">
                                    <MapPin className={`size-5 ${isDefault ? "text-primary" : "text-muted-foreground"}`} />
                                    <span>{label as React.ReactNode}</span>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="flex flex-1 flex-col gap-4 px-5 pb-5 text-sm">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl bg-muted/40 p-4 text-right">
                                        <div className="mb-2 inline-flex size-9 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
                                            <Phone className="size-4" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                                        <p className="mt-1 font-bold" dir="ltr">{(address.phone as string) || "—"}</p>
                                    </div>
                                    <div className="rounded-2xl bg-muted/40 p-4 text-right">
                                        <div className="mb-2 inline-flex size-9 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
                                            <Home className="size-4" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">المنطقة</p>
                                        <p className="mt-1 font-bold">
                                            {(address.state as string) || "—"}
                                            {address.city ? ` - ${address.city as string}` : ""}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-2xl border bg-background p-4 text-right">
                                    <p className="text-xs text-muted-foreground">العنوان التفصيلي</p>
                                    <p className="mt-2 leading-7 text-foreground">{(address.line1 as string) || "لا توجد تفاصيل إضافية"}</p>
                                </div>
                            </CardContent>

                            <CardFooter className="mt-auto flex w-full gap-2 px-5 pb-5 pt-0">
                                {!isDefault && (
                                    <Button
                                        variant="outline"
                                        className="h-11 flex-1 rounded-2xl bg-background font-bold"
                                        onClick={() => handleSetDefault(address.id as string)}
                                        disabled={isLoading || isDeleting}
                                    >
                                        {isLoading ? <Loader2 className="size-4 animate-spin" /> : "تعيين كافتراضي"}
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11 rounded-2xl text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(address.id as string)}
                                    disabled={isLoading || isDeleting || isDefault}
                                    title={isDefault ? "لا يمكن حذف العنوان الافتراضي" : "حذف العنوان"}
                                >
                                    {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
