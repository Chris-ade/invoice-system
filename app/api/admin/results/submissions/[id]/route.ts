import { NextRequest } from "next/server";
import { res } from "@/lib/auth";
import db from "@/lib/prisma";
import { withRoleParams } from "@/lib/withAuth";

// GET lecturer dashboard stats
export const GET = withRoleParams<{ id: string }>(
  async (req: NextRequest, { params }, user) => {
    const { id } = params;

    try {
      const lecturer = await db.user.findUnique({
        where: { id, role: "lecturer", results: { some: {} } },
        select: {
          id: true,
          full_name: true,
          email: true,
          department: true,
          lecturerStudents: { select: { student_id: true } },
          results: {
            select: {
              id: true,
              submitted_at: true,
              uni_grade: true,
              uni_score: true,
              ind_grade: true,
              ind_score: true,
              comments: true,
              admin_feedback: true,
              status: true,
              student: {
                select: {
                  id: true,
                  full_name: true,
                  matric_number: true,
                  program: true,
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
      const submitted_results = lecturer.results.length;
      const completion_rate =
        total_students > 0 ? (submitted_results / total_students) * 100 : 0;

      return res({
        success: true,
        data: {
          lecturer: {
            id: lecturer.id,
            name: lecturer.full_name,
            email: lecturer.email,
            department: lecturer.department,
            total_students,
            submitted_results,
            completion_rate,
          },
          submissions: lecturer.results,
        },
      });
    } catch (error) {
      console.error(error);
      return res(
        { success: false, message: "Failed to fetch dashboard data" },
        500
      );
    }
  },
  ["admin"]
);

// PUT: update result status
export const PUT = withRoleParams<{ id: string }>(
  async (req: NextRequest, { params }, user) => {
    const { id } = params;
    const body = await req.json();
    const { status, message } = body;

    if (!status) {
      return res({ success: false, message: "Invalid request." }, 400);
    }

    try {
      const result = await db.result.update({
        where: { id },
        data: {
          status,
          admin_feedback: message ?? null,
        },
      });

      return res({
        success: true,
        message: `The result has been ${status}.`,
        result,
      });
    } catch (error) {
      console.error(error);
      return res({ success: false, message: "Failed to update result" }, 500);
    }
  },
  ["admin"]
);

// DELETE: delete result by id
export const DELETE = withRoleParams<{ id: string }>(
  async (req: NextRequest, { params }, user) => {
    const { id } = params;

    if (!id) {
      return res({ success: false, message: "Invalid request." }, 400);
    }

    try {
      await db.result.delete({ where: { id } });
      return res({ success: true, message: "Result deleted successfully." });
    } catch (error) {
      console.error(error);
      return res({ success: false, message: "Failed to delete result" }, 500);
    }
  },
  ["admin"]
);
