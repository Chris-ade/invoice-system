import { hashPassword, res } from "@/lib/auth";
import db from "@/lib/prisma";
import { withRole } from "@/lib/withAuth";
import { NextRequest, NextResponse } from "next/server";

export const GET = withRole(
  async (request: NextRequest, user) => {
    const results = await db.result.findMany({
      select: {
        id: true,
        lecturer_id: true,
        student_id: true,
        uni_grade: true,
        uni_score: true,
        ind_grade: true,
        ind_score: true,
        comments: true,
        submitted_at: true,
        lecturer: {
          select: { id: true, full_name: true, department: true },
        },
        student: {
          select: {
            id: true,
            full_name: true,
            matric_number: true,
            program: true,
          },
        },
      },
      orderBy: { submitted_at: "desc" },
    });

    return res({ success: true, data: results });
  },
  ["admin"]
);

export const POST = withRole(
  async (request: NextRequest, user) => {
    const body = await request.json();
    const { email, full_name, password } = body;

    if (!email || !full_name || !password) {
      return res(
        {
          success: false,
          message: "Email, full name, and password are required.",
        },
        400
      );
    }

    const existingLecturer = await db.user.findUnique({
      where: { email },
    });

    if (existingLecturer) {
      return res(
        { success: false, message: "Lecturer with this email already exists." },
        400
      );
    }

    const passwordHash = hashPassword(password);

    try {
      const newLecturer = await db.user.create({
        data: {
          email,
          full_name,
          password: passwordHash,
          role: "lecturer",
        },
      });

      return res({ success: true, data: newLecturer });
    } catch (error) {
      console.error("Error creating lecturer:", error);
      return res(
        { success: false, message: "Failed to create lecturer." },
        500
      );
    }
  },
  ["admin"]
);

export const PUT = withRole(
  async (request: NextRequest, user) => {
    const body = await request.json();
    const { id, email, full_name } = body;

    if (!email || !full_name) {
      return res(
        { success: false, message: "Email and full name are required." },
        400
      );
    }

    try {
      const updatedLecturer = await db.user.update({
        where: { id, role: "lecturer" },
        data: { full_name, email },
      });

      return res({ success: true, message: "Lecturer updated." });
    } catch (error) {
      console.error("Error updating lecturer:", error);
      return res(
        { success: false, message: "Failed to update lecturer." },
        500
      );
    }
  },
  ["admin"]
);

export const DELETE = withRole(
  async (request: NextRequest, user) => {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return res({ success: false, message: "Invalid request." }, 400);
    }

    try {
      await db.user.delete({
        where: { id, role: "lecturer" },
      });

      return res({ success: true, message: "Lecturer deleted." });
    } catch (error) {
      console.error("Error deleting lecturer:", error);
      return res(
        { success: false, message: "Failed to delete lecturer." },
        500
      );
    }
  },
  ["admin"]
);
