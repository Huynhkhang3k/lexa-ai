"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Bot,
  Brain,
  Copy,
  GraduationCap,
  Loader2,
  MessageSquare,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGradeLevel, gradeLevelLabel } from "@/context/grade-level-context";
import { recordActivity } from "@/lib/user-activity";
import { loadChatSessions, saveChatSessions, type ChatSessionRecord } from "@/lib/user-history";
import { ChatMessageContent } from "@/components/chat/chat-message-content";

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

function toStoredSessions(chats: Chat[]): ChatSessionRecord[] {
  return chats.map((c) => ({
    id: c.id,
    title: c.title,
    updatedAt: new Date().toISOString(),
    messages: c.messages.map((m) => ({ role: m.role, content: m.content })),
  }));
}

function fromStoredSessions(sessions: ChatSessionRecord[]): Chat[] {
  if (!sessions.length) return [INITIAL];
  return sessions.map((s) => ({
    id: s.id,
    title: s.title,
    messages: s.messages.map((m, i) => ({
      id: `${s.id}-m${i}`,
      role: m.role,
      content: m.content,
    })),
  }));
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/65">
      <Loader2 className="h-4 w-4 animate-spin text-sky-600 dark:text-cyan-300" />
      <span>LEXA đang trả lời…</span>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-cyan-400"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { gradeLevel, openPicker } = useGradeLevel();
  const [chats, setChats] = React.useState<Chat[]>([INITIAL]);
  const [activeId, setActiveId] = React.useState("c1");
  const [hydrated, setHydrated] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const messagesScrollRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const shouldStickToBottomRef = React.useRef(true);
  const abortRef = React.useRef<AbortController | null>(null);
  const msgIdRef = React.useRef(0);
  const nextMsgId = (prefix: string) => {
    msgIdRef.current += 1;
    return `${prefix}${msgIdRef.current}`;
  };

  const active = chats.find((c) => c.id === activeId) ?? chats[0]!;
  const showSuggestions =
    active.messages.length === 1 && active.messages[0]?.role === "assistant";
  const lastAssistantMsg = [...active.messages].reverse().find((m) => m.role === "assistant");

  React.useEffect(() => {
    const stored = loadChatSessions();
    if (stored.length) {
      const loaded = fromStoredSessions(stored);
      setChats(loaded);
      setActiveId(loaded[0]!.id);
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    saveChatSessions(toStoredSessions(chats), { silent: true });
  }, [chats, hydrated]);

  React.useEffect(() => {
    const onHistory = () => {
      const stored = loadChatSessions();
      if (stored.length) {
        const loaded = fromStoredSessions(stored);
        setChats(loaded);
      }
    };
    window.addEventListener("lexa-history-updated", onHistory);
    return () => window.removeEventListener("lexa-history-updated", onHistory);
  }, []);

  React.useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el || !shouldStickToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [active.messages, typing]);

  React.useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  function onMessagesScroll() {
    const el = messagesScrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom < 80;
  }

  function newChat() {
    const id = `c${Date.now()}`;
    const chat: Chat = {
      id,
      title: "Cuộc trò chuyện mới",
      messages: [{ id: `a${Date.now()}`, role: "assistant", content: WELCOME }],
    };
    setChats((prev) => [chat, ...prev]);
    setActiveId(id);
    setError(null);
  }

  function clearAllChats() {
    if (!window.confirm("Xoá tất cả cuộc trò chuyện? Hành động này không thể hoàn tác.")) return;
    const fresh: Chat = {
      id: `c${Date.now()}`,
      title: "Trợ lý học tập",
      messages: [{ id: `a${Date.now()}`, role: "assistant", content: WELCOME }],
    };
    setChats([fresh]);
    setActiveId(fresh.id);
    setError(null);
  }

  function deleteChat(id: string) {
    setChats((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length === 0) {
        const fresh: Chat = {
          id: `c${Date.now()}`,
          title: "Trợ lý học tập",
          messages: [{ id: `a${Date.now()}`, role: "assistant", content: WELCOME }],
        };
        setActiveId(fresh.id);
        return [fresh];
      }
      if (activeId === id) setActiveId(next[0]!.id);
      return next;
    });
    setError(null);
  }

  function stopGenerating() {
    abortRef.current?.abort();
  }

  async function copyMessage(id: string, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Không sao chép được. Hãy chọn và copy thủ công.");
    }
  }

  async function requestAiReply(messages: Msg[], chatId: string) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setTyping(true);
    setError(null);
    shouldStickToBottomRef.current = true;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
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
          c.id === chatId ? { ...c, messages: [...c.messages, assistantMsg] } : c,
        ),
      );

      const userQuestions = messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .slice(-8);
      recordActivity("chat", { recentQuestions: userQuestions });
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        setError("Đã dừng phản hồi.");
        return;
      }
      setError(e instanceof Error ? e.message : "Lỗi mạng");
    } finally {
      setTyping(false);
      abortRef.current = null;
    }
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setInput("");

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

    await requestAiReply(updatedMessages, activeId);
  }

  async function regenerateLast() {
    if (typing) return;
    const msgs = active.messages;
    let cut = msgs.length;
    while (cut > 0 && msgs[cut - 1]?.role === "assistant") cut -= 1;
    if (cut === 0) return;
    const trimmed = msgs.slice(0, cut);
    if (!trimmed.some((m) => m.role === "user")) return;

    setChats((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: trimmed } : c)),
    );
    await requestAiReply(trimmed, activeId);
  }

  return (
    <Container className="py-8 sm:py-10">
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/60">
          Trợ lý học tập
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Trợ lý học tập LEXA AI
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/60">
          Hỏi bài, ôn thi, kỹ năng học tập, hoặc định hướng nghề — trả lời phù hợp khối{" "}
          {gradeLevel ? gradeLevelLabel(gradeLevel) : "của bạn"}.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Card className="flex flex-col p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <MessageSquare className="h-4 w-4" />
              Lịch sử
            </div>
            <Button variant="secondary" size="sm" type="button" onClick={newChat}>
              <Plus className="h-4 w-4" />
              Chat mới
            </Button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            type="button"
            className="mt-3 w-full justify-center"
            onClick={openPicker}
          >
            <GraduationCap className="h-4 w-4" />
            Đổi cấp học
            {gradeLevel ? ` (${gradeLevelLabel(gradeLevel)})` : ""}
          </Button>

          {chats.length > 1 ? (
            <button
              type="button"
              onClick={clearAllChats}
              className="mt-2 text-center text-xs text-red-600 hover:underline dark:text-red-400"
            >
              Xoá tất cả lịch sử
            </button>
          ) : null}

          <div className="mt-3 grid max-h-[50vh] flex-1 gap-2 overflow-auto">
            {chats.map((c) => (
              <div key={c.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={[
                    "min-w-0 flex-1 rounded-xl px-3 py-2.5 text-left text-sm transition",
                    c.id === activeId
                      ? "bg-sky-50 text-slate-900 ring-1 ring-sky-200 dark:bg-white/8 dark:text-white dark:ring-white/15"
                      : "text-slate-600 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/6",
                  ].join(" ")}
                >
                  <div className="font-medium line-clamp-1">{c.title}</div>
                  <div className="text-xs opacity-70">{c.messages.length} tin</div>
                </button>
                {chats.length > 1 ? (
                  <button
                    type="button"
                    title="Xoá cuộc trò chuyện"
                    onClick={() => deleteChat(c.id)}
                    className="rounded-lg p-2 text-slate-400 opacity-100 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        <Card className="relative flex min-h-[68vh] flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-white/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Bot className="h-4 w-4 text-violet-600 dark:text-fuchsia-300" />
              LEXA AI · Trợ lý học tập
            </div>
            {typing ? (
              <Button variant="secondary" size="sm" type="button" onClick={stopGenerating}>
                <Square className="h-3.5 w-3.5" />
                Dừng
              </Button>
            ) : null}
          </div>

          <div
            ref={messagesScrollRef}
            onScroll={onMessagesScroll}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {active.messages.map((m) => {
              const isLastAssistant = m.role === "assistant" && m.id === lastAssistantMsg?.id;
              return (
                <div
                  key={m.id}
                  className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div className="max-w-[88%]">
                    <div
                      className={[
                        "rounded-2xl px-4 py-3 text-sm leading-6",
                        m.role === "user"
                          ? "whitespace-pre-wrap bg-gradient-to-r from-sky-500 to-violet-500 text-white"
                          : "border border-slate-200 bg-white text-slate-800 dark:border-white/10 dark:bg-white/8 dark:text-white",
                      ].join(" ")}
                    >
                      {m.role === "assistant" ? (
                        <ChatMessageContent content={m.content} />
                      ) : (
                        m.content
                      )}
                    </div>
                    {m.role === "assistant" ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => copyMessage(m.id, m.content)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100 dark:text-white/50 dark:hover:bg-white/10"
                        >
                          <Copy className="h-3 w-3" />
                          {copiedId === m.id ? "Đã copy" : "Copy"}
                        </button>
                        {isLastAssistant && !typing ? (
                          <button
                            type="button"
                            onClick={regenerateLast}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100 dark:text-white/50 dark:hover:bg-white/10"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Tạo lại
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}

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
                  <TypingIndicator />
                </div>
              </div>
            ) : null}
          </div>

          {error ? (
            <p className="px-4 text-xs text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <div className="border-t border-slate-200 p-3 dark:border-white/10">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-black/30">
              <textarea
                ref={textareaRef}
                value={input}
                rows={1}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Hỏi bài học, ôn thi, kỹ năng, định hướng ngành… (Shift+Enter xuống dòng)"
                disabled={typing}
                className="max-h-40 min-h-[2.25rem] w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/35"
              />
              <Button
                type="button"
                onClick={() => sendMessage(input)}
                size="sm"
                disabled={typing || !input.trim()}
                className="shrink-0"
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
