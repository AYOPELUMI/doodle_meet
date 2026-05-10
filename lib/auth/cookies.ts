export const APP_USER_COOKIE = "doodlw-user";

export type CookieUser = {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
};

const cookieAge = 60 * 60 * 24 * 7;

export function serializeCookieUser(user: CookieUser) {
  return encodeURIComponent(JSON.stringify(user));
}

export function parseCookieUser(value?: string | null): CookieUser | null {
  if (!value) return null;

  try {
    return JSON.parse(decodeURIComponent(value)) as CookieUser;
  } catch {
    return null;
  }
}

export function writeCookieUser(user: CookieUser) {
  if (typeof document === "undefined") return;

  document.cookie = [
    `${APP_USER_COOKIE}=${serializeCookieUser(user)}`,
    "path=/",
    `max-age=${cookieAge}`,
    "samesite=lax",
  ].join("; ");
}

export function clearCookieUser() {
  if (typeof document === "undefined") return;
  document.cookie = `${APP_USER_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
