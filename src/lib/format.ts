import { format } from "date-fns";
import { es } from "date-fns/locale";

import { getKnownUserMap } from "@/lib/constants";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2
});

export function formatCurrencyMXN(amount: number) {
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

export function formatShortDate(value: string | Date) {
  return format(new Date(value), "EEE d MMM", { locale: es });
}

export function formatFullDateTime(value: string | Date) {
  return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: es });
}

export function formatHour(value: string | Date) {
  return format(new Date(value), "HH:mm", { locale: es });
}

export function formatDateInputValue(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export function displayUserLabel(
  userId: string,
  options?: { currentUserId?: string; fallbackIndex?: number }
) {
  if (options?.currentUserId && options.currentUserId === userId) {
    return "Tú";
  }

  const known = getKnownUserMap();
  const byMap = known.get(userId);
  if (byMap) return byMap;

  if (typeof options?.fallbackIndex === "number") {
    return `Usuario ${options.fallbackIndex + 1}`;
  }

  return `Usuario ${userId.slice(0, 6)}`;
}

export function toNumber(value: number | string | null) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}
