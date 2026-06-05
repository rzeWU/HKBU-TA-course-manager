import Link from "next/link";
import { prisma } from "@/lib/db";
import { ASSESSMENT_ORDER, ASSESSMENT_ABBREV } from "@/lib/constants";

export default async function AdminDashboard() {
  const courses = await prisma.course.findMany({
    include: {
      academicYears: {
        include: { assessments: { select: { type: true } } },
        orderBy: { yearLabel: "asc" },
      },
    },
    orderBy: { code: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4 mb-10">
        <Link href="/admin/upload" className="p-5 bg-white border rounded-xl hover:shadow-md hover:border-blue-300 transition">
          <h3 className="font-semibold text-base mb-1">Upload Grades</h3>
          <p className="text-sm text-gray-500">Parse .ods files</p>
        </Link>
        <Link href="/admin/courses" className="p-5 bg-white border rounded-xl hover:shadow-md hover:border-blue-300 transition">
          <h3 className="font-semibold text-base mb-1">Manage Courses</h3>
          <p className="text-sm text-gray-500">Add/remove courses</p>
        </Link>
        <Link href="/admin/files" className="p-5 bg-white border rounded-xl hover:shadow-md hover:border-blue-300 transition">
          <h3 className="font-semibold text-base mb-1">Manage Files</h3>
          <p className="text-sm text-gray-500">Upload exam files</p>
        </Link>
        <Link href="/admin/notes" className="p-5 bg-white border rounded-xl hover:shadow-md hover:border-blue-300 transition">
          <h3 className="font-semibold text-base mb-1">Manage Notes</h3>
          <p className="text-sm text-gray-500">Document changes</p>
        </Link>
      </div>

      <h2 className="text-lg font-semibold mb-4">Courses</h2>
      <div className="space-y-4">
        {courses.map((course) => {
          const years = course.academicYears;
          const allAssessmentTypes = [
            ...new Set(years.flatMap((y) => y.assessments.map((a) => a.type))),
          ].sort((a, b) => (ASSESSMENT_ORDER[a] ?? 99) - (ASSESSMENT_ORDER[b] ?? 99));

          if (allAssessmentTypes.length === 0) {
            Object.keys(ASSESSMENT_ORDER).forEach((t) => {
              if (!allAssessmentTypes.includes(t)) allAssessmentTypes.push(t);
            });
          }

          return (
            <div key={course.id} className="bg-white border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{course.code}</h3>
                  <p className="text-xs text-gray-500">{course.name}</p>
                </div>
                <Link
                  href={`/course/${course.code}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  View course →
                </Link>
              </div>

              {/* Academic Years */}
              <div className="mb-3">
                {(() => {
                const uniqueYears = [...new Set(years.map((y) => y.yearLabel))].sort();
                return (
                  <>
                    <span className="text-xs font-medium text-gray-500 mr-2">{uniqueYears.length} years:</span>
                    {uniqueYears.length === 0 ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {uniqueYears.map((yl) => {
                          const hasS1 = years.some((ay) => ay.yearLabel === yl && ay.semester === "Semester 1");
                          const hasS2 = years.some((ay) => ay.yearLabel === yl && ay.semester === "Semester 2");
                          return (
                            <span key={yl} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              <span className="font-medium">{yl.split("-")[0]}</span>
                              <span className="text-gray-500 ml-1">
                                S1{hasS2 ? " S2" : ""}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
              </div>

              {/* Assessments per year */}
              <div>
                <span className="text-xs font-medium text-gray-500 mr-2">Assessments:</span>
                {years.length === 0 ? (
                  <span className="text-xs text-gray-400">—</span>
                ) : (
                  <div className="overflow-x-auto mt-1">
                    <table className="text-xs w-full">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="text-left pr-3 py-1 font-medium">Year</th>
                          {allAssessmentTypes.map((t) => (
                            <th key={t} className="text-center px-2 py-1 font-medium">
                              {ASSESSMENT_ABBREV[t] || t}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {years.map((y) => {
                          const yearTypes = y.assessments.map((a) => a.type);
                          return (
                            <tr key={y.id} className="border-t border-gray-100">
                              <td className="pr-3 py-1 text-gray-600">
                                {y.yearLabel.split("-")[0]} {y.semester.replace("Semester ", "S")}
                              </td>
                              {allAssessmentTypes.map((t) => {
                                const has = yearTypes.includes(t);
                                return (
                                  <td key={t} className="text-center px-2 py-1">
                                    <span
                                      className={
                                        has
                                          ? "text-green-600 font-medium"
                                          : "text-gray-300"
                                      }
                                    >
                                      {has ? "✓" : "—"}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="mt-3 text-right text-xs text-gray-400">
                Updated {course.updatedAt.toLocaleDateString()}
              </div>
            </div>
          );
        })}
        {courses.length === 0 && (
          <div className="text-center py-12 text-gray-400">No courses yet.</div>
        )}
      </div>
    </div>
  );
}
