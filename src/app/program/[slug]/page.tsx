import Link from "next/link";
import { prisma } from "@/lib/db";
import { getProgramBySlug } from "@/lib/programs";
import { notFound } from "next/navigation";
import { ProgramCourses } from "./ProgramCourses";

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = getProgramBySlug(slug);
  if (!program) notFound();

  const courses = await prisma.course.findMany({
    where: { programSlug: slug, isActive: true },
    select: {
      id: true, code: true, name: true, description: true, courseUrl: true, programSlug: true,
      academicYears: {
        select: { yearLabel: true, semester: true },
        orderBy: { yearLabel: "desc" },
      },
    },
    orderBy: { code: "asc" },
  });

  // Build year+semester structure
  const semSet = new Set<string>();
  const yearSet = new Set<string>();
  for (const c of courses) {
    for (const ay of c.academicYears) {
      yearSet.add(ay.yearLabel);
      semSet.add(`${ay.yearLabel}|${ay.semester}`);
    }
  }
  const years = [...yearSet].sort().reverse();
  const semesters = [...semSet].map((s) => {
    const [y, sem] = s.split("|");
    return { year: y, sem };
  }).sort((a, b) => b.year.localeCompare(a.year) || a.sem.localeCompare(b.sem));

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-hkbu-gold rounded-full" />
          <div>
            <h1 className="text-2xl font-bold text-hkbu-navy">{program.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{program.fullName}</p>
          </div>
        </div>
      </div>

      <ProgramCourses courses={courses as any} years={years} semesters={semesters} />
    </div>
  );
}
