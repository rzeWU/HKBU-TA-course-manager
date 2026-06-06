import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";
import { parseManpowerFile, type ParsedCourseAssignment } from "@/lib/manpower-parser";

export async function GET() {
  const records = await prisma.tAManpower.findMany({
    orderBy: [{ academicYear: "desc" }, { semester: "asc" }],
  });
  return NextResponse.json(records);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || file?.name || "";
    const academicYear = formData.get("academicYear") as string;
    const semester = formData.get("semester") as string;

    if (!file || !academicYear || !semester) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(
      `manpower/${academicYear}/${semester}/${file.name}`,
      file,
      { access: "public", allowOverwrite: true }
    );

    // Parse the file for TA assignments (Wu Ruize)
    let parsedDetails: ParsedCourseAssignment[] = [];
    try {
      const buffer = await file.arrayBuffer();
      parsedDetails = parseManpowerFile(buffer);
    } catch {
      // File might not be a parseable spreadsheet, that's OK
    }

    // Upsert: delete existing for same year+semester, then create
    await prisma.tAManpower.deleteMany({ where: { academicYear, semester } });
    const record = await prisma.tAManpower.create({
      data: { title, academicYear, semester, fileUrl: blob.url, fileSize: file.size },
    });

    // Auto-create courses and details from parsed data
    if (parsedDetails.length > 0) {
      for (const d of parsedDetails) {
        // Auto-create course if not exists
        await prisma.course.upsert({
          where: { code: d.courseCode },
          update: { name: d.courseName || d.courseCode },
          create: {
            code: d.courseCode,
            name: d.courseName || d.courseCode,
            programSlug: "mscdabe",
            description: null,
            courseUrl: null,
          },
        });
      }

      await prisma.tAManpowerDetail.createMany({
        data: parsedDetails.map((d) => ({
          manpowerId: record.id,
          courseCode: d.courseCode,
          weeklyHours: d.weeklyHours,
          duties: d.duties,
          skills: d.skills,
        })),
      });
    }

    return NextResponse.json({
      ...record,
      parsedCount: parsedDetails.length,
      autoDetails: parsedDetails.length > 0,
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
