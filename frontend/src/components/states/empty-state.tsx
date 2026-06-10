import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon, className }: EmptyStateProps) {
  return (
    <Card className={className}>
      <section>
        <CardHeader className={cn(icon ? "pb-3" : undefined)}>
          <div className="flex flex-wrap items-center gap-3">
            {icon ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
                {icon}
              </div>
            ) : null}
            <Badge variant="neutral">Placeholder</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-2 max-w-2xl">
            {description}
          </CardDescription>
        </CardContent>
      </section>
    </Card>
  );
}
