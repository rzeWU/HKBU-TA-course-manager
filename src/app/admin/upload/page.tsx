"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { parseOdsFile } from "@/lib/ods-parser";
import type { ParsedOdsData } from "@/lib/types";

const ASSESSMENT_TYPES = [
  "Assignment 1",
  "Assignment 2",
  "Assignment 3",
  "Midterm",
  "Final",
];

const SEMESTERS = ["Semester 1", "Semester 2"];

const COURSES = ["ECON7880", "ECON3105"];

export default function AdminUploadPage() {
  const [course, setCourse] = useState(COURSES[0]);
  const [yearLabel, setYearLabel] = useState("2025-2026");
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [type, setType] = useState(ASSESSMENT_TYPES[0]);
  const [parsedData, setParsedData] = useState<ParsedOdsData | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError("");
    setSuccess("");
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const data = parseOdsFile(buffer);
        setParsedData(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to parse file";
        setError(message);
        setParsedData(null);
      }
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/vnd.oasis.opendocument.spreadsheet": [".ods"] },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!parsedData) return;
    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/courses/${course}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: yearLabel,
          semester,
          type,
          totalPoints: 100,
          students: parsedData.students,
          summaryStats: parsedData.summaryStats,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      setSuccess(
        `Uploaded ${parsedData.summaryStats.studentCount} students for ${course} ${type} (${yearLabel} ${semester})`
      );
      setParsedData(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">Upload Grade Data</h1>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course
          </label>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            {COURSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year
          </label>
          <input
            type="text"
            value={yearLabel}
            onChange={(e) => setYearLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="2025-2026"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semester
          </label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assessment Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            {ASSESSMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-500">
          {isDragActive
            ? "Drop the .ods file here..."
            : "Drag & drop an .ods grade file here, or click to browse"}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Supports LibreOffice / OpenOffice .ods format
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Preview */}
      {parsedData && (
        <div className="mt-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Preview</h2>

            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {parsedData.summaryStats.studentCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">Students</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {parsedData.summaryStats.mean.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Mean</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {parsedData.summaryStats.median.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Median</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {parsedData.summaryStats.max.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Max</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {parsedData.summaryStats.min.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Min</p>
              </div>
            </div>

            {/* Column headers preview */}
            <p className="text-sm font-medium text-gray-700 mb-2">
              Detected {parsedData.students[0] ? Object.keys(parsedData.students[0].subScores).length : 0} question columns
            </p>
            <div className="overflow-x-auto text-xs border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left">#</th>
                    <th className="px-2 py-1 text-left">Surname</th>
                    <th className="px-2 py-1 text-left">First Name</th>
                    <th className="px-2 py-1 text-left">ID</th>
                    {parsedData.students[0] &&
                      Object.keys(parsedData.students[0].subScores).map(
                        (key) => (
                          <th key={key} className="px-2 py-1 text-left">
                            {key}
                          </th>
                        )
                      )}
                    <th className="px-2 py-1 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.students.slice(0, 5).map((s, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-1">{i + 1}</td>
                      <td className="px-2 py-1">{s.surname}</td>
                      <td className="px-2 py-1">{s.firstName}</td>
                      <td className="px-2 py-1">{s.studentId}</td>
                      {Object.values(s.subScores).map((v, j) => (
                        <td key={j} className="px-2 py-1">
                          {v}
                        </td>
                      ))}
                      <td className="px-2 py-1 font-medium">
                        {s.totalScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedData.students.length > 5 && (
              <p className="text-xs text-gray-400 mt-2">
                + {parsedData.students.length - 5} more students
              </p>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
            >
              {uploading
                ? "Uploading..."
                : `Confirm Upload — ${parsedData.summaryStats.studentCount} students`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
