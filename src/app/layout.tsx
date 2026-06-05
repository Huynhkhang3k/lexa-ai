import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { AnimatedGradient } from "@/components/ui/animated-gradient";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "LEXA AI",
  description:
    "Nền tảng AI toàn diện cho học sinh Việt Nam: khám phá bản thân, định hướng nghề nghiệp, trợ lý học tập, luyện tập và dịch thuật — tất cả trong một hệ sinh thái.",
  openGraph: {
    title: "LEXA AI",
  },
  twitter: {
    title: "LEXA AI",
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "any" },
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" }],
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
