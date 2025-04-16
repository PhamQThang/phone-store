// lib/clientCookieUtils.ts
export function getClientCookieValue(key: string): string | null {
  if (typeof window === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${key}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export function setClientCookie(
  key: string,
  value: string,
  options: {
    days?: number;
    path?: string;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  } = {}
): void {
  if (typeof window === "undefined") return;

  const {
    days = 7,
    path = "/",
    secure = process.env.NODE_ENV === "production",
    sameSite = "strict",
  } = options;

  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  let cookie = `${key}=${encodeURIComponent(
    value
  )}; path=${path}; expires=${expires.toUTCString()}; sameSite=${sameSite}`;

  if (secure) {
    cookie += "; secure";
  }

  document.cookie = cookie;
}

export function clearClientCookies() {
  if (typeof window === "undefined") return;

  const cookiesToClear = [
    "accessToken",
    "role",
    "userEmail",
    "fullName",
    "address",
    "phoneNumber",
    "cartId",
  ];

  cookiesToClear.forEach((name) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });
}
