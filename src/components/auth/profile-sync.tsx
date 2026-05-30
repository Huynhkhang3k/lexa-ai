"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { bindProfileToUser } from "@/lib/user-profile";

/** Đồng bộ hồ sơ localStorage theo tài khoản đăng nhập */
export function ProfileSync() {
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (status === "loading") return;
    bindProfileToUser(session?.user?.email ?? null, session?.user?.name ?? undefined);
  }, [session?.user?.email, session?.user?.name, status]);

  return null;
}
