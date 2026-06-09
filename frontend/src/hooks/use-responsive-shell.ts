"use client";

import { useEffect, useState } from "react";

import type { ResponsiveLayoutState, ViewportClass } from "@/types/ui-state";

function getViewportClass(width: number): ViewportClass {
  if (width >= 1024) {
    return "desktop";
  }

  if (width >= 768) {
    return "tablet";
  }

  return "smartphone";
}

function getLayoutState(width: number): ResponsiveLayoutState {
  const viewportClass = getViewportClass(width);

  if (viewportClass === "desktop") {
    return {
      viewportClass,
      navigationMode: "sidebar",
      contentColumns: 4,
      contentPadding: "32px",
      maxContentWidth: "1440px"
    };
  }

  if (viewportClass === "tablet") {
    return {
      viewportClass,
      navigationMode: "compact",
      contentColumns: 2,
      contentPadding: "20px",
      maxContentWidth: "100%"
    };
  }

  return {
    viewportClass,
    navigationMode: "bottom",
    contentColumns: 1,
    contentPadding: "16px",
    maxContentWidth: "100%"
  };
}

export function useResponsiveShell() {
  const [layoutState, setLayoutState] = useState<ResponsiveLayoutState>(() =>
    getLayoutState(0)
  );

  useEffect(() => {
    const updateLayout = () => {
      setLayoutState(getLayoutState(window.innerWidth));
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);

    return () => {
      window.removeEventListener("resize", updateLayout);
    };
  }, []);

  return layoutState;
}
