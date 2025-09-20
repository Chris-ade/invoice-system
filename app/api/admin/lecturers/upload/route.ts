import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { parse as parseCSV } from "csv-parse";
import db from "@/lib/prisma";
import { withRole } from "@/lib/withAuth";
import { Readable } from "stream";

export const POST = withRole(
  async (req: NextRequest, user) => {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const lecturer_id = formData.get("lecturer_id") as string | null;

      if (!file || !lecturer_id) {
        return NextResponse.json(
          { success: false, message: "File and Lecturer ID are required." },
          { status: 400 }
        );
      }

      const students: {
        full_name: string;
        matric_number: string;
        level: string;
        program: string;
        placement_address: string;
      }[] = [];

      // Create a readable stream from the file's ArrayBuffer
      const buffer = await file.arrayBuffer();
      const stream = new Readable();
      stream.push(Buffer.from(buffer));
      stream.push(null); // End the stream

      const parser = stream.pipe(
        parseCSV({ columns: true, skip_empty_lines: true })
      );

      for await (const row of parser) {
        const full_name = row["FULL NAME"];
        const matric_number = row["MATRIC NUMBER"];
        const level = row["LEVEL"];
        const program = row["COURSE OF STUDY"];
        const placement_address =
          row["NAME AND ADDRESS OF ORGANIZATION/ESTABLISHMENT"];

        if (
          full_name &&
          matric_number &&
          level &&
          program &&
          placement_address
        ) {
          students.push({
            full_name,
            matric_number,
            level,
            program,
            placement_address,
          });
        }
      }

      if (students.length === 0) {
        return NextResponse.json(
          { success: false, message: "No valid student data found in CSV." },
          { status: 400 }
        );
      }

      // Check if lecturer exists before proceeding
      const lecturer = await db.user.findUnique({
        where: { id: lecturer_id, role: "lecturer" },
      });

      if (!lecturer) {
        return NextResponse.json(
          { success: false, message: "Lecturer not found." },
          { status: 404 }
        );
      }

      // Using a Prisma transaction to ensure atomicity of the database operations
      const result = await db.$transaction(async (prisma) => {
        // Insert students, skipping duplicates
        await prisma.student.createMany({
          data: students,
          skipDuplicates: true,
        });

        // Retrieve the IDs of the newly created or existing students
        const matricNumbers = students.map((s) => s.matric_number);
        const studentRecords = await prisma.student.findMany({
          where: {
            matric_number: { in: matricNumbers },
          },
          select: {
            id: true,
            matric_number: true,
          },
        });

        // Create lecturer-student relationships
        await prisma.lecturerStudent.createMany({
          data: studentRecords.map((student) => ({
            lecturer_id: lecturer_id,
            student_id: student.id,
          })),
          skipDuplicates: true,
        });

        // Fetch the updated lecturer data
        return await prisma.user.findUnique({
          where: { id: lecturer_id, role: "lecturer" },
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
      });

      if (!result) {
        return NextResponse.json(
          { success: false, message: "Lecturer not found after update." },
          { status: 404 }
        );
      }

      const formattedLecturer = {
        ...result,
        student_count: result.lecturerStudents.length,
        results_count: result.results.length,
      };

      return NextResponse.json({
        success: true,
        message: "Students uploaded successfully.",
        data: formattedLecturer,
      });
    } catch (error) {
      console.error("Error saving data:", error);
      return NextResponse.json(
        { success: false, message: "Something went wrong." },
        { status: 500 }
      );
    }
  },
  ["admin"]
);
