import { NextRequest, NextResponse } from "next/server";
import { getCookieValue } from "@/lib/cookieUtils";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/admin")) {
    const role = await getCookieValue("role");
    const accessToken = await getCookieValue("accessToken");
    const allowedRoles = ["Admin", "Employee"];

    if (!accessToken || !role || !allowedRoles.includes(role)) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
