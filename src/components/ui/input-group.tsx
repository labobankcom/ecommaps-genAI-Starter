import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const InputGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("relative flex w-full items-center", className)}
        {...props}
    />
));
InputGroup.displayName = "InputGroup";

const InputGroupInput = React.forwardRef<
    HTMLInputElement,
    React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => (
    <Input
        ref={ref}
        className={cn("flex-1 pe-32", className)}
        {...props}
    />
));
InputGroupInput.displayName = "InputGroupInput";

const InputGroupAddon = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { align?: "inline-end" | "inline-start" }
>(({ className, align = "inline-end", ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "absolute top-0 flex h-full items-center justify-center p-1",
            align === "inline-end" ? "end-0" : "start-0",
            className
        )}
        {...props}
    />
));
InputGroupAddon.displayName = "InputGroupAddon";

const InputGroupButton = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof Button>
>(({ className, variant = "secondary", size = "sm", ...props }, ref) => (
    <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn("h-full rounded-md", className)}
        {...props}
    />
));
InputGroupButton.displayName = "InputGroupButton";

export { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton };
