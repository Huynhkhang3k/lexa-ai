import { NextResponse } from "next/server";
import { createUser } from "@/lib/user-store";

export const runtime = "nodejs";

type Body = {
  email?: string;
  password?: string;
  name?: string;
  gradeLevel?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const email = body.email?.trim();
    const password = body.password ?? "";
    const name = body.name?.trim() ?? "";
    const gradeLevel = body.gradeLevel;

    if (!email || !password) {
      return NextResponse.json({ error: "Vui lòng nhập email và mật khẩu" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Mật khẩu tối thiểu 6 ký tự" }, { status: 400 });
    }

    const user = await createUser({ email, password, name, gradeLevel });
    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Không thể đăng ký";
    const status = msg.includes("đã được đăng ký") ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
