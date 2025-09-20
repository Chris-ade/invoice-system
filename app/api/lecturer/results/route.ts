import { res } from "@/lib/auth";
import db from "@/lib/prisma";
import { withRole } from "@/lib/withAuth";
import { NextRequest } from "next/server";

export const PUT = withRole(
  async (req: NextRequest, user) => {
    try {
      const {
        student_id,
        uni_score,
        uni_grade,
        ind_score,
        ind_grade,
        comments,
      } = await req.json();

      // Validate required fields
      if (!student_id || !uni_score || !uni_grade || !ind_score || !ind_grade) {
        return res({ success: false, message: "Missing required fields" }, 400);
      }

      const uniParsedScore = parseFloat(uni_score);
      const indParsedScore = parseFloat(ind_score);

      if (isNaN(uniParsedScore) || uniParsedScore < 0 || uniParsedScore > 100) {
        return res(
          {
            success: false,
            message: "University score must be between 0 and 100",
          },
          400
        );
      }

      if (isNaN(indParsedScore) || indParsedScore < 0 || indParsedScore > 100) {
        return res(
          {
            success: false,
            message: "Industrial score must be between 0 and 100",
          },
          400
        );
      }

      // Upsert result (insert or update)
      const result = await db.result.upsert({
        where: {
          student_id: student_id,
          lecturer_id: user.id,
        },
        create: {
          student_id: student_id,
          lecturer_id: user.id,
          uni_score: uniParsedScore,
          uni_grade,
          ind_score: indParsedScore,
          ind_grade,
          comments,
        },
        update: {
          uni_score: uniParsedScore,
          uni_grade,
          ind_score: indParsedScore,
          ind_grade,
          comments,
        },
      });

      return res({
        success: true,
        message: "Result updated successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Error updating result:", error);
      return res({ success: false, message: "Failed to submit result" }, 500);
    }
  },
  ["lecturer"]
);
