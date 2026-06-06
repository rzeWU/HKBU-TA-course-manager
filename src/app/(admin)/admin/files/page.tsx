"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ASSESSMENT_TYPES, FILE_KINDS, SEMESTERS } from "@/lib/constants";

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
  const [courses, setCourses] = useState<string[]>([]);
  const [course, setCourse] = useState("");
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [yearLabel, setYearLabel] = useState("2025-2026");
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [type, setType] = useState<string>(ASSESSMENT_TYPES[0]);
  const [fileKind, setFileKind] = useState(FILE_KINDS[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/courses").then(r => r.json()).then((data: Array<{ code: string }>) => {
      const codes = data.map(c => c.code);
      setCourses(codes);
      if (codes.length > 0 && !course) setCourse(codes[0]);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (course) fetchFiles();
  }, [course]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFiles = async () => {
    setLoading(true);
    const res = await fetch(`/api/courses/${course}/files`);
    setFiles(await res.json());
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { setMessage("Please select a file"); return; }
    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", type);
      formData.append("academicYear", yearLabel);
      formData.append("semester", semester);
      formData.append("fileKind", fileKind);

      const res = await fetch(`/api/courses/${course}/files/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setMessage(`Uploaded: ${selectedFile.name}`);
        setSelectedFile(null);
        if (fileRef.current) fileRef.current.value = "";
        fetchFiles();
      } else {
        const d = await res.json();
        setMessage(d.error || "Upload failed");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/courses/${course}/files/${id}`, { method: "DELETE" });
    fetchFiles();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition">← Back</Link>
        <h1 className="text-2xl font-bold">Manage Files</h1>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium mr-2">Course:</label>
        <select value={course} onChange={(e) => setCourse(e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm">
          {courses.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <form onSubmit={handleUpload} className="bg-white border rounded-xl p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-sm">Upload File</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          {message && (
            <span className={`text-xs ${message.includes("error") || message.includes("Failed") ? "text-red-500" : "text-green-600"}`}>
              {message}
            </span>
          )}
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
              <th className="text-left px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.id} className="border-b last:border-0">
                <td className="px-3 py-2 font-medium">
                  <a href={f.fileUrl} target="_blank" rel="noopener" className="text-blue-600 hover:underline">{f.name}</a>
                </td>
                <td className="px-3 py-2 text-gray-600">{f.type}</td>
                <td className="px-3 py-2 text-gray-600">{f.academicYear}</td>
                <td className="px-3 py-2 text-gray-600">{f.semester}</td>
                <td className="px-3 py-2"><span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{f.fileKind}</span></td>
                <td className="px-3 py-2">
                  <button onClick={() => handleDelete(f.id)} className="text-red-500 text-xs hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
            {files.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-400">{loading ? "Loading..." : "No files"}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
