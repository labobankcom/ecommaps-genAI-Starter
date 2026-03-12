"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { addAddressAction } from "@/app/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AddAddressModal({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            label: formData.get("label") as string,
            line1: formData.get("line1") as string,
            city: formData.get("city") as string,
            state: formData.get("state") as string,
            country: formData.get("country") as string || "الجزائر",
            postal_code: formData.get("postal_code") as string || "00000",
            phone: formData.get("phone") as string,
            is_default: formData.get("is_default") === "on",
        };

        const result = await addAddressAction(data);

        setLoading(false);

        if (result.success) {
            toast.success("تم إضافة العنوان بنجاح");
            setOpen(false);
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="gap-0 overflow-hidden rounded-[1.75rem] border-border/70 p-0 sm:max-w-[560px]">
                <DialogHeader>
                    <div className="border-b bg-gradient-to-r from-muted/40 to-background px-6 py-5 text-right">
                        <DialogTitle className="text-2xl font-black">إضافة عنوان جديد</DialogTitle>
                        <DialogDescription className="mt-2">
                            أدخل تفاصيل عنوان التوصيل الخاص بك هنا
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-2">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="label">تسمية العنوان (مثال: المنزل، العمل)</Label>
                            <Input id="label" name="label" placeholder="المنزل" required className="h-11 rounded-2xl" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">رقم الهاتف</Label>
                            <Input id="phone" name="phone" placeholder="0555000000" type="tel" required dir="ltr" className="h-11 rounded-2xl text-right" />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="state">الولاية (المقاطعة)</Label>
                            <Input id="state" name="state" placeholder="مثال: الجزائر العاصمة" required className="h-11 rounded-2xl" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="city">المدينة / البلدية</Label>
                            <Input id="city" name="city" placeholder="مثال: باب الزوار" required className="h-11 rounded-2xl" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="line1">العنوان التفصيلي</Label>
                        <Input id="line1" name="line1" placeholder="رقم الشارع، الحي، المبنى..." required className="h-11 rounded-2xl" />
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse rounded-2xl bg-muted/40 px-4 py-3 pt-2">
                        <input
                            type="checkbox"
                            id="is_default"
                            name="is_default"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="is_default" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            تعيين كعنوان افتراضي
                        </Label>
                    </div>

                    <Button type="submit" className="mt-4 h-12 w-full rounded-2xl text-base font-black" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "حفظ العنوان"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
