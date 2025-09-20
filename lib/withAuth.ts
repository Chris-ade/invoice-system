import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export type RouteHandler<U = any> = (
  req: NextRequest,
  user: U
) => Promise<NextResponse> | NextResponse;

export function withAuth<U = any>(handler: RouteHandler<U>) {
  return async function (req: NextRequest) {
    try {
      const token = req.cookies.get("access")?.value;
      if (!token) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      const decoded = (await verifyToken(token)) as U | null;
      if (!decoded) {
        return NextResponse.json(
          { success: false, message: "Invalid or expired token" },
          { status: 401 }
        );
      }

      return handler(req, decoded);
    } catch (error: any) {
      console.error("Auth error:", error);
      return NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 500 }
      );
    }
  };
}

export function withRole<
  U extends { id: string; role: string } = { id: string; role: string }
>(handler: RouteHandler<U>, allowedRoles: string[]) {
  return withAuth<U>(async (req, user) => {
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }
    return handler(req, user);
  });
}

// Define the correct type for the handler that will receive the resolved params
export type ResolvedRouteHandler<
  P extends Record<string, string> = {},
  U = any
> = (
  req: NextRequest,
  context: { params: P },
  user: U
) => Promise<NextResponse> | NextResponse;

// Modified HOF to correctly handle the params promise
export function withAuthParams<P extends Record<string, string> = {}, U = any>(
  handler: ResolvedRouteHandler<P, U>
) {
  // The returned function now expects a promise for params
  return async function (req: NextRequest, { params }: { params: Promise<P> }) {
    try {
      const token = req.cookies.get("access")?.value;
      if (!token)
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );

      const decoded = (await verifyToken(token)) as U | null;
      if (!decoded)
        return NextResponse.json(
          { success: false, message: "Invalid or expired token" },
          { status: 401 }
        );

      // Await the params promise before passing to the handler
      const resolvedParams = await params;

      return handler(req, { params: resolvedParams }, decoded);
    } catch (error: any) {
      console.error("Auth error:", error);
      return NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 500 }
      );
    }
  };
}

// withRoleParams can remain largely the same, but it will use the new withAuthParams
export function withRoleParams<
  P extends Record<string, string> = {},
  U extends { id: string; role: string } = { id: string; role: string }
>(handler: ResolvedRouteHandler<P, U>, allowedRoles: string[]) {
  return withAuthParams<P, U>(async (req, context, user) => {
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }
    return handler(req, context, user);
  });
}
