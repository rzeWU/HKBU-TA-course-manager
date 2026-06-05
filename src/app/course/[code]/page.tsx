"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import ReactMarkdown from "react-markdown";
import PerformanceTrend from "@/components/charts/PerformanceTrend";

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

const ASSESSMENT_ORDER = [
  "Assignment 1",
  "Assignment 2",
  "Assignment 3",
  "Midterm",
  "Final",
];

type Tab = "trends" | "files" | "notes";

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
    (a, b) => ASSESSMENT_ORDER.indexOf(a) - ASSESSMENT_ORDER.indexOf(b)
  );

  const chartDataByType = Object.fromEntries(
    assessmentTypes.map((type) => [
      type,
      course.academicYears
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
        }),
    ])
  );

  // Group files by type
  const filesByType = Object.fromEntries(
    assessmentTypes.map((type) => [
      type,
      course.courseFiles.filter((f) => f.type === type),
    ])
  );

  // Group notes by type + year
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{course.code}</h1>
        <p className="text-gray-600 mt-1">
          Academic years:{" "}
          {course.academicYears
            .map((y) => `${y.yearLabel} ${y.semester}`)
            .join(" · ")}
        </p>
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
        <div className="space-y-6">
          {assessmentTypes.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p>No assessment data yet.</p>
              <p className="text-sm mt-1">
                Upload .ods grade files via the admin panel.
              </p>
            </div>
          ) : (
            assessmentTypes.map((type) => (
              <PerformanceTrend
                key={type}
                title={type}
                data={chartDataByType[type] || []}
              />
            ))
          )}
        </div>
      )}

      {/* FILES TAB */}
      {tab === "files" && (
        <div className="space-y-6">
          {assessmentTypes.map((type) => {
            const files = filesByType[type] || [];
            return (
              <div
                key={type}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <div className="bg-gray-50 px-4 py-3 font-medium text-gray-700">
                  {type}
                </div>
                {files.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-400 text-sm">
                    No files uploaded
                  </div>
                ) : (
                  <div className="divide-y">
                    {files.map((f) => (
                      <div
                        key={f.id}
                        className="px-4 py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {f.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {f.academicYear} · {f.semester}
                          </p>
                        </div>
                        <a
                          href={f.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {assessmentTypes.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p>No course data available yet.</p>
            </div>
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
          {assessmentTypes.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p>No course data available yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
