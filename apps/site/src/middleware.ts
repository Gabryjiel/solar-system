import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: "/",
};

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1] ?? "";
    const [user, pwd] = atob(authValue).split(":");

    if (user === "4dmin" && pwd === "testpwd123") {
      return NextResponse.next();
    }
  }

  const headers = new Headers(req.headers);
  headers.set("WWW-Authenticate", 'Basic realm="SolarSystem"');

  return NextResponse.next({ headers: headers, status: 401 });
}
