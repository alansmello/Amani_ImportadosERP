import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type PageContainerProps = ComponentPropsWithoutRef<"div">;

export function PageContainer({ className, children, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-content px-4 py-6 tablet:px-5 desktop:px-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
