import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import type { GradeLevelId } from "./grade-level";
import { isValidGradeLevel } from "./grade-level";

export type StoredUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  gradeLevel?: GradeLevelId;
  createdAt: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __lexaUsers: StoredUser[] | undefined;
}

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const IS_VERCEL = Boolean(process.env.VERCEL);

function loadFromEnv(): StoredUser[] {
  const raw = process.env.LEXA_AUTH_USERS?.trim();
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

async function loadFromFile(): Promise<StoredUser[]> {
  try {
    const raw = await fs.readFile(USERS_FILE, "utf8");
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

async function ensureStore(): Promise<StoredUser[]> {
  if (global.__lexaUsers) return global.__lexaUsers;

  const envUsers = loadFromEnv();
  const fileUsers = IS_VERCEL ? [] : await loadFromFile();
  const merged = [...fileUsers];

  for (const u of envUsers) {
    if (!merged.some((m) => m.email.toLowerCase() === u.email.toLowerCase())) {
      merged.push(u);
    }
  }

  global.__lexaUsers = merged;
  return merged;
}

async function writeStore(users: StoredUser[]) {
  global.__lexaUsers = users;

  if (IS_VERCEL) {
    return;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const users = await ensureStore();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
  gradeLevel?: string;
}): Promise<StoredUser> {
  const email = input.email.trim().toLowerCase();
  const users = await ensureStore();

  if (users.some((u) => u.email === email)) {
    throw new Error("Email đã được đăng ký");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const gradeLevel: GradeLevelId | undefined = isValidGradeLevel(input.gradeLevel ?? null)
    ? (input.gradeLevel as GradeLevelId)
    : undefined;

  const user: StoredUser = {
    id: randomUUID(),
    email,
    name: input.name.trim() || email.split("@")[0],
    passwordHash,
    gradeLevel,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeStore(users);
  return user;
}

export async function verifyUser(
  email: string,
  password: string,
): Promise<StoredUser | null> {
  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export async function upsertOAuthUser(input: {
  email: string;
  name?: string | null;
  gradeLevel?: string;
}): Promise<StoredUser> {
  const email = input.email.trim().toLowerCase();
  const users = await ensureStore();
  const existing = users.find((u) => u.email === email);
  if (existing) return existing;

  const gradeLevel: GradeLevelId | undefined = isValidGradeLevel(input.gradeLevel ?? null)
    ? (input.gradeLevel as GradeLevelId)
    : undefined;

  const user: StoredUser = {
    id: randomUUID(),
    email,
    name: input.name?.trim() || email.split("@")[0],
    passwordHash: "",
    gradeLevel,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeStore(users);
  return user;
}
