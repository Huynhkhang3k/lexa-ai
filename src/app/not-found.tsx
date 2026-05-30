import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <Container className="py-14">
      <Card className="mx-auto max-w-2xl">
        <CardContent className="p-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-black/60 dark:text-white/60">
            404
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-black dark:text-white">
            Không tìm thấy trang
          </h1>
          <p className="mt-2 text-sm leading-6 text-black/60 dark:text-white/60">
            Link bạn truy cập không tồn tại hoặc đã được đổi. Hãy quay về trang
            chủ hoặc dùng menu để vào các chức năng.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/" size="lg" className="justify-center">
              Về trang chủ
            </ButtonLink>
            <Link
              href="/test"
              className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
            >
              Đi tới bài test
            </Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}

