import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { withRoleParams } from "@/lib/withAuth";
import { res } from "@/lib/auth";

/**
 * GET /api/admin/lecturers/{id}
 * Fetch students and their results for the authenticated lecturer
 */
export const GET = withRoleParams<{ id: string }>(
  async (req: NextRequest, context, user) => {
    const { id } = context.params;

    try {
      const lecturer = await db.user.findUnique({
        where: { id, role: "lecturer" },
        select: {
          id: true,
          full_name: true,
          email: true,
          department: true,
          lecturerStudents: {
            include: {
              student: {
                include: {
                  results: true, // fetch results for each student directly
                },
              },
            },
          },
        },
      });

      if (!lecturer) {
        return res(
          { success: false, message: "Lecturer does not exist." },
          404
        );
      }

      const total_students = lecturer.lecturerStudents.length;

      // Count results properly across all students
      const submitted_results = lecturer.lecturerStudents.reduce(
        (acc, ls) => acc + ls.student.results.length,
        0
      );

      const completion_rate =
        total_students > 0 ? (submitted_results / total_students) * 100 : 0;

      const lecturerStudents = lecturer.lecturerStudents.map((data) => {
        return {
          id: data.student.id,
          full_name: data.student.full_name,
          program: data.student.program,
          matric_number: data.student.matric_number,
          level: data.student.level,
          placement_address: data.student.placement_address,
          result: data.student.results[0] || null, // student-specific result
          hasResult: data.student.results.length > 0,
        };
      });

      const lecturerData = {
        full_name: lecturer.full_name,
        email: lecturer.email,
        department: lecturer.department,
        total_students,
        submitted_results,
        completion_rate,
        students: lecturerStudents,
      };

      return res({ success: true, data: lecturerData });
    } catch (error: any) {
      console.error("Error fetching lecturer data:", error);
      return res(
        { success: false, message: "Failed to fetch lecturer's data" },
        500
      );
    }
  },
  ["admin"]
);
