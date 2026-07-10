import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      if (path.startsWith("/admin")) return NextResponse.redirect(new URL("/login/admin", req.url));
      if (path.startsWith("/client")) return NextResponse.redirect(new URL("/login/client", req.url));
      if (path.startsWith("/employee")) return NextResponse.redirect(new URL("/login/employee", req.url));
      return NextResponse.redirect(new URL("/login-selection", req.url));
    }

    if (path.startsWith("/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login/admin", req.url));
    }

    if (path.startsWith("/client") && token.role !== "CLIENT") {
      return NextResponse.redirect(new URL("/login/client", req.url));
    }

    if (path.startsWith("/employee") && token.role !== "EMPLOYEE") {
      return NextResponse.redirect(new URL("/login/employee", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware handle all logic
    }
  }
);

export const config = {
  matcher: ["/admin/:path*", "/client/:path*", "/employee/:path*"],
};
