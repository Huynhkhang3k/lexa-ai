"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { logEvent } from "firebase/analytics";
import { getFirebaseAnalytics } from "@/lib/firebase";

function FirebasePageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    let cancelled = false;

    void getFirebaseAnalytics().then((analytics) => {
      if (cancelled || !analytics) return;

      const query = searchParams.toString();
      const pagePath = query ? `${pathname}?${query}` : pathname;

      logEvent(analytics, "page_view", {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [pathname, searchParams]);

  return null;
}

export function FirebaseAnalytics() {
  return (
    <React.Suspense fallback={null}>
      <FirebasePageViews />
    </React.Suspense>
  );
}
