import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const roleRoutes: Record<string, string[]> = {
  PATIENT: ["/patient"],
  ADMIN: ["/admin"],
  DOCTOR: ["/doctor"],
  OWNER: ["/owner"],
  PHARMACY: ["/pharmacy"],
};

const publicRoutes = ["/", "/login", "/register"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Allow API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = await auth();

  // Not authenticated — redirect to login
  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = session.user.role;

  // Check if user has access to the current route
  const allowedPrefixes = roleRoutes[userRole] || [];
  const hasAccess = allowedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!hasAccess) {
    // Redirect to their own dashboard
    const dashboardRoutes: Record<string, string> = {
      PATIENT: "/patient",
      ADMIN: "/admin",
      DOCTOR: "/doctor",
      OWNER: "/owner",
      PHARMACY: "/pharmacy",
    };
    return NextResponse.redirect(
      new URL(dashboardRoutes[userRole] || "/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next).*)"],
};
