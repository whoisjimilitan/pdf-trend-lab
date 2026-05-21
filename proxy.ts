import { NextRequest, NextResponse } from "next/server";

const PASSWORD = process.env.ADMIN_PASSWORD ?? "";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/factory",
  "/engine",
  "/hooks",
  "/clusters",
  "/schedule",
  "/api/factory",
  "/api/engine",
  "/api/products",
  "/api/hooks",
  "/api/clusters",
  "/api/daily-loop",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function proxy(req: NextRequest) {
  if (!isProtected(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (!PASSWORD) {
    // No password set — allow through (safe for local dev)
    return NextResponse.next();
  }

  const auth = req.headers.get("authorization");

  if (auth?.startsWith("Basic ")) {
    const encoded = auth.slice(6);
    const decoded = atob(encoded);
    const colonAt = decoded.indexOf(":");
    const password = colonAt >= 0 ? decoded.slice(colonAt + 1) : decoded;
    if (password === PASSWORD) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Access denied", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="PDF Seeds"`,
    },
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/factory/:path*",
    "/engine/:path*",
    "/hooks/:path*",
    "/clusters/:path*",
    "/schedule/:path*",
    "/api/factory/:path*",
    "/api/engine/:path*",
    "/api/products/:path*",
    "/api/hooks/:path*",
    "/api/clusters/:path*",
    "/api/daily-loop/:path*",
  ],
};
