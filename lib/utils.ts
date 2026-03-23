import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const baseUrl = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_SITE_URL_PROD
  : process.env.NEXT_PUBLIC_SITE_URL


export function addCommas(value: string | number): string {
  if (value === "" || value == null) return "";
  const str = String(value).replace(/,/g, "");
  const [integer, decimal] = str.split(".");
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimal !== undefined ? `${formatted}.${decimal}` : formatted;
}