import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { LEXA_LOGO_URL } from "@/lib/brand";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "LEXA AI — Hệ sinh thái học tập & phát triển tương lai",
  description:
    "Nền tảng AI toàn diện cho học sinh Việt Nam: khám phá bản thân, định hướng nghề nghiệp, trợ lý học tập, luyện tập và dịch thuật — tất cả trong một hệ sinh thái.",
  icons: {
    icon: LEXA_LOGO_URL,
    apple: LEXA_LOGO_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Providers>
          <div className="relative flex min-h-full flex-1 flex-col overflow-x-clip">
            <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_50%,#e2e8f0_100%)] dark:bg-[radial-gradient(1200px_circle_at_30%_10%,rgba(34,211,238,0.16),transparent_55%),radial-gradient(900px_circle_at_80%_25%,rgba(217,70,239,0.12),transparent_55%),radial-gradient(1000px_circle_at_40%_90%,rgba(59,130,246,0.10),transparent_55%),linear-gradient(to_bottom,#050611,#060712)]" />
            <div className="pointer-events-none absolute inset-0 z-0 hidden dark:block">
              <AnimatedGradient />
            </div>
            <div className="pointer-events-none absolute inset-0 z-0 grid-fade" />
            <div className="relative z-10 flex min-h-full flex-1 flex-col">
            <Navbar />
            <main className="relative flex-1">{children}</main>
            <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
