"use client";

import { useState } from "react";
import Link from "next/link";

interface Course {
  id: string; code: string; name: string; description: string | null;
  courseUrl: string | null; programSlug: string;
  academicYears: Array<{ yearLabel: string; semester: string }>;
}

const ALL_SEMS = ["Semester 1", "Semester 2", "Summer Term"];
const SEM_SHORT: Record<string, string> = { "Semester 1": "S1", "Semester 2": "S2", "Summer Term": "ST" };

export function ProgramCourses({
  courses, years, semesters,
}: {
  courses: Course[]; years: string[]; semesters: Array<{ year: string; sem: string }>;
}) {
  const [activeYear, setActiveYear] = useState(years[0] || "");
  const [activeSem, setActiveSem] = useState<string | null>(null);

  // Which semesters have data for the active year
  const yearSems = ALL_SEMS.map((sem) => {
    const has = semesters.some((s) => s.year === activeYear && s.sem === sem);
    return { sem, label: SEM_SHORT[sem] || sem, has };
  });

  // Auto-select first available semester
  const effectiveSem = activeSem || yearSems.find((s) => s.has)?.sem || "";
  const displayYear = activeYear || years[0] || "";

  // Filter courses active in selected year+semester
  const filteredCourses = courses.filter((c) =>
    c.academicYears.some((ay) => ay.yearLabel === displayYear && ay.semester === effectiveSem)
  );

  return (
    <div>
      {years.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No courses available yet</p>
          <p className="text-sm mt-2">Courses will appear once grade data is uploaded</p>
        </div>
      ) : (
        <>
          {/* Year selector */}
          <div className="flex gap-2 mb-4">
            {years.map((y) => (
              <button key={y} onClick={() => { setActiveYear(y); setActiveSem(null); }}
                className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                  activeYear === y ? "bg-hkbu-navy text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}>{y.split("-")[0]}</button>
            ))}
          </div>

          {/* Semester tabs */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {yearSems.map((ys) => (
              <button key={ys.sem} onClick={() => ys.has && setActiveSem(ys.sem)}
                disabled={!ys.has}
                className={`p-3 rounded-lg text-sm font-medium transition text-center ${
                  ys.has && effectiveSem === ys.sem
                    ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
                    : ys.has
                    ? "bg-white border-2 border-gray-200 text-gray-600 hover:border-blue-300"
                    : "bg-gray-50 border-2 border-gray-100 text-gray-300 cursor-not-allowed"
                }`}>
                <div className="text-lg font-bold">{ys.label}</div>
                <div className="text-[10px] mt-0.5">
                  {ys.has
                    ? `${courses.filter((c) => c.academicYears.some((a) => a.yearLabel === activeYear && a.semester === ys.sem)).length} course(s)`
                    : "No data"}
                </div>
              </button>
            ))}
          </div>

          {/* Course cards */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No courses active in {displayYear.split("-")[0]} {SEM_SHORT[effectiveSem] || effectiveSem}</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredCourses.map((course) => (
                <div key={course.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-hkbu-navy/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <Link href={`/course/${course.code}`}>
                      <h2 className="text-lg font-semibold text-hkbu-navy hover:text-hkbu-accent transition-colors">
                        {course.code}
                      </h2>
                    </Link>
                  </div>
                  <h3 className="text-sm font-medium text-gray-800 mb-2">{course.name}</h3>
                  {course.description ? (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">{course.description}</p>
                  ) : (
                    <p className="text-xs text-gray-400 italic mb-4">No description available</p>
                  )}
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                    <Link href={`/course/${course.code}`}
                      className="text-xs text-hkbu-accent hover:underline font-medium">View TA records →</Link>
                    {course.courseUrl && (
                      <a href={course.courseUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-hkbu-gold hover:underline font-medium">Learn More ↗</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
