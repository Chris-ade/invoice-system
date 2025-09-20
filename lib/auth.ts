export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { AuthenticatedUser } from "@/types/auth";

const JWT_SECRET = process.env.JWT_SECRET || "sks";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "rks";

// Convert secrets to Uint8Array for jose
const accessSecret = new TextEncoder().encode(JWT_SECRET);
const refreshSecret = new TextEncoder().encode(JWT_REFRESH_SECRET);

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hashed: string) {
  return bcrypt.compareSync(password, hashed);
}

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .setIssuedAt()
    .sign(accessSecret);
}

export async function signRefreshToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(refreshSecret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, accessSecret);
    return payload;
  } catch (err) {
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, refreshSecret);
    return payload;
  } catch (err) {
    throw new Error("Invalid refresh token");
  }
}

export function getAuthUser(req: NextRequest): AuthenticatedUser | null {
  const userHeader = req.headers.get("x-user");
  if (userHeader) {
    return JSON.parse(userHeader);
  } else {
    return null;
  }
}

export function res(data: {}, statusCode?: number) {
  return NextResponse.json(data, { status: statusCode ?? 200 });
}
