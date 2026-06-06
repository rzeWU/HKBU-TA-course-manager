import Link from "next/link";
import { prisma } from "@/lib/db";
import { getProgramBySlug } from "@/lib/programs";
import { notFound } from "next/navigation";

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = getProgramBySlug(slug);

  if (!program) notFound();

  const courses = await prisma.course.findMany({
    where: {
      programSlug: slug,
      isActive: true,
    },
    select: {
      id: true, code: true, name: true, description: true, courseUrl: true, programSlug: true,
      academicYears: {
        include: {
          assessments: { select: { type: true, meanScore: true, medianScore: true, studentCount: true } },
        },
        orderBy: { yearLabel: "desc" },
      },
    },
    orderBy: { code: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Program header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-hkbu-gold rounded-full" />
          <div>
            <h1 className="text-2xl font-bold text-hkbu-navy">{program.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{program.fullName}</p>
          </div>
        </div>
      </div>

      {/* Course cards */}
      {courses.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No courses available yet</p>
          <p className="text-sm mt-2">Courses will appear once grade data is uploaded</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-hkbu-navy/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <Link href={`/course/${course.code}`}>
                  <h2 className="text-lg font-semibold text-hkbu-navy hover:text-hkbu-accent transition-colors">
                    {course.code}
                  </h2>
                </Link>
              </div>
              <h3 className="text-sm font-medium text-gray-800 mb-2">{course.name}</h3>
              {course.description ? (
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">
                  {course.description}
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic mb-4">No description available</p>
              )}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <Link
                  href={`/course/${course.code}`}
                  className="text-xs text-hkbu-accent hover:underline font-medium"
                >
                  View TA records →
                </Link>
                {course.courseUrl && (
                  <a
                    href={course.courseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-hkbu-gold hover:underline font-medium"
                  >
                    Learn More ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
