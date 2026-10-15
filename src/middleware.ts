import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get("banking_token")?.value ||
    request.cookies.get("token")?.value;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  // Protected paths
  const isProtectedPath =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/accounts") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/transfer") ||
    pathname.startsWith("/transfers") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin");

  // If trying to access protected route without token -> redirect to /login
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/" && pathname !== "/dashboard") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and visiting login or register -> redirect to dashboard
  if (isAuthPage && token) {
    const redirectParam = request.nextUrl.searchParams.get("redirect") || "/dashboard";
    return NextResponse.redirect(new URL(redirectParam, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/login",
    "/register",
    "/accounts/:path*",
    "/transactions/:path*",
    "/transfer/:path*",
    "/transfers/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
