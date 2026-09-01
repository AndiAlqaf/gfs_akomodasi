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
  
  let result = str.toLowerCase().replace(/(?:^|\s|-|\/)\S/g, (c) => c.toUpperCase());
  
  // Capitalize known abbreviations
  const abbreviations = ['Ldp', 'Dp', 'Pob', 'Mr', 'Vip', 'Vips', 'Pt', 'Gfs', 'Id', 'Cmp', 'Cni'];
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
