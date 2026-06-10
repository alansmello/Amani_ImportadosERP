import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { cn } from "@/lib/cn";

type MetricPlaceholderCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  status?: string;
  className?: string;
};

export function MetricPlaceholderCard({
  title,
  description,
  icon: Icon,
  status = "Em preparacao",
  className
}: MetricPlaceholderCardProps) {
  return (
    <Card className={cn("min-h-40", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <Badge variant="neutral">{status}</Badge>
      </CardHeader>
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
