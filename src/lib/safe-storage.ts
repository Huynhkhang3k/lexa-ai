/** Ép giá trị thành mảng — tránh crash khi localStorage bị lỗi định dạng */
export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

/** Ép giá trị thành object — tránh crash khi localStorage bị lỗi định dạng */
export function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
