import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminDashboard() {
  const courses = await prisma.course.findMany({
    include: {
      academicYears: {
        include: { assessments: { select: { type: true, updatedAt: true } } },
      },
    },
    orderBy: { code: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3 mb-10">
        <Link
          href="/admin/upload"
          className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition"
        >
          <h3 className="font-semibold text-lg mb-1">Upload Grades</h3>
          <p className="text-sm text-gray-500">
            Parse .ods grade files and import data
          </p>
        </Link>
        <Link
          href="/admin/files"
          className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition"
        >
          <h3 className="font-semibold text-lg mb-1">Manage Files</h3>
          <p className="text-sm text-gray-500">
            Upload assignment/exam PDFs for download
          </p>
        </Link>
        <Link
          href="/admin/notes"
          className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition"
        >
          <h3 className="font-semibold text-lg mb-1">Manage Notes</h3>
          <p className="text-sm text-gray-500">
            Document changes and adjustments
          </p>
        </Link>
      </div>

      <h2 className="text-lg font-semibold mb-4">Courses</h2>
      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Code</th>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Academic Years</th>
              <th className="text-left px-4 py-3 font-medium">Assessments</th>
              <th className="text-left px-4 py-3 font-medium">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{course.code}</td>
                <td className="px-4 py-3 text-gray-600">{course.name}</td>
                <td className="px-4 py-3 text-gray-600">
                  {course.academicYears
                    .map((y) => `${y.yearLabel} ${y.semester}`)
                    .join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {[
                    ...new Set(
                      course.academicYears.flatMap((y) =>
                        y.assessments.map((a) => a.type)
                      )
                    ),
                  ].join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {course.updatedAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No courses yet. Create courses via the API or seed script.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
