import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_COOKIE } from "./lib/config";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(TOKEN_COOKIE)?.value;

  if (pathname === "/login" || pathname === "/forgot-password" || pathname === "/reset-password") {
    if (token && pathname === "/login") return NextResponse.redirect(new URL("/main", req.url));
    return NextResponse.next();
  }

  if (!token) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Exclude static assets, Next.js internals, PWA files and any file with an extension
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icon-.*\\.png|.*\\..*).*)"],
};
