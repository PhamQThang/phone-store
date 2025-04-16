// lib/serverCookieUtils.ts
import { cookies } from "next/headers";

export async function getServerCookieValue(
  key: string
): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(key)?.value || null;
}

export async function clearServerCookies() {
  const cookieStore = await cookies();
  const cookieNames = [
    "accessToken",
    "role",
    "userEmail",
    "fullName",
    "address",
    "phoneNumber",
    "cartId",
  ];

  cookieNames.forEach((name) => {
    cookieStore.set(name, "", { expires: new Date(0), path: "/" });
  });
}
