"use client";

import * as React from "react";

/** Tránh lỗi hydration khi dữ liệu chỉ có trên trình duyệt (localStorage) */
export function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}
