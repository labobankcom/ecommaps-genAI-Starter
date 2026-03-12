"use client";

import React from "react";
import { Facebook, Twitter, Link as LinkIcon, Share2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface SocialShareProps {
    url: string;
    title: string;
}

export function SocialShare({ url, title }: SocialShareProps) {
    const shareLinks = [
        {
            name: "Facebook",
            icon: <Facebook className="size-4" />,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            color: "hover:bg-blue-600 hover:text-white",
        },
        {
            name: "X",
            icon: <Twitter className="size-4" />,
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            color: "hover:bg-black hover:text-white",
        },
        {
            name: "WhatsApp",
            icon: <MessageCircle className="size-4" />,
            href: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
            color: "hover:bg-zinc-900 hover:text-white",
        },
    ];

    const handleCopy = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(url);
            toast.success("تم نسخ الرابط بنجاح!");
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
                <Share2 className="size-4" />
                <span className="text-[10px]">مشاركة</span>
            </div>
            <div className="flex flex-wrap lg:flex-col gap-3">
                {shareLinks.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center size-10 rounded-full border border-zinc-200 dark:border-zinc-800 transition-all duration-300 ${link.color}`}
                        title={link.name}
                    >
                        {link.icon}
                    </a>
                ))}
                <Button
                    variant="outline"
                    size="icon"
                    className="size-10 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
                    onClick={handleCopy}
                    title="Copy Link"
                >
                    <LinkIcon className="size-4" />
                </Button>
            </div>
        </div>
    );
}
