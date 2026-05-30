import {
  ArrowRight,
  BookOpen,
  Brain,
  ClipboardList,
  Compass,
  Languages,
  MessageCircle,
  PenLine,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { ECOSYSTEM_PILLARS } from "@/lib/landing-data";

const PILLAR_META = [
  { icon: Compass, accent: "from-sky-500/15 to-cyan-500/10", iconClass: "text-sky-600 dark:text-cyan-300" },
  { icon: Brain, accent: "from-violet-500/15 to-fuchsia-500/10", iconClass: "text-violet-600 dark:text-fuchsia-300" },
  { icon: BookOpen, accent: "from-blue-500/15 to-indigo-500/10", iconClass: "text-blue-600 dark:text-blue-300" },
] as const;

const MODULES = [
  { href: "/test", label: "Bài test", icon: ClipboardList, pillar: "Khám phá bản thân" },
  { href: "/library", label: "Thư viện nghề", icon: BookOpen, pillar: "Phát triển tương lai" },
  { href: "/chat", label: "Trợ lý học", icon: MessageCircle, pillar: "Học tập thông minh" },
  { href: "/translate", label: "Dịch thuật", icon: Languages, pillar: "Học tập thông minh" },
  { href: "/practice", label: "Luyện tập", icon: PenLine, pillar: "Học tập thông minh" },
] as const;

export function EcosystemSection() {
  return (
    <section id="ecosystem" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Hệ sinh thái LEXA"
        title="Một nền tảng — năm module liên kết"
        description="Không phải công cụ rời rạc. Mỗi module là một phần của hành trình phát triển, kết nối với nhau qua hồ sơ cá nhân."
      />

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {ECOSYSTEM_PILLARS.map((pillar, i) => {
          const meta = PILLAR_META[i];
          return (
            <Card key={pillar.title} className="relative overflow-hidden">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${meta.accent}`} />
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${meta.accent}`}
                  >
                    <meta.icon className={`h-5 w-5 ${meta.iconClass}`} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
                      Trụ cột {pillar.step}
                    </div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white">
                      {pillar.title}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {pillar.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/65"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500 dark:bg-cyan-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <ButtonLink
                  href={pillar.href}
                  variant="ghost"
                  size="sm"
                  className="mt-4 px-0 text-sky-700 dark:text-cyan-300"
                >
                  Khám phá <ArrowRight className="h-3.5 w-3.5" />
                </ButtonLink>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {MODULES.map((mod) => (
          <ButtonLink
            key={mod.href + mod.label}
            href={mod.href}
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            <mod.icon className="h-3.5 w-3.5 opacity-70" />
            {mod.label}
            <span className="hidden text-slate-400 sm:inline dark:text-white/40">·</span>
            <span className="hidden text-xs text-slate-500 sm:inline dark:text-white/45">
              {mod.pillar}
            </span>
          </ButtonLink>
        ))}
      </div>
    </section>
  );
}
