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



export function formatMeetingCode(meetingId: string) {
  if (meetingId.includes("-")) return meetingId;
  return meetingId.match(/.{1,3}/g)?.join("-") ?? meetingId;
}

export function toDateTimeLocalValue(dateValue?: string | null) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function formatScheduleLabel(dateValue?: string | null) {
  if (!dateValue) return "Starts instantly";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

export function scheduleParamsToStatus(scheduleType?: string | null) {
  return scheduleType === "scheduled" ? "scheduled" : "live";
}