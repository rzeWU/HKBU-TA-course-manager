import Link from "next/link";
import { prisma } from "@/lib/db";
import { PROGRAMS, getProgramBySlug } from "@/lib/programs";
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
      code: { in: program.courseCodes },
      isActive: true,
    },
    include: {
      academicYears: {
        include: {
          assessments: {
            select: { type: true, meanScore: true, medianScore: true, studentCount: true },
          },
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
        <div className="flex gap-2 mt-4 ml-4">
          {PROGRAMS.map((p) => (
            <Link
              key={p.slug}
              href={`/program/${p.slug}`}
              className={`px-4 py-1.5 text-sm rounded-md transition font-medium ${
                p.slug === slug
                  ? "bg-hkbu-navy text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-hkbu-navy"
              }`}
            >
              {p.name}
            </Link>
          ))}
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
          {courses.map((course) => {
            const latestYear = course.academicYears[0];
            const assessments = latestYear?.assessments ?? [];
            return (
              <Link
                key={course.id}
                href={`/course/${course.code}`}
                className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-hkbu-navy/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-hkbu-navy transition-colors">
                      {course.code}
                    </h2>
                    {latestYear && (
                      <p className="text-xs text-gray-500 mt-1">
                        Latest: {latestYear.yearLabel} · {latestYear.semester}
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                    Active
                  </span>
                </div>

                {assessments.length > 0 ? (
                  <div className="space-y-2">
                    {assessments.map((a) => (
                      <div key={a.type} className="flex justify-between text-sm">
                        <span className="text-gray-600">{a.type}</span>
                        <span className="text-gray-900 font-medium tabular-nums">
                          μ {a.meanScore.toFixed(1)} · m {a.medianScore.toFixed(1)} · n={a.studentCount}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No grades uploaded yet</p>
                )}

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs text-hkbu-accent group-hover:underline">
                    View course details →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
