"use client";

import * as React from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body>
        <Container className="py-14">
          <Card className="mx-auto max-w-2xl">
            <CardContent className="p-8">
              <div className="text-xs font-semibold uppercase tracking-wider text-black/60 dark:text-white/60">
                Có lỗi xảy ra
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-black dark:text-white">
                Ứng dụng gặp sự cố
              </h1>
              <p className="mt-2 text-sm leading-6 text-black/60 dark:text-white/60">
                Bạn có thể thử tải lại. Nếu lỗi lặp lại, hãy gửi mình nội dung
                bên dưới.
              </p>
              <pre className="mt-4 max-h-56 overflow-auto rounded-xl bg-black/5 p-4 text-xs text-black/70 dark:bg-white/5 dark:text-white/70">
                {error.message}
              </pre>
              <div className="mt-6">
                <Button onClick={() => reset()} size="lg">
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </body>
    </html>
  );
}

