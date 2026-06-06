import Link from "next/link";
import { prisma } from "@/lib/db";
import { WorkloadChart } from "./WorkloadChart";
import { WeekHoursInput } from "./WeekHoursInput";

export default async function AdminDashboard() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    include: {
      academicYears: {
        include: { assessments: { select: { type: true } } },
        orderBy: { yearLabel: "asc" },
      },
    },
    orderBy: { code: "asc" },
  });

  const hoursRecords = await prisma.weeklyHour.findMany({
    orderBy: [{ academicYear: "asc" }, { semester: "asc" }],
  });

  // Calculate stats
  const allYearSemesters = courses.flatMap((c) =>
    c.academicYears.map((y) => ({ code: c.code, year: y.yearLabel, sem: y.semester }))
  );
  const uniqueYearSems = [
    ...new Map(
      allYearSemesters.map((x) => [`${x.year}|${x.sem}`, x])
    ).values(),
  ].sort((a, b) => a.year.localeCompare(b.year) || a.sem.localeCompare(b.sem));

  // Repeated courses: taught in more than 1 academic year
  const courseYearCounts: Record<string, number> = {};
  for (const ys of allYearSemesters) {
    courseYearCounts[ys.code] = (courseYearCounts[ys.code] || 0) + 1;
  }
  const repeatedCourses = Object.entries(courseYearCounts).filter(
    ([, c]) => c > 1
  );

  // Hours chart data
  const semColors: Record<string, string> = {
    "Semester 1": "rgb(59,130,246)",
    "Semester 2": "rgb(16,185,129)",
    "Summer Term": "rgb(245,158,11)",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-5 mb-10">
        <Link href="/admin/upload" className="p-4 bg-white border rounded-xl hover:shadow-md hover:border-blue-300 transition">
          <h3 className="font-semibold text-sm mb-1">Upload Grades</h3>
          <p className="text-xs text-gray-500">Parse .ods files</p>
        </Link>
        <Link href="/admin/courses" className="p-4 bg-white border rounded-xl hover:shadow-md hover:border-blue-300 transition">
          <h3 className="font-semibold text-sm mb-1">Courses</h3>
          <p className="text-xs text-gray-500">Add/remove</p>
        </Link>
        <Link href="/admin/files" className="p-4 bg-white border rounded-xl hover:shadow-md hover:border-blue-300 transition">
          <h3 className="font-semibold text-sm mb-1">Files</h3>
          <p className="text-xs text-gray-500">Upload exams</p>
        </Link>
        <Link href="/admin/notes" className="p-4 bg-white border rounded-xl hover:shadow-md hover:border-blue-300 transition">
          <h3 className="font-semibold text-sm mb-1">Notes</h3>
          <p className="text-xs text-gray-500">Changes</p>
        </Link>
        <Link href="/admin/manpower" className="p-4 bg-white border rounded-xl hover:shadow-md hover:border-blue-300 transition border-l-4 border-l-hkbu-gold">
          <h3 className="font-semibold text-sm mb-1">TA Manpower</h3>
          <p className="text-xs text-gray-500">TA assignments</p>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Active Courses</p>
          <p className="text-2xl font-bold text-hkbu-navy">{courses.length}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {courses.map((c) => (
              <span key={c.code} className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                {c.code}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Repeated Courses</p>
          <p className="text-2xl font-bold text-hkbu-navy">{repeatedCourses.length}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {repeatedCourses.map(([code, c]) => (
              <span key={code} className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                {code} ×{c}
              </span>
            ))}
            {repeatedCourses.length === 0 && (
              <span className="text-xs text-gray-400">No repeated courses yet</span>
            )}
          </div>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Teaching Semesters</p>
          <p className="text-2xl font-bold text-hkbu-navy">{uniqueYearSems.length}</p>
          <div className="mt-2 space-y-0.5">
            {uniqueYearSems.slice(-4).map((ys, i) => (
              <div key={i} className="text-xs text-gray-600">
                {ys.year.split("-")[0]} {ys.sem}
              </div>
            ))}
            {uniqueYearSems.length > 4 && (
              <div className="text-xs text-gray-400">+{uniqueYearSems.length - 4} more</div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Hours + Chart */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold text-sm text-gray-700 mb-4">
            Weekly Work Hours
          </h3>
          <WeekHoursInput
            existingHours={hoursRecords.map((h) => ({
              year: h.academicYear,
              sem: h.semester,
              hours: h.hours,
            }))}
          />
        </div>
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold text-sm text-gray-700 mb-4">
            Hours Trend
          </h3>
          <WorkloadChart records={hoursRecords.map((h) => ({
            year: h.academicYear.split("-")[0],
            fullYear: h.academicYear,
            semester: h.semester,
            hours: h.hours,
          }))} />
        </div>
      </div>

      {/* Teaching record per year/semester */}
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold text-sm text-gray-700 mb-4">
          Teaching Record
        </h3>
        {uniqueYearSems.length === 0 ? (
          <p className="text-sm text-gray-400">No teaching record yet. Upload grades to populate.</p>
        ) : (
          <div className="grid gap-2">
            {uniqueYearSems.map((ys, i) => {
              const h = hoursRecords.find(
                (r) => r.academicYear === ys.year && r.semester === ys.sem
              );
              return (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700">
                      {ys.year.split("-")[0]} {ys.sem.replace("Semester ", "S")}
                    </span>
                    <span className="text-gray-500">
                      {ys.code}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {h ? `${h.hours}h/week` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
