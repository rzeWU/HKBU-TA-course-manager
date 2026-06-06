import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string;
    const academicYear = formData.get("academicYear") as string;
    const semester = formData.get("semester") as string;
    const fileKind = formData.get("fileKind") as string;

    if (!file || !type || !academicYear || !semester) {
      return NextResponse.json(
        { error: "Missing required fields: file, type, academicYear, semester" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Upload to Vercel Blob
    const blob = await put(
      `courses/${code}/${academicYear}/${semester}/${fileKind}/${file.name}`,
      file,
      { access: "public", allowOverwrite: true }
    );

    // Save file record
    const record = await prisma.courseFile.create({
      data: {
        courseId: course.id,
        name: file.name,
        type,
        academicYear,
        semester,
        fileKind: fileKind || "Other",
        fileUrl: blob.url,
        fileSize: file.size,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
