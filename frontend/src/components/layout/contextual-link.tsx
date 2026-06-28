"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

import {
  buildContextualHref,
  currentBrowserPath,
  recordContextualTransition
} from "@/lib/contextual-navigation";

type ContextualLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function ContextualLink({ href, onClick, target, ...props }: ContextualLinkProps) {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (target && target !== "_self")
    ) {
      return;
    }

    const origin = currentBrowserPath();
    const destination = buildContextualHref(href, origin);
    recordContextualTransition(destination, origin);
    event.preventDefault();
    router.push(destination);
  }

  return <Link href={href} target={target} onClick={handleClick} {...props} />;
}
