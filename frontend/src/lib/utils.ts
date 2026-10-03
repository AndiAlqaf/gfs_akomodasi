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
  const str = String(text).trim();

  // If it's a code with dots/dashes and digits (e.g. BR.C1.02, CMP-MR-01, LH.01.01)
  const isCode = /^[A-Za-z0-9.-]+$/i.test(str) && /\d/.test(str) && /[\.-]/.test(str);
  if (isCode) return str.toUpperCase();

  // If it's a Laundry Bag pattern: e.g. "BR.C1.02 (DWI SANTOSO)" or "Br.c1.02 (dwi Santoso)"
  const bagMatch = str.match(/^([A-Za-z0-9_.-]+)\s*\((.*)\)$/);
  if (bagMatch) {
    const roomPart = bagMatch[1].toUpperCase();
    const namePart = toTitleCase(bagMatch[2]);
    return `${roomPart} (${namePart})`;
  }

  // Capitalize first letter of words, recognizing spaces, dashes, slashes, parentheses, dots while preserving delimiters
  let result = str.toLowerCase().replace(/(^|[\s\-\/\(\[\{.,])([a-z])/g, (_, boundary, letter) => boundary + letter.toUpperCase());

  // Capitalize known abbreviations
  const abbreviations = ['Ldp', 'Dp', 'Pob', 'Mr', 'Vip', 'Vips', 'Pt', 'Gfs', 'Id', 'Cmp', 'Cni', 'Tni', 'Pamobvit'];
  const regex = new RegExp(`\\b(${abbreviations.join('|')})\\b`, 'gi');
  result = result.replace(regex, (match) => match.toUpperCase());

  return result;
}

export function calculateDuration(start: string | null, end: string | null): string {
  if (!start || !end) return '-';
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return '-';
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays}`;
}
