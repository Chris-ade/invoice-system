import { hashPassword, res } from "@/lib/auth";
import db from "@/lib/prisma";
import { withRole } from "@/lib/withAuth";
import { NextRequest } from "next/server";

// GET: Fetch all lecturers (admin only)
export const GET = withRole(
  async (request: NextRequest, user) => {
    const lecturers = await db.user.findMany({
      where: { role: "lecturer" },
      select: {
        id: true,
        full_name: true,
        email: true,
        department: true,
        created_at: true,
        lecturerStudents: { select: { student_id: true } },
        results: { select: { id: true } },
      },
    });

    const formattedResponse = lecturers.map((lecturer) => ({
      ...lecturer,
      student_count: lecturer.lecturerStudents.length,
      results_count: lecturer.results.length,
    }));

    return res({ success: true, data: formattedResponse });
  },
  ["admin"]
);

// POST: Create new lecturer (admin only)
export const POST = withRole(
  async (request: NextRequest, user) => {
    const body = await request.json();
    const { email, full_name, department, password } = body;

    if (!email || !full_name || !department || !password) {
      return res(
        {
          success: false,
          message: "Email, full name, department, and password are required.",
        },
        400
      );
    }

    const existingLecturer = await db.user.findUnique({ where: { email } });

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
          department,
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

// PUT: Update lecturer details (admin only)
export const PUT = withRole(
  async (request: NextRequest, user) => {
    const body = await request.json();
    const { id, email, full_name, department } = body;

    if (!email || !full_name || !department) {
      return res(
        {
          success: false,
          message: "Email, full name, and department are required.",
        },
        400
      );
    }

    try {
      const updatedLecturer = await db.user.update({
        where: { id, role: "lecturer" },
        data: { full_name, email, department },
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

// DELETE: Remove lecturer (admin only)
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
