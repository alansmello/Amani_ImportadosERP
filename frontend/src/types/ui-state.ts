export type DataStateStatus = "idle" | "loading" | "success" | "empty" | "error";

export type DataState = {
  status: DataStateStatus;
  message: string;
  retryAvailable?: boolean;
  technicalCode?: string;
};

export type ViewportClass = "smartphone" | "tablet" | "desktop";

export type NavigationMode = "bottom" | "compact" | "sidebar";

export type ResponsiveLayoutState = {
  viewportClass: ViewportClass;
  navigationMode: NavigationMode;
  contentColumns: number;
  contentPadding: string;
  maxContentWidth: string;
};
