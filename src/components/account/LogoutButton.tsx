"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";

export function LogoutButton() {
    const [isPending, startTransition] = useTransition();

    const handleLogout = () => {
        startTransition(async () => {
            await logoutAction();
        });
    };

    return (
        <Button
            variant="outline"
            className="h-11 w-full gap-2 rounded-2xl font-bold text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
            disabled={isPending}
        >
            <LogOut className="size-4" />
            {isPending ? "جاري..." : "تسجيل الخروج"}
        </Button>
    );
}
