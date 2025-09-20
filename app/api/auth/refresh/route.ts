import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import {
  verifyRefreshToken,
  signToken,
  signRefreshToken,
  res,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Extract refresh token from cookies
    const refreshToken = req.cookies.get("refresh")?.value;

    if (!refreshToken) {
      return res({ success: false }, 401);
    }

    // Verify refresh token JWT & extract payload including tokenId
    const payload = (await verifyRefreshToken(refreshToken)) as {
      id: number;
      name: string;
      tokenId: string;
    };

    // Check token exists in DB & is not revoked or expired
    const tokenRecord = await db.refreshToken.findUnique({
      where: { tokenId: payload.tokenId },
    });

    console.log("Token Record", tokenRecord);

    if (
      !tokenRecord ||
      tokenRecord.revoked ||
      tokenRecord.expiresAt < new Date()
    ) {
      return res({ success: false, message: "Invalid refresh token" }, 403);
    }

    // Revoke (or delete) the used refresh token to prevent reuse (rotation)
    await db.refreshToken.delete({
      where: { tokenId: payload.tokenId },
    });

    // Generate new tokenId for new refresh token
    const { uuidv7 } = await import("uuidv7");
    const newTokenId = uuidv7();

    // Sign new access token
    const newAccessToken = await signToken({
      id: payload.id,
      name: payload.name,
    });

    // Sign new refresh token with newTokenId embedded
    const newRefreshToken = await signRefreshToken({
      id: payload.id,
      name: payload.name,
      tokenId: newTokenId,
    });

    // Save new refresh token record to DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // example: refresh token expires in 30 days

    await db.refreshToken.create({
      data: {
        tokenId: newTokenId,
        cashierId: payload.id,
        expiresAt,
      },
    });

    const response = res({ success: true });

    // Set new access token as HttpOnly cookie
    response.cookies.set("access", newAccessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 15, // 15 mins
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Set new refresh token as HttpOnly cookie (optional)
    response.cookies.set("refresh", newRefreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    return res({ success: false, message: "Could not refresh token" }, 500);
  }
}
