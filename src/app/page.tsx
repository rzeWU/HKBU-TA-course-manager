import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    include: {
      academicYears: {
        include: {
          assessments: {
            select: { type: true, meanScore: true, medianScore: true },
          },
        },
      },
    },
    orderBy: { code: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Course Management Dashboard
        </h1>
        <p className="text-gray-500">
          Track assignments, grades, and changes across academic years
        </p>
      </header>

      {courses.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">No courses set up yet.</p>
          <Link href="/admin" className="text-blue-600 hover:underline">
            Go to Admin panel to add courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course) => {
            const latestYear = course.academicYears
              .sort((a, b) => b.yearLabel.localeCompare(a.yearLabel))
              .at(0);

            const assessmentTypes = latestYear?.assessments ?? [];
            return (
              <Link
                key={course.id}
                href={`/course/${course.code}`}
                className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {course.code}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {latestYear
                        ? `${latestYear.yearLabel} · ${latestYear.semester}`
                        : "No data yet"}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                    Active
                  </span>
                </div>

                {assessmentTypes.length > 0 ? (
                  <div className="space-y-2">
                    {assessmentTypes.map((a) => (
                      <div
                        key={a.type}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">{a.type}</span>
                        <span className="text-gray-900 font-medium">
                          μ {a.meanScore.toFixed(1)} / m{" "}
                          {a.medianScore.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    No assessments uploaded yet
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
