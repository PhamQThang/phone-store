// lib/cookieUtils.ts
import { cookies } from "next/headers";

export async function getCookieValue(key: string): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(key)?.value || null;
  } catch (error: any) {
    console.error(`Lỗi khi lấy cookie ${key}:`, error.message);
    return null;
  }
}

export async function clearCookies() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("accessToken", "", { expires: new Date(0), path: "/" });
    cookieStore.set("role", "", { expires: new Date(0), path: "/" });
    cookieStore.set("userEmail", "", { expires: new Date(0), path: "/" });
    cookieStore.set("fullName", "", { expires: new Date(0), path: "/" });
    cookieStore.set("address", "", { expires: new Date(0), path: "/" });
    cookieStore.set("phoneNumber", "", { expires: new Date(0), path: "/" });
    cookieStore.set("cartId", "", { expires: new Date(0), path: "/" });
  } catch (error: any) {
    console.error("Lỗi khi xóa cookies:", error.message);
  }
}
