import Link from "next/link";
import { prisma } from "@/lib/db";
import { PROGRAMS } from "@/lib/programs";

export default async function HomePage() {
  // Pre-fetch course stats per program
  const programStats = await Promise.all(
    PROGRAMS.map(async (program) => {
      const courses = await prisma.course.findMany({
        where: {
          code: { in: program.courseCodes },
          isActive: true,
        },
        include: {
          academicYears: {
            include: {
              assessments: {
                select: { type: true, meanScore: true, medianScore: true },
              },
            },
            orderBy: { yearLabel: "desc" },
            take: 1,
          },
        },
      });
      return { program, courses };
    })
  );

  return (
    <div>
      {/* Hero section */}
      <div className="bg-hkbu-navy">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-hkbu-gold text-xs font-semibold tracking-widest uppercase">
              HONG KONG BAPTIST UNIVERSITY
            </span>
            <span className="w-8 h-px bg-hkbu-gold" />
            <span className="text-hkbu-gold text-xs font-semibold tracking-widest uppercase">
              SCHOOL OF BUSINESS
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            TA Course Manager
          </h1>
          <p className="text-white/60 max-w-md mx-auto text-sm leading-relaxed">
            Track assignments, analyze grade trends, and manage course materials
            across academic years for MSc programmes.
          </p>
        </div>
      </div>

      {/* Program cards */}
      <div className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="grid gap-6 md:grid-cols-2">
          {programStats.map(({ program, courses }) => {
            const totalAssessments = courses.reduce(
              (sum, c) =>
                sum +
                c.academicYears.reduce(
                  (s, y) => s + y.assessments.length,
                  0
                ),
              0
            );
            const latestYear = courses
              .flatMap((c) => c.academicYears)
              .sort((a, b) => b.yearLabel.localeCompare(a.yearLabel))[0];

            return (
              <Link
                key={program.slug}
                href={`/program/${program.slug}`}
                className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-hkbu-navy/30 transition-all group overflow-hidden"
              >
                <div
                  className="h-1.5"
                  style={{ backgroundColor: program.color }}
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-xl font-bold text-hkbu-navy group-hover:text-hkbu-accent transition-colors">
                        {program.name}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {program.fullName}
                      </p>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 text-[11px] rounded-full bg-blue-50 text-blue-700 font-medium">
                      {courses.length} course{courses.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    {courses.map((c) => (
                      <div key={c.code} className="flex justify-between">
                        <span className="font-medium">{c.code}</span>
                        {c.academicYears[0] ? (
                          <span className="text-gray-400 text-xs">
                            {c.academicYears[0].yearLabel} ·{" "}
                            {c.academicYears[0].assessments.length} assessments
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            No data yet
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {totalAssessments} assessment records
                      {latestYear ? ` · latest: ${latestYear.yearLabel}` : ""}
                    </span>
                    <span className="text-xs text-hkbu-accent font-medium group-hover:underline">
                      View programme →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {programStats.every((p) => p.courses.length === 0) && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">Welcome to HKBU TA Manager</p>
          <p className="text-sm">
            Set up courses and upload grade data to get started.
          </p>
          <Link
            href="/admin"
            className="inline-block mt-4 px-4 py-2 bg-hkbu-navy text-white rounded-lg text-sm hover:bg-hkbu-accent transition"
          >
            Go to Admin Panel
          </Link>
        </div>
      )}
    </div>
  );
}
