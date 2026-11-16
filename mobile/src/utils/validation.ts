export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function hasErrors<T>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).some(Boolean);
}

export function minLength(value: string, min: number, label: string, feminine = false): string | undefined {
  const text = value.trim();
  if (!text) return `${label} é obrigatóri${feminine ? 'a' : 'o'}`;
  if (text.length < min) return `${label} deve ter pelo menos ${min} caracteres`;
  return undefined;
}
