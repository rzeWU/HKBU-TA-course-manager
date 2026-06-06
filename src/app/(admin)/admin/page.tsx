import Link from "next/link";
import { prisma } from "@/lib/db";
import { WorkloadChart } from "./WorkloadChart";
import { WeekHoursInput } from "./WeekHoursInput";

export default async function AdminDashboard() {
  const courses = await prisma.course.findMany({ where: { isActive: true }, orderBy: { code: "asc" } });

  const academicYears = await prisma.academicYear.findMany({
    include: { course: { select: { code: true } } },
    orderBy: { yearLabel: "asc" },
  });

  const hoursRecords = await prisma.weeklyHour.findMany({
    orderBy: [{ academicYear: "asc" }, { semester: "asc" }],
  });

  const manpowerRecords = await prisma.tAManpower.findMany({
    orderBy: [{ academicYear: "desc" }, { semester: "asc" }],
  });

  // Latest semester with data (from manpower)
  const latestManpower = manpowerRecords[0];

  // Courses matching the latest manpower's year+semester
  const latestSemCourses = latestManpower
    ? academicYears
        .filter(
          (y) =>
            y.yearLabel === latestManpower.academicYear &&
            y.semester === latestManpower.semester
        )
        .map((y) => y.course.code)
    : [];

  // Teaching years: group by year, count courses per semester
  const yearGroups: Record<string, Record<string, number>> = {};
  for (const ay of academicYears) {
    if (!yearGroups[ay.yearLabel]) yearGroups[ay.yearLabel] = {};
    const short = ay.semester.replace("Semester ", "S").replace("Summer Term", "ST");
    if (!yearGroups[ay.yearLabel][short]) yearGroups[ay.yearLabel][short] = 0;
    yearGroups[ay.yearLabel][short]++;
  }
  const teachingYears = Object.entries(yearGroups)
    .sort(([a], [b]) => a.localeCompare(b));

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

      {/* Row 1: Active Courses + Teaching Years */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Active Courses - latest semester only */}
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-700">Active Courses</h3>
            {latestManpower ? (
              <span className="text-xs text-hkbu-gold font-medium">
                {latestManpower.academicYear.split("-")[0]} {latestManpower.semester.replace("Semester ", "S").replace("Summer Term", "ST")}
              </span>
            ) : (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Pending upload
              </span>
            )}
          </div>
          {!latestManpower ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
              <svg className="w-8 h-8 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xs">Upload a TA Manpower file to see courses</p>
            </div>
          ) : latestSemCourses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {latestSemCourses.map((code) => (
                <Link
                  key={code}
                  href={`/course/${code}`}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
                >
                  {code}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-4">No course schedule for this period</p>
          )}
        </div>

        {/* Teaching Years */}
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">Teaching Years</h3>
          {teachingYears.length === 0 ? (
            <p className="text-xs text-gray-400 py-4">No teaching record yet</p>
          ) : (
            <div className="space-y-2">
              {teachingYears.map(([year, sems]) => {
                const yr = year.split("-")[0];
                return (
                  <div key={year} className="text-sm flex items-center gap-2">
                    <span className="font-medium text-gray-700 w-10">{yr}</span>
                    {["S1", "S2", "ST"].map((label) => (
                      <span
                        key={label}
                        className={`px-2 py-0.5 rounded text-xs ${
                          sems[label]
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-50 text-gray-300"
                        }`}
                      >
                        {label}
                        {sems[label] ? `(${sems[label]})` : "(0)"}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Hours + Chart */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">
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
          <h3 className="font-semibold text-sm text-gray-700 mb-3">
            Avg Weekly Hours
          </h3>
          <WorkloadChart
            records={hoursRecords.map((h) => ({
              year: h.academicYear.split("-")[0],
              fullYear: h.academicYear,
              semester: h.semester,
              hours: h.hours,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
