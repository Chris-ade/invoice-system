import { hashPassword, res } from "@/lib/auth";
import db from "@/lib/prisma";
import { withRole } from "@/lib/withAuth";
import { NextRequest } from "next/server";

export const GET = withRole(
  async (request: NextRequest, user) => {
    const students = await db.student.findMany({
      select: {
        id: true,
        full_name: true,
        level: true,
        program: true,
        matric_number: true,
        placement_address: true,
        created_at: true,
      },
    });

    // Map to include student count
    const formattedResponse = students.map((student) => ({
      ...student,
      // Include any additional fields or transformations here
    }));

    return res({ success: true, data: formattedResponse });
  },
  ["admin"]
);

export const PUT = withRole(
  async (request: NextRequest, user) => {
    const body = await request.json();
    const { id, full_name, program, level, matric_number, placement_address } =
      body;

    if (
      !full_name ||
      !program ||
      !level ||
      !matric_number ||
      !placement_address
    ) {
      return res(
        {
          success: false,
          message: "Email, full name, and department are required.",
        },
        400
      );
    }

    try {
      const updatedStudent = await db.student.update({
        where: { id },
        data: { full_name, program, level, matric_number, placement_address },
      });

      return res({ success: true, message: "Student updated." });
    } catch (error) {
      console.error("Error updating student:", error);
      return res({ success: false, message: "Failed to update student." }, 500);
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
      await db.student.delete({
        where: { id },
      });

      return res({ success: true, message: "Student deleted." });
    } catch (error) {
      console.error("Error deleting student:", error);
      return res({ success: false, message: "Failed to delete student." }, 500);
    }
  },
  ["admin"]
);
