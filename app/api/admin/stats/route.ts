import { NextRequest } from "next/server";
import { res } from "@/lib/auth";
import db from "@/lib/prisma";
import { withRole } from "@/lib/withAuth";

export const GET = withRole(
  async (req: NextRequest, user) => {
    try {
      // Basic counts
      const [resultsCount, lecturersCount, studentsCount] = await Promise.all([
        db.result.count(),
        db.user.count({ where: { role: "lecturer" } }),
        db.student.count(), // Students are in Student table
      ]);

      // Lecturer stats: total students and submitted results
      const lecturers = await db.user.findMany({
        where: { role: "lecturer", results: { some: {} } },
        select: {
          id: true,
          full_name: true,
          lecturerStudents: { select: { student_id: true } },
          results: { select: { id: true } },
        },
        take: 10, // Limit to 10 lecturers for performance
      });

      const submissionStats = lecturers.map((lecturer) => {
        const total_students = lecturer.lecturerStudents.length;
        const submitted_results = lecturer.results.length;
        const completion_rate =
          total_students > 0 ? (submitted_results / total_students) * 100 : 0;

        return {
          lecturer_id: lecturer.id,
          lecturer_name: lecturer.full_name,
          total_students,
          submitted_results,
          completion_rate,
        };
      });

      const response = {
        stats: {
          totalLecturers: lecturersCount,
          totalStudents: studentsCount,
          totalResults: resultsCount,
        },
        submissionStats,
      };

      return res({ success: true, data: response });
    } catch (error: any) {
      console.error(error);
      return res(
        { success: false, message: "Failed to fetch dashboard data" },
        500
      );
    }
  },
  ["admin"]
);
