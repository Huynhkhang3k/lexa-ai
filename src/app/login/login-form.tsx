"use client";

import * as React from "react";
import { getProviders, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GradeLevelPicker } from "@/components/grade-level/grade-level-picker";
import { useGradeLevel } from "@/context/grade-level-context";
import type { GradeLevelId } from "@/lib/grade-level";

type Mode = "login" | "register";

const AUTH_ERROR_VI: Record<string, string> = {
  Configuration:
    "Hệ thống đăng nhập chưa sẵn sàng. Vui lòng thử lại sau hoặc dùng email.",
  AccessDenied: "Bạn không có quyền truy cập.",
  Verification: "Liên kết xác minh không hợp lệ hoặc đã hết hạn.",
  OAuthSignin: "Không thể kết nối Google. Kiểm tra cấu hình OAuth trên server.",
  OAuthCallback: "Google từ chối đăng nhập. Thử lại hoặc dùng email.",
  OAuthAccountNotLinked: "Email này đã đăng ký bằng cách khác.",
  Default: "Đăng nhập thất bại. Vui lòng thử lại.",
};

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const { gradeLevel, setGradeLevel } = useGradeLevel();
  const [mode, setMode] = React.useState<Mode>("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [gradeError, setGradeError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(false);
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("error");
    if (authError) {
      setError(AUTH_ERROR_VI[authError] ?? AUTH_ERROR_VI.Default);
    }
  }, []);

  function ensureGrade(): boolean {
    if (mode === "login") return true;
    if (gradeLevel) return true;
    setGradeError("Vui lòng chọn khối lớp trước khi đăng ký.");
    return false;
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ensureGrade()) return;

    setLoading(true);
    setError(null);
    setGradeError(null);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, gradeLevel }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Đăng ký thất bại");
      }

      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(
          mode === "login"
            ? "Email hoặc mật khẩu không đúng"
            : "Đăng ký xong nhưng đăng nhập thất bại — thử lại",
        );
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!ensureGrade()) return;
    setError(null);
    setGradeError(null);

    const providers = await getProviders();
    if (!providers?.google) {
      setError(
        "Đăng nhập bằng Google chưa được cấu hình đầy đủ. Hãy đảm bảo bạn đã khai báo cả GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong file .env.local, sau đó khởi động lại server bằng lệnh 'npm run dev:fresh'.",
      );
      return;
    }

    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  }

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {mode === "login" ? "Đăng nhập LEXA" : "Tạo tài khoản LEXA"}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-white/60">
            Chọn khối lớp và đăng nhập để lưu hồ sơ, lộ trình và tiến độ.
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader className="pb-2">
            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/10">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError(null);
                  }}
                  className={[
                    "flex-1 rounded-lg py-2 text-sm font-medium transition",
                    mode === m
                      ? "bg-white text-slate-900 shadow-sm dark:bg-white/15 dark:text-white"
                      : "text-slate-600 dark:text-white/60",
                  ].join(" ")}
                >
                  {m === "login" ? "Đăng nhập" : "Đăng ký"}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-5 pt-4">
            {mode === "register" ? (
              <GradeLevelPicker
                value={gradeLevel}
                onChange={(id) => {
                  setGradeLevel(id);
                  setGradeError(null);
                }}
                compact
                required
                error={gradeError}
              />
            ) : null}

            <Button
              type="button"
              variant="secondary"
              className="w-full justify-center"
              onClick={handleGoogle}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              Tiếp tục với Google
            </Button>

            <div className="relative py-1 text-center text-xs text-slate-500">
              <span className="bg-white px-2 dark:bg-transparent">hoặc dùng email</span>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {mode === "register" ? (
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600 dark:text-white/70">Họ tên</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-sky-400 dark:border-white/15 dark:bg-black/30 dark:text-white"
                    placeholder="Nguyễn Văn A"
                  />
                </label>
              ) : null}
              <label className="block text-sm">
                <span className="mb-1 block text-slate-600 dark:text-white/70">Email</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-sky-400 dark:border-white/15 dark:bg-black/30 dark:text-white"
                  placeholder="ban@email.com"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-600 dark:text-white/70">Mật khẩu</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-sky-400 dark:border-white/15 dark:bg-black/30 dark:text-white"
                  placeholder="••••••"
                />
              </label>
              <Button type="submit" className="w-full justify-center" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    {mode === "login" ? "Đăng nhập" : "Đăng ký & đăng nhập"}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-white/50">
          <Link href="/" className="text-sky-700 hover:underline dark:text-cyan-300">
            ← Quay về trang chủ
          </Link>
        </p>
      </div>
    </Container>
  );
}
