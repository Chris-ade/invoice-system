import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";
import { res } from "@/lib/auth";
import { withRole } from "@/lib/withAuth";

export const GET = withRole(
  async (req: NextRequest, user) => {
    try {
      const results = await db.result.findMany({
        where: { status: "approved" },
        select: {
          id: true,
          uni_score: true,
          uni_grade: true,
          ind_score: true,
          ind_grade: true,
          comments: true,
          submitted_at: true,
          student: {
            select: {
              id: true,
              full_name: true,
              matric_number: true,
              program: true,
              level: true,
            },
          },
          lecturer: {
            select: { full_name: true, department: true, email: true },
          },
        },
        orderBy: { submitted_at: "desc" },
      });

      if (results.length === 0) {
        return res({ success: false, message: "No results available." }, 404);
      }

      const csvHeaders = [
        "S/N",
        "Student Name",
        "Matric Number",
        "Level",
        "Course of Study",
        "University-based Score",
        "University-based Grade",
        "Industrial-based Score",
        "Industrial-based Grade",
        "Lecturer Name",
        "Lecturer E-mail",
        "Lecturer Department",
        "Comments",
        "Submitted At",
      ];

      const csvRows = results.map((result, index) => [
        index + 1,
        result.student.full_name,
        result.student.matric_number,
        result.student.level,
        result.student.program,
        result.uni_score,
        result.uni_grade,
        result.ind_score,
        result.ind_grade,
        result.lecturer.full_name,
        result.lecturer.email,
        result.lecturer.department,
        result.comments || "N/A",
        result.submitted_at.toLocaleString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) =>
          row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=student_results_all.csv`,
        },
      });
    } catch (error: any) {
      console.error("CSV Report Error:", error);
      return res(
        { success: false, message: "Failed to generate results file." },
        500
      );
    }
  },
  ["admin"]
);
