import { res } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";

export const GET = withAuth(async (request: NextRequest, user) => {
  if (!user) {
    return res({ success: false, message: "Unauthorized." }, 401);
  }

  return res({
    success: true,
    user: {
      id: user.id,
      name: user.name,
    },
  });
});
