"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

const MESSAGE_TYPE = "lexa-career-video-ended";

export function InteractiveCareerVideoFrame() {
  const router = useRouter();
  const handledRef = React.useRef(false);

  React.useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== MESSAGE_TYPE) return;
      if (handledRef.current) return;
      handledRef.current = true;

      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/library");
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-[#f1f5f9] dark:bg-slate-950">
      <iframe
        src="/interactive-career-video/index.html"
        title="Video tương tác khám phá ngành nghề"
        className="block w-full border-0"
        style={{ minHeight: "calc(100vh - 4rem)" }}
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
