"use client";

import { useState, useEffect } from "react";

const COURSES = ["ECON7880", "ECON3105"];
const ASSESSMENT_TYPES = [
  "Assignment 1", "Assignment 2", "Assignment 3", "Midterm", "Final",
];
const SEMESTERS = ["Semester 1", "Semester 2"];

interface FileRecord {
  id: string;
  name: string;
  type: string;
  academicYear: string;
  semester: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

export default function AdminFilesPage() {
  const [course, setCourse] = useState(COURSES[0]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [yearLabel, setYearLabel] = useState("2025-2026");
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [type, setType] = useState(ASSESSMENT_TYPES[0]);
  const [fileUrl, setFileUrl] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchFiles();
  }, [course]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFiles = async () => {
    setLoading(true);
    const res = await fetch(`/api/courses/${course}/files`);
    const data = await res.json();
    setFiles(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!name || !fileUrl) {
      setMessage("Name and URL are required");
      return;
    }

    const res = await fetch(`/api/courses/${course}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, academicYear: yearLabel, semester, fileUrl, fileSize: 0 }),
    });

    if (res.ok) {
      setMessage("File added");
      setName("");
      setFileUrl("");
      fetchFiles();
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to add file");
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/courses/${course}/files/${id}`, { method: "DELETE" });
    fetchFiles();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Manage Course Files</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Course
        </label>
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          {COURSES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Add file form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold mb-4">Add File</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Assignment 1 Questions"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {ASSESSMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Year
              </label>
              <input
                type="text"
                value={yearLabel}
                onChange={(e) => setYearLabel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                URL
              </label>
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Add File
          </button>
          {message && (
            <p className={`text-sm ${message.includes("error") ? "text-red-500" : "text-green-600"}`}>
              {message}
            </p>
          )}
        </form>
      </div>

      {/* File list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Year / Semester</th>
              <th className="text-left px-4 py-3">URL</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{f.name}</td>
                <td className="px-4 py-3 text-gray-600">{f.type}</td>
                <td className="px-4 py-3 text-gray-600">
                  {f.academicYear} / {f.semester}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={f.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate max-w-[200px] inline-block"
                  >
                    {f.fileUrl}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {files.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  {loading ? "Loading..." : "No files yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
