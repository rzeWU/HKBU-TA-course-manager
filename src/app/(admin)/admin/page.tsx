import Link from "next/link";
import { prisma } from "@/lib/db";
import { DashboardCharts } from "./DashboardCharts";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const manpowerRecords = await prisma.tAManpower.findMany({
    include: { details: true },
    orderBy: [{ academicYear: "desc" }, { semester: "asc" }],
  });

  const courses = await prisma.course.findMany({ where: { isActive: true }, orderBy: { code: "asc" } });

  // Group manpower by year+semester
  const yearSems: Array<{ year: string; fullYear: string; sem: string; hasManpower: boolean; details: typeof manpowerRecords[0]["details"] }> = [];
  const seen = new Set<string>();
  for (const m of manpowerRecords) {
    const key = `${m.academicYear}|${m.semester}`;
    if (!seen.has(key)) {
      seen.add(key);
      yearSems.push({
        year: m.academicYear.split("-")[0],
        fullYear: m.academicYear,
        sem: m.semester,
        hasManpower: true,
        details: m.details,
      });
    }
  }
  yearSems.sort((a, b) => b.fullYear.localeCompare(a.fullYear) || a.sem.localeCompare(b.sem));

  // Already uploaded semesters
  const uploadedSems = yearSems.map((ys) => ({ year: ys.fullYear, sem: ys.sem }));

  // Teaching years
  const yearGroups: Record<string, Record<string, number>> = {};
  for (const m of manpowerRecords) {
    if (!yearGroups[m.academicYear]) yearGroups[m.academicYear] = {};
    const short = m.semester.replace("Semester ", "S").replace("Summer Term", "ST");
    yearGroups[m.academicYear][short] = m.details.length;
  }
  const teachingYears = Object.entries(yearGroups).sort(([a], [b]) => a.localeCompare(b));

  // Hours chart data
  const hoursChartData = manpowerRecords.flatMap((m) =>
    m.details.length > 0
      ? [{
          year: m.academicYear.split("-")[0],
          fullYear: m.academicYear,
          semester: m.semester,
          hours: Number((m.details.reduce((s, d) => s + d.weeklyHours, 0) / m.details.length).toFixed(1)),
        }]
      : []
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-5 mb-10">
        {[
          ["/admin/upload", "Upload Grades", "Parse .ods files"],
          ["/admin/courses", "Courses", "Add/remove"],
          ["/admin/files", "Files", "Upload exams"],
          ["/admin/notes", "Notes", "Changes"],
          ["/admin/manpower", "TA Manpower", "TA assignments"],
        ].map(([href, title, desc], i) => (
          <Link key={i} href={href}
            className={`p-4 bg-white border rounded-xl hover:shadow-md hover:border-blue-300 transition ${i === 4 ? "border-l-4 border-l-hkbu-gold" : ""}`}>
            <h3 className="font-semibold text-sm mb-1">{title}</h3>
            <p className="text-xs text-gray-500">{desc}</p>
          </Link>
        ))}
      </div>

      <DashboardCharts
        initialSems={yearSems}
        hoursData={hoursChartData}
        teachingYears={teachingYears}
      />
    </div>
  );
}
