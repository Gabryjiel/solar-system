import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: "/",
};

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1] ?? "";
    const [user, pass] = atob(authValue).split(":");

    if (user === process.env.BASIC_USER && pass === process.env.BASIC_PASS) {
      return NextResponse.next();
    }
  }

  const headers = new Headers(req.headers);
  headers.set("WWW-Authenticate", 'Basic realm="SolarSystem"');

  return NextResponse.next({ headers: headers, status: 401 });
}
