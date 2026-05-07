import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border/60 bg-background/40 backdrop-blur hover:bg-accent/20 hover:text-foreground hover:border-primary/60",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent/15 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "relative bg-gradient-nebula text-primary-foreground font-display font-bold tracking-wider uppercase shadow-glow-primary hover:shadow-[0_0_60px_hsl(var(--primary)/0.7)] hover:-translate-y-0.5 active:translate-y-0",
        nebula: "relative bg-gradient-aurora text-primary-foreground font-semibold shadow-glow-primary hover:shadow-[0_0_60px_hsl(var(--primary)/0.7)] hover:scale-[1.02]",
        glass: "glass text-foreground hover:border-primary/60 hover:shadow-glow-accent",
        cyber: "border border-primary/50 bg-primary/10 text-primary-glow font-display tracking-widest uppercase hover:bg-primary/20 hover:border-primary hover:shadow-glow-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
