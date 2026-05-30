## LEXA AI — AI-powered Career Guidance (VN)

Website UI MVP dành cho học sinh Việt Nam, tập trung **trải nghiệm frontend premium + futuristic** trước (chưa triển khai backend nặng).

### Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Framer Motion**
- **next-themes** (dark/light mode)

### Pages

- **`/`**: Landing page
- **`/test`**: AI Career Guidance Test (multiple-choice + progress + result)
- **`/library`**: Career Library (search + card + modal detail)
- **`/chat`**: AI Chatbot UI (sidebar, history, bubbles, typing)
- **`/practice`**: Practice Generator UI (subject/difficulty/count + generated layout)
- **`/translate`**: Translator + Grammar + AI Dictionary (OpenAI)
- **`/grammar`**: Grammar correction (Gemini)
- **`/dictionary`**: AI Dictionary (Gemini)

## Run locally (Windows / macOS / Linux)

Trong terminal ở thư mục `lexa-ai`:

```bash
npm install
npm run dev
```

Mở trình duyệt:

- `http://localhost:3000`

Nếu port bị chiếm:

```bash
npm run dev -- -p 3004
```

## Environment variables (AI keys)

- Tạo file `.env.local` (đã bị ignore nên **không commit**):

```bash
# Gemini (4 keys rotation)
GEMINI_API_KEY_1=...
GEMINI_API_KEY_2=...
GEMINI_API_KEY_3=...
GEMINI_API_KEY_4=...
```

- File mẫu: `.env.example`

## Project structure (quan trọng)

```text
src/
  app/
    page.tsx              # Landing
    test/page.tsx         # Career test UI
    library/page.tsx      # Career library UI
    chat/page.tsx         # Chatbot UI
    practice/page.tsx     # Practice generator UI
    error.tsx             # App Router error boundary
    not-found.tsx         # 404 page
  components/
    site/                 # Navbar, footer, logo, theme toggle
    ui/                   # Button, Card, Container, AnimatedGradient...
  lib/
    utils.ts              # cn()
```

## Deploy lên Vercel

- Push code lên GitHub
- Vào Vercel → **New Project** → import repo
- **Environment Variables**:
  - `GOOGLE_API_KEY` (nếu cần dùng sau)
- Build command / Output: để mặc định (Next.js)

Sau đó bấm Deploy.

## Notes

- Hiện tại đây là **frontend-first MVP**: dữ liệu và phản hồi AI đều là placeholder (để tập trung UI/UX).
- Khi bạn muốn triển khai AI thật (Gemini), mình sẽ tạo route API (`/api/...`) và gọi từ các page.

