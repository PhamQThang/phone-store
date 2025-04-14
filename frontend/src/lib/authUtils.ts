// lib/authUtils.ts
import { redirect } from "next/navigation";
import { getCookieValue, clearCookies } from "@/lib/cookieUtils";

export async function checkAccess(
  allowedRoles: string[] = ["Admin", "Employee"]
) {
  const role = await getCookieValue("role");
  const token = await getCookieValue("accessToken");

  if (!role || !allowedRoles.includes(role)) {
    await clearCookies();
    redirect("/auth/login");
  }

  return { role, token };
}
