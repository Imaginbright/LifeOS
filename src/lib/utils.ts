import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import type { Currency } from "./types";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const number = (value: number) =>
  new Intl.NumberFormat("en-NG").format(value);
export const money = (value: number, currency: Currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
export const shortDate = (value: string) => format(parseISO(value), "MMM d");
export const percent = (current: number, target: number) =>
  target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0;
