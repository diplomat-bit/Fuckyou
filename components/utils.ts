

// --- CONSOLIDATED FROM: ./utils.ts ---

/**
 * A simple utility for conditionally joining class names together.
 * @param classes A list of strings, which can include falsey values.
 * @returns A single string of space-separated class names.
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Creates a seeded random number generator (LCG).
 * This is essential for creating a reproducible simulation.
 * @param seed The initial seed value.
 * @returns A function that returns a pseudo-random number between 0 and 1.
 */
export function createSeededRandom(seed: number) {
  let state = seed;
  return function() {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}


// --- CONSOLIDATED FROM: ./lib/utils.ts ---

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- CONSOLIDATED FROM: ./src/lib/utils.ts ---

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with Tailwind CSS conflict resolution.
 * Usage: cn("bg-red-500", condition && "text-white", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric amount into a currency string.
 * @param amount - The number to format.
 * @param currency - The currency code (default: 'USD').
 * @param locale - The locale string (default: 'en-US').
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a date into a readable string.
 * @param date - Date object, timestamp number, or date string.
 * @param options - Intl.DateTimeFormatOptions (default: Month Day, Year).
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  }
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return "Invalid Date";
  }
  return new Intl.DateTimeFormat("en-US", options).format(d);
}

/**
 * Formats a date to a relative time string (e.g., "2 hours ago").
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(d, { month: "short", day: "numeric" });
}

/**
 * Formats a large number into a compact string (e.g., 1.2k, 1.5M).
 */
export function formatCompactNumber(number: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
}