import { GoogleGenerativeAI } from "@google/generative-ai";
import { cleanEnv } from "./env-sanitize";

/**
 * API Key Rotation:
 * - Round-robin giữa 4 key (GEMINI_API_KEY_1..4)
 * - Nếu 1 key bị 429 thì tự chuyển key khác để retry
 *
 * Lưu ý: Model `gemini-1.5-flash` hiện hay bị 404/unsupported trên v1beta,
 * nên mình triển khai fallback model candidates để app không “chết”.
 */

type ModelName = string;

// Default ưu tiên model "lite" để nhanh hơn
const DEFAULT_MODEL: ModelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const FALLBACK_MODELS: readonly ModelName[] = [
  // Prefer stable/available ones
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-001",
] as const;

let rrIndex = 0;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isQuota429(error: unknown): boolean {
  const msg = getErrorMessage(error);
  return msg.includes("429") || msg.includes("Too Many Requests") || msg.includes("quota");
}

function isModelUnsupported(error: unknown): boolean {
  const msg = getErrorMessage(error);
  return msg.includes("404") || msg.includes("not found") || msg.includes("not supported");
}

function isOverloaded503(error: unknown): boolean {
  const msg = getErrorMessage(error);
  return msg.includes("503") || msg.includes("Service Unavailable") || msg.includes("high demand");
}

function isRetryableNetwork(error: unknown): boolean {
  const msg = getErrorMessage(error);
  return (
    msg.includes("ETIMEDOUT") ||
    msg.includes("ECONNRESET") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("fetch") ||
    msg.includes("network")
  );
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

function readApiKeys(): string[] {
  const keys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
  ]
    .map((k) => cleanEnv(k))
    .filter(Boolean);

  const unique = [...new Set(keys)];

  if (unique.length === 0) {
    throw new Error(
      "Chưa cấu hình khóa AI. Thêm GEMINI_API_KEY_1 vào cài đặt máy chủ (Vercel hoặc .env.local).",
    );
  }
  return unique;
}

function pickKeyRoundRobin(keys: string[]) {
  const idx = rrIndex % keys.length;
  rrIndex = (rrIndex + 1) % Math.max(keys.length, 1);
  return { key: keys[idx]!, index: idx };
}

function getClientByKey(key: string) {
  return new GoogleGenerativeAI(key);
}

export function getGenerativeModel(options?: {
  /**
   * User requested model (your idea): gemini-1.5-flash
   * But we may fallback if unsupported.
   */
  model?: ModelName;
  /** If true, use random instead of round-robin */
  random?: boolean;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  };
}) {
  const keys = readApiKeys();
  const chosen = options?.random
    ? { key: keys[Math.floor(Math.random() * keys.length)]!, index: -1 }
    : pickKeyRoundRobin(keys);

  const client = getClientByKey(chosen.key);
  const modelName = options?.model ?? DEFAULT_MODEL;
  const model = client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: options?.generationConfig?.temperature ?? 0.6,
      maxOutputTokens: options?.generationConfig?.maxOutputTokens ?? 1024,
      ...(options?.generationConfig?.responseMimeType
        ? { responseMimeType: options.generationConfig.responseMimeType }
        : {}),
    },
  });

  return { model, keyIndex: chosen.index, modelName };
}

function repairJsonEscapes(json: string): string {
  let result = "";
  for (let i = 0; i < json.length; i++) {
    const ch = json[i];
    if (ch !== "\\" || i + 1 >= json.length) {
      result += ch;
      continue;
    }
    const next = json[i + 1]!;
    if ('"\\/bfnrt'.includes(next)) {
      result += ch + next;
      i++;
    } else if (next === "u" && i + 5 < json.length) {
      const hex = json.slice(i + 2, i + 6);
      if (/^[0-9a-fA-F]{4}$/.test(hex)) {
        result += json.slice(i, i + 6);
        i += 5;
      } else {
        result += "\\\\u";
        i++;
      }
    } else {
      result += "\\\\" + next;
      i++;
    }
  }
  return result;
}

function parseJsonSlice<T>(slice: string): T {
  try {
    return JSON.parse(slice) as T;
  } catch {
    return JSON.parse(repairJsonEscapes(slice)) as T;
  }
}

export function extractJson<T>(text: string): T {
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  const start = cleaned.indexOf("{");
  const startArr = cleaned.indexOf("[");
  const useArr =
    startArr !== -1 && (start === -1 || startArr < start);
  const sliceStart = useArr ? startArr : start;
  if (sliceStart === -1) throw new Error("Không parse được JSON từ AI");

  const open = useArr ? "[" : "{";
  const close = useArr ? "]" : "}";
  let depth = 0;
  for (let i = sliceStart; i < cleaned.length; i++) {
    if (cleaned[i] === open) depth++;
    if (cleaned[i] === close) depth--;
    if (depth === 0) {
      return parseJsonSlice<T>(cleaned.slice(sliceStart, i + 1));
    }
  }
  throw new Error("JSON không hợp lệ từ AI");
}

export async function generateText(
  prompt: string,
  opts?: {
    model?: ModelName;
    maxRetries?: number;
    backoffMs?: number;
    timeoutMs?: number;
    generationConfig?: {
      temperature?: number;
      maxOutputTokens?: number;
      responseMimeType?: string;
    };
  },
): Promise<string> {
  const keys = readApiKeys();
  const maxRetries = Math.min(opts?.maxRetries ?? keys.length, keys.length);
  const backoffMs = Math.max(150, opts?.backoffMs ?? 350);
  const timeoutMs = Math.max(2000, opts?.timeoutMs ?? 25000);

  const requestedModel = opts?.model ?? DEFAULT_MODEL;
  const modelCandidates = [...new Set([requestedModel, DEFAULT_MODEL, ...FALLBACK_MODELS])];

  const errors: string[] = [];

  for (let attempt = 0; attempt < Math.max(maxRetries, 2); attempt++) {
    for (const modelName of modelCandidates) {
      try {
        const { model } = getGenerativeModel({
          model: modelName,
          generationConfig: opts?.generationConfig,
        });

        const result = await Promise.race([
          model.generateContent(prompt),
          (async () => {
            await sleep(timeoutMs);
            throw new Error(`AI timeout sau ${Math.round(timeoutMs / 1000)}s`);
          })(),
        ]);
        const text = result.response.text();
        if (text?.trim()) return text;
      } catch (e) {
        const msg = getErrorMessage(e);
        errors.push(`${modelName}: ${msg}`);

        if (isModelUnsupported(e)) {
          continue;
        }

        if (isQuota429(e) || isOverloaded503(e) || isRetryableNetwork(e)) {
          await sleep(backoffMs * Math.min(attempt + 1, 3));
          continue;
        }

        throw e;
      }
    }
  }

  const allQuota = errors.some((e) => e.includes("429") || e.includes("quota"));
  if (allQuota) {
    throw new Error(
      "API Gemini đã hết quota tạm thời. Vui lòng thử lại sau 1–2 phút.",
    );
  }

  const overloaded = errors.some((e) => e.includes("503") || e.includes("high demand"));
  if (overloaded) {
    throw new Error(
      "Model AI tạm quá tải — đã thử nhiều model dự phòng. Vui lòng gửi lại sau vài giây.",
    );
  }

  const authFail = errors.some(
    (e) =>
      e.includes("401") ||
      e.includes("403") ||
      e.includes("API key") ||
      e.includes("API_KEY_INVALID"),
  );
  if (authFail) {
    throw new Error(
      "Khóa API Gemini không hợp lệ. Kiểm tra GEMINI_API_KEY_1 trên Vercel hoặc .env.local.",
    );
  }

  throw new Error(
    "Không kết nối được với AI. Vui lòng thử lại sau.",
  );
}
