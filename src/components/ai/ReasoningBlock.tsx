"use client";

import { useMemo, useState, type FC } from "react";
import { Brain, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReasoningBlockProps = {
  text?: string;
  isStreaming?: boolean;
  duration?: number;
  className?: string;
};

function getReasoningLabel(isStreaming: boolean, duration?: number): string {
  if (isStreaming || duration === 0) return "يفكر...";
  if (typeof duration === "number" && duration > 0) return `فكّر لمدة ${duration} ثوانٍ`;
  return "اكتمل التفكير";
}

export const ReasoningBlock: FC<ReasoningBlockProps> = ({
  text = "",
  isStreaming = false,
  duration,
  className,
}) => {
  const [manualOpen, setManualOpen] = useState(false);
  const content = useMemo(() => text.trim(), [text]);
  const label = useMemo(() => getReasoningLabel(isStreaming, duration), [duration, isStreaming]);
  const isOpen = isStreaming || manualOpen;

  if (!isStreaming && !content) return null;

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/80", className)}>
      <button
        type="button"
        onClick={() => {
          if (isStreaming) return;
          setManualOpen((prev) => !prev);
        }}
        className="flex w-full items-center gap-2 px-3 py-2 text-right text-sm text-zinc-700 transition-colors hover:bg-zinc-100/80"
      >
        <Brain className="size-4 shrink-0 text-zinc-500" />
        <span className="flex-1 text-sm font-medium">{label}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-zinc-500 transition-transform", isOpen ? "rotate-180" : "rotate-0")} />
      </button>
      {isOpen && content ? (
        <div className="border-t border-zinc-200 px-3 py-2">
          <p className="whitespace-pre-wrap text-xs leading-6 text-zinc-600">{content}</p>
        </div>
      ) : null}
    </div>
  );
};
