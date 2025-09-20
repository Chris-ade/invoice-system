import db from "@/lib/prisma";
import { res, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const { name, password } = await request.json();

  // Check if user already exists
  const existingUser = await db.cashier.findUnique({ where: { name } });
  if (existingUser) {
    return res({ success: false, message: "User already exists" }, 409);
  }

  // Create new user
  const hashedPassword = await hashPassword(password); // Assume signPassword hashes the password
  const newUser = await db.cashier.create({
    data: {
      name,
      password: hashedPassword,
    },
  });

  if (!newUser) {
    return res({ success: false, message: "Registration failed" }, 500);
  }

  return res(
    {
      success: true,
      message: "Registration successful.",
    },
    201
  );
}
