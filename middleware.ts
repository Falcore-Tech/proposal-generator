import { auth } from "@/lib/auth/server";

export default auth.middleware({ loginUrl: "/login" });

export const config = {
  matcher: [
    "/proposals/:path*",
    "/admin/:path*",
    "/sales-team/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/custom-proposal/:path*",
  ],
};
