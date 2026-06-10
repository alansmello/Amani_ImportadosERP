import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-amani border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        neutral: "border-border bg-surface-light text-text-secondary",
        success: "border-success bg-surface-light text-success",
        warning: "border-warning bg-surface-light text-warning",
        danger: "border-danger bg-surface-light text-danger",
        info: "border-info bg-surface-light text-info",
        accent: "border-accent bg-surface-light text-accent"
      }
    },
    defaultVariants: {
      variant: "neutral"
    }
  }
);

type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
