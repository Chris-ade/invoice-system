import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";
import { withRole } from "@/lib/withAuth";
import { res } from "@/lib/auth";

/**
 * GET /api/lecturer/students
 * Fetch students and their results for the authenticated lecturer
 */
export const GET = withRole(
  async (req: NextRequest, user) => {
    console.log("User ID:", user.id);

    try {
      const students = await db.lecturerStudent.findMany({
        where: { lecturer_id: user.id },
        include: {
          student: {
            select: {
              id: true,
              full_name: true,
              program: true,
              matric_number: true,
              level: true,
              placement_address: true,
              results: true,
            },
          },
        },
      });

      const studentsWithResults = students.map((entry) => ({
        id: entry.student.id,
        full_name: entry.student.full_name,
        program: entry.student.program,
        matric_number: entry.student.matric_number,
        level: entry.student.level,
        placement_address: entry.student.placement_address,
        result: entry.student.results[0] || null,
        hasResult: entry.student.results.length > 0,
      }));

      return NextResponse.json({ success: true, data: studentsWithResults });
    } catch (error: any) {
      console.error("Error fetching lecturer students:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch students" },
        { status: 500 }
      );
    }
  },
  ["lecturer"]
);
