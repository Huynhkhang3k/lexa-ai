/** Loại BOM (U+FEFF) và khoảng trắng thừa trong biến môi trường — tránh lỗi ByteString khi gọi API */
export function cleanEnv(value: string | undefined | null): string {
  if (!value) return "";
  return value.replace(/^\uFEFF/, "").trim();
}

export function cleanEnvOptional(value: string | undefined | null): string | undefined {
  const v = cleanEnv(value);
  return v || undefined;
}
