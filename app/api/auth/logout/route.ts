import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";
import { verifyRefreshToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh")?.value;

  if (refreshToken) {
    try {
      const payload = (await verifyRefreshToken(refreshToken)) as {
        tokenId: string;
      };
      await db.refreshToken.delete({
        where: { tokenId: payload.tokenId },
      });
    } catch (err) {
      console.error("Refresh token delete error:", err);
    }
  }

  const response = NextResponse.json({ success: true });

  // Force cookie expiration (overwrite instead of delete)
  response.cookies.set("access", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  response.cookies.set("refresh", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  return response;
}
