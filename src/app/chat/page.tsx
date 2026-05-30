"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Bot,
  Brain,
  GraduationCap,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGradeLevel, gradeLevelLabel } from "@/context/grade-level-context";
import { recordActivity } from "@/lib/user-activity";

type Msg = { id: string; role: "user" | "assistant"; content: string };
type Chat = { id: string; title: string; messages: Msg[] };

const WELCOME =
  "Chào bạn! Mình là LEXA AI — trợ lý học tập của bạn.\n\nMình có thể giúp:\n• Giải thích bài học các môn\n• Gợi ý cách ôn thi & lập kế hoạch\n• Hướng dẫn làm bài tập (gợi ý từng bước, không làm hộ)\n• Tư vấn chọn ngành / nghề nghiệp\n\nBạn đang học lớp mấy và cần hỗ trợ gì hôm nay?";

const SUGGESTIONS = [
  {
    icon: BookOpen,
    label: "Giải thích bài Toán",
    text: "Bạn giải thích giúp mình khái niệm đạo hàm và cho 1 ví dụ dễ hiểu được không?",
  },
  {
    icon: Brain,
    label: "Cách ôn thi",
    text: "Mình sắp thi học kỳ môn Vật lý, bạn gợi ý lịch ôn 2 tuần như thế nào cho hợp lý?",
  },
  {
    icon: GraduationCap,
    label: "Định hướng ngành",
    text: "Mình thích Tin học và Toán, nên học ngành gì ở đại học phù hợp?",
  },
  {
    icon: Sparkles,
    label: "Kỹ năng học tập",
    text: "Làm sao để tập trung học tốt hơn khi hay bị xao nhãng bởi điện thoại?",
  },
] as const;

const INITIAL: Chat = {
  id: "c1",
  title: "Trợ lý học tập",
  messages: [{ id: "m1", role: "assistant", content: WELCOME }],
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-slate-500 dark:bg-white/50"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export default function ChatPage() {
  const { gradeLevel } = useGradeLevel();
  const [chats, setChats] = React.useState<Chat[]>([INITIAL]);
  const [activeId, setActiveId] = React.useState("c1");
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const msgIdRef = React.useRef(0);
  const nextMsgId = (prefix: string) => {
    msgIdRef.current += 1;
    return `${prefix}${msgIdRef.current}`;
  };

  const active = chats.find((c) => c.id === activeId) ?? chats[0]!;
  const showSuggestions =
    active.messages.length === 1 && active.messages[0]?.role === "assistant";

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active.messages, typing]);

  function newChat() {
    const id = `c${Date.now()}`;
    const chat: Chat = {
      id,
      title: "Cuộc trò chuyện mới",
      messages: [
        {
          id: `a${Date.now()}`,
          role: "assistant",
          content: WELCOME,
        },
      ],
    };
    setChats((prev) => [chat, ...prev]);
    setActiveId(id);
    setError(null);
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setInput("");
    setError(null);

    const userMsg: Msg = { id: nextMsgId("u"), role: "user", content: trimmed };
    const updatedMessages = [...active.messages, userMsg];

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              title:
                c.title === "Cuộc trò chuyện mới" || c.title === "Trợ lý học tập"
                  ? trimmed.slice(0, 36)
                  : c.title,
              messages: updatedMessages,
            }
          : c,
      ),
    );

    setTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          gradeLevel: gradeLevel ?? "thcs",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chat lỗi");

      const assistantMsg: Msg = {
        id: nextMsgId("a"),
        role: "assistant",
        content: data.reply,
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, messages: [...c.messages, assistantMsg] }
            : c,
        ),
      );

      const userQuestions = updatedMessages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .slice(-8);
      recordActivity("chat", { recentQuestions: userQuestions });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi mạng");
    } finally {
      setTyping(false);
    }
  }

  return (
    <Container className="py-8 sm:py-10">
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/60">
          AI Learning Assistant
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Trợ lý học tập LEXA AI
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/60">
          Hỏi bài, ôn thi, kỹ năng học tập, hoặc định hướng nghề — AI trả lời phù hợp khối{" "}
          {gradeLevel ? gradeLevelLabel(gradeLevel) : "của bạn"}.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Card className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <MessageSquare className="h-4 w-4" />
              Lịch sử
            </div>
            <Button variant="secondary" size="sm" type="button" onClick={newChat}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 grid max-h-[55vh] gap-2 overflow-auto">
            {chats.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={[
                  "w-full rounded-xl px-3 py-2.5 text-left text-sm transition",
                  c.id === activeId
                    ? "bg-sky-50 text-slate-900 ring-1 ring-sky-200 dark:bg-white/8 dark:text-white dark:ring-white/15"
                    : "text-slate-600 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/6",
                ].join(" ")}
              >
                <div className="font-medium line-clamp-1">{c.title}</div>
                <div className="text-xs opacity-70">{c.messages.length} tin</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="relative flex min-h-[68vh] flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-white/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Bot className="h-4 w-4 text-violet-600 dark:text-fuchsia-300" />
              LEXA AI · Trợ lý học tập
            </div>
            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-800 dark:bg-cyan-400/15 dark:text-cyan-200">
              Gemini
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-auto px-4 py-4">
            {active.messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user" ? "flex justify-end" : "flex justify-start"
                }
              >
                <div
                  className={[
                    "max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6",
                    m.role === "user"
                      ? "bg-gradient-to-r from-sky-500 to-violet-500 text-white"
                      : "border border-slate-200 bg-white text-slate-800 dark:border-white/10 dark:bg-white/8 dark:text-white",
                  ].join(" ")}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {showSuggestions && !typing ? (
              <div className="pt-2">
                <p className="mb-2 text-xs font-medium text-slate-500 dark:text-white/50">
                  Gợi ý câu hỏi — bấm để hỏi ngay:
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => sendMessage(s.text)}
                      className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-xs transition hover:border-sky-300 hover:bg-sky-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-cyan-400/40 dark:hover:bg-cyan-400/10"
                    >
                      <s.icon className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-cyan-300" />
                      <span>
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {s.label}
                        </span>
                        <span className="mt-0.5 block text-slate-500 dark:text-white/55 line-clamp-2">
                          {s.text}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {typing ? (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/8">
                  <TypingDots />
                </div>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          {error ? (
            <p className="px-4 text-xs text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <div className="border-t border-slate-200 p-3 dark:border-white/10">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-black/30">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Hỏi bài học, ôn thi, kỹ năng, định hướng ngành…"
                disabled={typing}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/35"
              />
              <Button
                type="button"
                onClick={() => sendMessage(input)}
                size="sm"
                disabled={typing || !input.trim()}
              >
                {typing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
}
