"use client";

import { useState, useEffect } from "react";

const COURSES = ["ECON7880", "ECON3105"];
const ASSESSMENT_TYPES = [
  "Assignment 1", "Assignment 2", "Assignment 3", "Midterm", "Final",
];
const FILE_KINDS = [
  "Criteria", "Question Paper", "Grade Sheet", "Solution", "Other",
];
const SEMESTERS = ["Semester 1", "Semester 2"];

interface FileRecord {
  id: string;
  name: string;
  type: string;
  academicYear: string;
  semester: string;
  fileKind: string;
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
  const [fileKind, setFileKind] = useState(FILE_KINDS[0]);
  const [fileUrl, setFileUrl] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchFiles();
  }, [course]);

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
    if (!name || !fileUrl) { setMessage("Name and URL are required"); return; }
    const res = await fetch(`/api/courses/${course}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, academicYear: yearLabel, semester, fileKind, fileUrl, fileSize: 0 }),
    });
    if (res.ok) { setMessage("Added!"); setName(""); setFileUrl(""); fetchFiles(); }
    else { const d = await res.json(); setMessage(d.error || "Failed"); }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/courses/${course}/files/${id}`, { method: "DELETE" });
    fetchFiles();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Manage Files</h1>
      <div className="mb-4">
        <label className="text-sm font-medium mr-2">Course:</label>
        <select value={course} onChange={(e) => setCourse(e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm">
          {COURSES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <form onSubmit={handleAdd} className="bg-white border rounded-xl p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-sm">Add File</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <div>
            <label className="text-xs text-gray-600">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full px-2 py-1.5 border rounded text-xs">
              {ASSESSMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">Year</label>
            <input type="text" value={yearLabel} onChange={(e) => setYearLabel(e.target.value)}
              className="w-full px-2 py-1.5 border rounded text-xs" />
          </div>
          <div>
            <label className="text-xs text-gray-600">Semester</label>
            <select value={semester} onChange={(e) => setSemester(e.target.value)}
              className="w-full px-2 py-1.5 border rounded text-xs">
              {SEMESTERS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">Kind</label>
            <select value={fileKind} onChange={(e) => setFileKind(e.target.value)}
              className="w-full px-2 py-1.5 border rounded text-xs">
              {FILE_KINDS.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">Display Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Question Paper"
              className="w-full px-2 py-1.5 border rounded text-xs" />
          </div>
          <div>
            <label className="text-xs text-gray-600">URL</label>
            <input type="text" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-2 py-1.5 border rounded text-xs" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            Add File
          </button>
          {message && <span className={`text-xs ${message.includes("error")||message.includes("Failed")?"text-red-500":"text-green-600"}`}>{message}</span>}
        </div>
      </form>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-left px-3 py-2">Year</th>
              <th className="text-left px-3 py-2">Semester</th>
              <th className="text-left px-3 py-2">Kind</th>
              <th className="text-left px-3 py-2">URL</th>
              <th className="text-left px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.id} className="border-b last:border-0">
                <td className="px-3 py-2 font-medium">{f.name}</td>
                <td className="px-3 py-2 text-gray-600">{f.type}</td>
                <td className="px-3 py-2 text-gray-600">{f.academicYear}</td>
                <td className="px-3 py-2 text-gray-600">{f.semester}</td>
                <td className="px-3 py-2"><span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{f.fileKind}</span></td>
                <td className="px-3 py-2"><a href={f.fileUrl} target="_blank" rel="noopener" className="text-blue-600 text-xs hover:underline truncate max-w-[150px] inline-block">{f.fileUrl}</a></td>
                <td className="px-3 py-2"><button onClick={() => handleDelete(f.id)} className="text-red-500 text-xs hover:text-red-700">Del</button></td>
              </tr>
            ))}
            {files.length === 0 && <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400">{loading ? "Loading..." : "No files"}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
