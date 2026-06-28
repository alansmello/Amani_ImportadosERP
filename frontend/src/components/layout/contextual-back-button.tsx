"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  consumeContextualReturn,
  currentBrowserPath,
  normalizeInternalPath
} from "@/lib/contextual-navigation";

type ContextualBackButtonProps = {
  fallbackHref: string;
  label?: string;
};

export function ContextualBackButton({
  fallbackHref,
  label = "Voltar"
}: ContextualBackButtonProps) {
  const router = useRouter();
  const initialized = useRef(false);
  const safeFallback = normalizeInternalPath(fallbackHref) ?? "/";
  const [destination, setDestination] = useState(safeFallback);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setDestination(consumeContextualReturn(currentBrowserPath()) ?? safeFallback);
  }, [safeFallback]);

  return (
    <Button type="button" variant="secondary" onClick={() => router.push(destination)}>
      <ArrowLeft className="h-4 w-4" aria-hidden />
      <span>{label}</span>
    </Button>
  );
}
