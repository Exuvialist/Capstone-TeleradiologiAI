import { NextResponse, type NextRequest } from "next/server";

// Sends visitors to the right place using the "session" cookie set at login (app/login/actions.ts):
// not logged in → /login; logged in → only their own role's pages.
// This is only a quick check for the screens: the backend must still check the user on every API call.
export function proxy(request: NextRequest) {
  const value = request.cookies.get("session")?.value;
  const role = value === "faskes" || value === "radiologi" ? value : null;
  const { pathname } = request.nextUrl;
  const home = new URL(role ? `/${role}/dashboard` : "/login", request.url);

  if (pathname === "/login") return role ? NextResponse.redirect(home) : NextResponse.next();
  if (!role || !pathname.startsWith(`/${role}`)) return NextResponse.redirect(home);
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/faskes/:path*", "/radiologi/:path*"],
};
