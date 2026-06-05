"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { bindProfileToUser } from "@/lib/user-profile";
import { bindActivityToUser } from "@/lib/user-activity";
import { bindHistoryToUser } from "@/lib/user-history";
import {
  initCloudSyncListeners,
  pullCloudSync,
  setCloudSyncEnabled,
} from "@/lib/user-cloud-sync";

/** Gắn dữ liệu với tài khoản — server là nguồn chính khi đã đăng nhập */
export function ProfileSync() {
  const { data: session, status } = useSession();
  const [syncing, setSyncing] = React.useState(false);

  React.useEffect(() => {
    if (status === "loading") return;

    const email = session?.user?.email ?? null;
    bindProfileToUser(email, session?.user?.name ?? undefined);
    bindActivityToUser(email);
    bindHistoryToUser(email);

    if (!email) {
      setCloudSyncEnabled(false);
      return;
    }

    setCloudSyncEnabled(true, email);

    let cancelled = false;
    setSyncing(true);
    void pullCloudSync(email).finally(() => {
      if (!cancelled) setSyncing(false);
    });

    const cleanup = initCloudSyncListeners(email);

    return () => {
      cancelled = true;
      cleanup();
      setCloudSyncEnabled(false);
    };
  }, [session?.user?.email, session?.user?.name, status]);

  if (!syncing) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-sky-200 bg-white/95 px-4 py-2 text-xs text-sky-800 shadow-lg backdrop-blur dark:border-cyan-400/30 dark:bg-slate-900/95 dark:text-cyan-200"
      role="status"
      aria-live="polite"
    >
      Đang tải dữ liệu từ máy chủ…
    </div>
  );
}
