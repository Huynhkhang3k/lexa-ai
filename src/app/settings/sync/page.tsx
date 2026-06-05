"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  Cloud,
  CloudOff,
  Database,
  Loader2,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";
import {
  getClientSyncState,
  subscribeSyncState,
} from "@/lib/user-server-data";
import {
  collectLocalSyncPayload,
  pullCloudSync,
  pushCloudSyncNow,
} from "@/lib/user-cloud-sync";
import { countSyncData } from "@/lib/user-sync-meta";

function formatTime(iso: string | null) {
  if (!iso) return "Chưa đồng bộ";
  try {
    return new Date(iso).toLocaleString("vi-VN");
  } catch {
    return iso;
  }
}

export default function SyncSettingsPage() {
  const { data: session, status } = useSession();
  const [state, setState] = React.useState(getClientSyncState);
  const [pushing, setPushing] = React.useState(false);

  React.useEffect(() => {
    const unsub = subscribeSyncState(() => setState(getClientSyncState()));
    return () => {
      unsub();
    };
  }, []);

  const email = session?.user?.email;
  const payload = collectLocalSyncPayload();
  const counts = countSyncData(payload.profile, payload.history, payload.activity);

  async function handlePull() {
    if (!email) return;
    setPushing(true);
    await pullCloudSync(email);
    setPushing(false);
  }

  async function handlePush() {
    setPushing(true);
    await pushCloudSyncNow();
    setPushing(false);
  }

  const statusLabel = {
    idle: "Chưa đồng bộ",
    syncing: "Đang đồng bộ…",
    synced: "Đã đồng bộ",
    offline: "Chờ mạng — dữ liệu lưu tạm",
    error: "Lỗi đồng bộ",
  }[state.status];

  if (status === "loading") {
    return (
      <Container className="flex min-h-[50vh] items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </Container>
    );
  }

  if (!email) {
    return (
      <Container className="py-14">
        <div className="mx-auto max-w-lg text-center">
          <Cloud className="mx-auto h-12 w-12 text-slate-400" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
            Đồng bộ dữ liệu
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-white/60">
            Đăng nhập để lưu dữ liệu học tập trên máy chủ và đồng bộ đa thiết bị.
          </p>
          <ButtonLink href="/login" className="mt-6" size="lg">
            Đăng nhập
          </ButtonLink>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Đồng bộ dữ liệu
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/60">
          Tài khoản: {email} · Dữ liệu học tập lưu trên máy chủ, đồng bộ giữa laptop, điện thoại và máy tính bảng.
        </p>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              {state.status === "offline" ? (
                <CloudOff className="h-6 w-6 text-amber-500" />
              ) : (
                <Cloud className="h-6 w-6 text-sky-600" />
              )}
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  Trạng thái: {statusLabel}
                </div>
                <div className="text-sm text-slate-500">
                  Lần đồng bộ gần nhất: {formatTime(state.lastSyncedAt)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.lastError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {state.lastError}
              </p>
            ) : null}

            {state.pendingOffline ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10">
                Có dữ liệu chờ đẩy lên server khi có mạng trở lại.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" disabled={pushing} onClick={() => void handlePull()}>
                <RefreshCw className={`h-4 w-4 ${pushing ? "animate-spin" : ""}`} />
                Tải từ server
              </Button>
              <Button disabled={pushing} onClick={() => void handlePush()}>
                <Database className="h-4 w-4" />
                Đẩy lên server
              </Button>
            </div>

            {state.serverMeta ? (
              <p className="text-xs text-slate-500">
                Lưu trữ: {state.serverMeta.storageBackend === "blob" ? "Vercel Blob (ổn định production)" : state.serverMeta.storageBackend === "file" ? "File local (dev)" : "Bộ nhớ tạm — cần cấu hình BLOB_READ_WRITE_TOKEN trên Vercel"}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Smartphone className="h-5 w-5 text-violet-500" />
              Dữ liệu đã lưu
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Bài test Holland", value: counts.testAttempts },
                { label: "Phiên chat AI", value: counts.chatSessions },
                { label: "Lịch sử dịch thuật", value: counts.translateHistory },
                { label: "Bài luyện tập", value: counts.practiceHistory },
                { label: "Kết quả Holland", value: counts.hasHolland ? "Có" : "Chưa" },
                { label: "Nghề mục tiêu", value: counts.hasTargetCareer ? "Có" : "Chưa" },
                { label: "Tính năng đã dùng", value: counts.featuresUsed },
                { label: "Hồ sơ học tập", value: counts.hasProfile ? "Có" : "Chưa" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5"
                >
                  <dt className="text-sm text-slate-600 dark:text-white/70">{row.label}</dt>
                  <dd className="text-sm font-semibold text-slate-900 dark:text-white">{row.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
