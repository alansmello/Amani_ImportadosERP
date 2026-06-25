import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE_KEY = "amani-erp-authenticated";
const LOGIN_PATH = "/login";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === LOGIN_PATH;
  const isAuthenticated = request.cookies.get(AUTH_COOKIE_KEY)?.value === "true";

  if (isLoginRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isLoginRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"]
};
