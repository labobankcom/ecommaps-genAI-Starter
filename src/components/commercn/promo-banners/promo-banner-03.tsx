"use client"

import { ArrowRight, X, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

const promoBannerData = {
  icon: Timer,
  message: "تخفيض خاص بنسبة 20% لفترة محدودة!",
  description: "",
  link: "/checkout",
  linkText: "نسخ واستخدام الكود",
  backgroundColor: "bg-zinc-900",
  textColor: "text-white",
  isDismissible: true,
}

export function PromoBannerThree() {
  const [isVisible, setIsVisible] = useState(true)
  const Icon = promoBannerData.icon

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "relative w-full z-50",
        promoBannerData.backgroundColor,
        promoBannerData.textColor
      )}
    >
      <div className="mx-auto flex max-w-screen-2xl w-full items-center justify-center px-6 py-2.5 lg:px-8 relative">
        <div className="flex flex-col items-center justify-center gap-1 text-center sm:flex-row sm:gap-4">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 animate-pulse" />}
            <span className="font-bold text-sm sm:text-base">{promoBannerData.message}</span>
          </div>
          {promoBannerData.description ? (
            <span className="text-xs sm:text-sm opacity-90">{promoBannerData.description}</span>
          ) : null}
          {promoBannerData.link && (
            <button
              onClick={() => {
                navigator.clipboard.writeText("DISCOUNT20");
                alert("تم نسخ الكوبون: DISCOUNT20");
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1 text-xs sm:text-sm font-bold hover:bg-white/30 transition-all active:scale-95 text-white"
            >
              {promoBannerData.linkText}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </button>
          )}
        </div>

        {promoBannerData.isDismissible && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute end-4 hover:bg-white/10"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
