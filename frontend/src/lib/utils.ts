import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function toTitleCase(text: string | null | undefined): string {
  if (!text) return '';
  const str = String(text);
  const isCode = /^[A-Z0-9.-]+$/.test(str) && /\d/.test(str) && /\./.test(str);
  if (isCode) return str;
  return str.toLowerCase().replace(/(?:^|\s|-|\/)\S/g, (c) => c.toUpperCase());
}
