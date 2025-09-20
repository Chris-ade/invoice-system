import db from "@/lib/prisma";
import { verifyPassword, signToken, signRefreshToken, res } from "@/lib/auth";
import { uuidv7 } from "uuidv7";

export async function POST(request: Request) {
  const { name, password } = await request.json();

  const user = await db.cashier.findUnique({ where: { name } });

  // Check if user exists
  if (!user || !verifyPassword(password, user.password)) {
    return res({ success: false, message: "Invalid credentials" }, 401);
  }

  // Generate tokenId for refresh token
  const tokenId = uuidv7();

  // Sign access token (without tokenId)
  const accessToken = await signToken({
    id: user.id,
    name: user.name,
  });

  // Sign refresh token with tokenId embedded
  const refreshToken = await signRefreshToken({
    id: user.id,
    name: user.name,
    tokenId,
  });

  // Store refresh token in DB
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry, match with your refresh token expiry

  await db.refreshToken.create({
    data: {
      tokenId,
      cashierId: user.id,
      expiresAt,
      revoked: false,
    },
  });

  const response = res({
    success: true,
    message: "Login successful.",
  });

  // Set access token cookie
  response.cookies.set("access", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutes
  });

  // Set refresh token cookie (httpOnly, secure, path)
  response.cookies.set("refresh", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });

  return response;
}
