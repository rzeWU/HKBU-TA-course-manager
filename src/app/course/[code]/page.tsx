"use client";

import { useState, useEffect, useCallback } from "react";
import { use } from "react";
import ReactMarkdown from "react-markdown";
import PerformanceTrend from "@/components/charts/PerformanceTrend";
import ScoreDistribution from "@/components/charts/ScoreDistribution";
import { ASSESSMENT_ORDER, FILE_KINDS } from "@/lib/constants";

interface Assessment {
  type: string;
  meanScore: number;
  medianScore: number;
  maxScore: number;
  minScore: number;
  studentCount: number;
  totalPoints: number;
}

interface AcademicYear {
  yearLabel: string;
  semester: string;
  assessments: Assessment[];
}

interface Note {
  id: string;
  assessmentType: string;
  academicYear: string;
  content: string;
  updatedAt: string;
}

interface FileRecord {
  id: string;
  name: string;
  type: string;
  academicYear: string;
  semester: string;
  fileKind: string;
  fileUrl: string;
  fileSize: number;
}

interface CourseData {
  id: string;
  code: string;
  name: string;
  academicYears: AcademicYear[];
  notes: Note[];
  courseFiles: FileRecord[];
}

interface AssessmentPoint {
  type: string;
  yearLabel: string;
  semester: string;
  meanScore: number;
  medianScore: number;
  maxScore: number;
  minScore: number;
  studentCount: number;
  totalPoints: number;
}

function getAssessmentOrder(type: string): number {
  return ASSESSMENT_ORDER[type] ?? Object.keys(ASSESSMENT_ORDER).length + type.length;
}

type Tab = "trends" | "files" | "notes";
type Metric = "mean" | "median";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const [tab, setTab] = useState<Tab>("trends");
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Interactive state
  const [metric, setMetric] = useState<Metric>("mean");
  const [selectedPoint, setSelectedPoint] = useState<AssessmentPoint | null>(null);
  const [distributionData, setDistributionData] = useState<
    Record<string, number[]>
  >({});

  useEffect(() => {
    fetch(`/api/courses/${code}`)
      .then((r) => {
        if (!r.ok) throw new Error("Course not found");
        return r.json();
      })
      .then((data) => setCourse(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [code]);

  // Fetch distribution data when course loads or assessment types are known
  useEffect(() => {
    if (!course) return;
    const types = [
      ...new Set(
        course.academicYears.flatMap((y) => y.assessments.map((a) => a.type))
      ),
    ];

    // Fetch distribution for all types, keyed by "type||yearLabel||semester"
    Promise.all(
      types.map((type) =>
        fetch(`/api/courses/${code}/distribution?type=${encodeURIComponent(type)}`)
          .then((r) => r.json())
          .then((data: Record<string, number[]>) => {
            const prefixed: Record<string, number[]> = {};
            for (const [k, v] of Object.entries(data)) {
              prefixed[`${type}||${k}`] = v;
            }
            return prefixed;
          })
      )
    ).then((results) => {
      const merged: Record<string, number[]> = {};
      for (const d of results) {
        Object.assign(merged, d);
      }
      setDistributionData(merged);
    });
  }, [course, code]);

  const [selectedFileYear, setSelectedFileYear] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const handleSelect = useCallback(
    (point: AssessmentPoint | null) => {
      setSelectedPoint(point);
    },
    []
  );

  // Re-fetch when switching tabs
  useEffect(() => {
    if (!course || tab !== "files") return;
    fetch(`/api/courses/${code}`)
      .then((r) => r.json())
      .then((data) => setCourse(data))
      .catch(() => {});
  }, [tab, code]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 mb-4">{error || "Course not found"}</p>
      </div>
    );
  }

  // Transform data for charts
  const assessmentTypes = [
    ...new Set(
      course.academicYears.flatMap((y) => y.assessments.map((a) => a.type))
    ),
  ].sort(
    (a, b) => getAssessmentOrder(a) - getAssessmentOrder(b)
  );

  // Available academic years from course data (for file tab year selector)
  const courseYears = [
    ...new Set(course.academicYears.map((y) => y.yearLabel)),
  ].sort().reverse();
  // Use shared file kind constants
  const ALL_FILE_KINDS = FILE_KINDS;

  const chartDataByType: Record<string, AssessmentPoint[]> = {};
  for (const type of assessmentTypes) {
    chartDataByType[type] = course.academicYears
      .filter((y) => y.assessments.some((a) => a.type === type))
      .map((y) => {
        const a = y.assessments.find((a) => a.type === type)!;
        return {
          type,
          yearLabel: y.yearLabel,
          semester: y.semester,
          meanScore: a.meanScore,
          medianScore: a.medianScore,
          maxScore: a.maxScore,
          minScore: a.minScore,
          studentCount: a.studentCount,
          totalPoints: a.totalPoints,
        };
      });
  }

  const filesByType = Object.fromEntries(
    assessmentTypes.map((type) => [
      type,
      course.courseFiles.filter((f) => f.type === type),
    ])
  );

  const notesByTypeAndYear = Object.fromEntries(
    assessmentTypes.map((type) => [
      type,
      course.notes
        .filter((n) => n.assessmentType === type)
        .sort((a, b) => a.academicYear.localeCompare(b.academicYear)),
    ])
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "trends", label: "Performance Trends" },
    { key: "files", label: "Downloadable Files" },
    { key: "notes", label: "Assignment Notes" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{course.code}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === t.key
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TRENDS TAB */}
      {tab === "trends" && (
        <div className="space-y-8">
          {assessmentTypes.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p>No assessment data yet.</p>
              <p className="text-sm mt-1">
                Upload .ods grade files via the admin panel.
              </p>
            </div>
          ) : (
            <>
              {/* Metric toggle */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">
                  Show:
                </span>
                <button
                  onClick={() => setMetric("mean")}
                  className={`px-3 py-1.5 text-sm rounded-lg transition ${
                    metric === "mean"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300 text-gray-600"
                  }`}
                >
                  Mean (μ)
                </button>
                <button
                  onClick={() => setMetric("median")}
                  className={`px-3 py-1.5 text-sm rounded-lg transition ${
                    metric === "median"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300 text-gray-600"
                  }`}
                >
                  Median (m)
                </button>
              </div>

              {assessmentTypes.map((type) => {
                const typeKey =
                  selectedPoint && selectedPoint.type === type
                    ? `${type}||${selectedPoint.yearLabel} | ${selectedPoint.semester}`
                    : null;
                const typeDistData = distributionData || {};
                const distScores = typeKey ? typeDistData[typeKey] : null;

                return (
                  <div
                    key={type}
                    className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4"
                  >
                    <PerformanceTrend
                      title={type}
                      data={chartDataByType[type] || []}
                      metric={metric}
                      selectedPoint={
                        selectedPoint && selectedPoint.type === type
                          ? selectedPoint
                          : null
                      }
                      onSelect={handleSelect}
                    />
                    <ScoreDistribution
                      scores={distScores ?? null}
                      selectedPoint={
                        selectedPoint && selectedPoint.type === type
                          ? {
                              yearLabel: selectedPoint.yearLabel,
                              semester: selectedPoint.semester,
                              meanScore: selectedPoint.meanScore,
                              medianScore: selectedPoint.medianScore,
                              studentCount: selectedPoint.studentCount,
                            }
                          : null
                      }
                    />
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* FILES TAB */}
      {tab === "files" && (
        <div className="space-y-8">
          {assessmentTypes.map((type) => {
            const typeFiles = filesByType[type] || [];
            const years = courseYears.length > 0 ? courseYears : [];

            if (years.length === 0) {
              return (
                <div
                  key={type}
                  className="bg-white border rounded-xl p-6 text-center text-gray-400 text-sm"
                >
                  <span className="font-medium text-gray-600">{type}</span>
                  <p className="mt-1">No academic years available</p>
                </div>
              );
            }

            const activeYear =
              years.includes(selectedFileYear || "")
                ? selectedFileYear
                : years[0];

            const yearFiles = typeFiles.filter(
              (f) => f.academicYear === activeYear
            );

            return (
              <div key={type}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-semibold text-gray-800">{type}</h3>
                  <div className="flex gap-1">
                    {years.map((y) => (
                      <button
                        key={y}
                        onClick={() => setSelectedFileYear(y)}
                        className={`px-3 py-1 text-xs rounded-full transition ${
                          activeYear === y
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {y.split("-")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-28">
                          Semester
                        </th>
                        {ALL_FILE_KINDS.map((k) => (
                          <th
                            key={k}
                            className="text-left px-4 py-2.5 font-medium text-gray-600"
                          >
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {["Semester 1", "Semester 2"].map((sem) => (
                        <tr key={sem} className="border-b last:border-0">
                          <td className="px-4 py-3 font-medium text-gray-700">
                            {sem.replace("Semester ", "S")}
                          </td>
                          {ALL_FILE_KINDS.map((kind) => {
                            const file = yearFiles.find(
                              (f) =>
                                f.semester === sem && f.fileKind === kind
                            );
                            return (
                              <td key={kind} className="px-4 py-3">
                                {file ? (
                                  <a
                                    href={file.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
                                  >
                                    <svg
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                    Download
                                  </a>
                                ) : (
                                  <span className="text-gray-300 text-xs">
                                    —
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          {assessmentTypes.length === 0 && (
            <div className="text-center py-20 text-gray-400">No courses</div>
          )}
        </div>
      )}

      {/* NOTES TAB */}
      {tab === "notes" && (
        <div className="space-y-6">
          {assessmentTypes.map((type) => {
            const notes = notesByTypeAndYear[type] || [];
            return (
              <div
                key={type}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <div className="bg-gray-50 px-4 py-3 font-medium text-gray-700">
                  {type}
                </div>
                {notes.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-400 text-sm">
                    No notes for this assessment
                  </div>
                ) : (
                  <div className="divide-y">
                    {notes.map((note) => (
                      <div key={note.id} className="px-4 py-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            {note.academicYear}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-700">
                          <ReactMarkdown>{note.content}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
