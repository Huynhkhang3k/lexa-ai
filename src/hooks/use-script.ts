"use client";

import * as React from "react";

export function useScript(src: string | null) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!src) return;
    if (document.querySelector(`script[src="${src}"]`)) {
      setReady(true);
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => setReady(true);
    el.onerror = () => setReady(false);
    document.head.appendChild(el);
    // Giữ script trong DOM để tái sử dụng (GeoGebra, Desmos)
  }, [src]);

  return ready;
}
