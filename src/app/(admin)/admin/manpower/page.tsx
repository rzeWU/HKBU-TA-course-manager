"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { SEMESTERS } from "@/lib/constants";

interface ManpowerRecord {
  id: string;
  title: string;
  academicYear: string;
  semester: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

export default function AdminManpowerPage() {
  const [records, setRecords] = useState<ManpowerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [yearLabel, setYearLabel] = useState("2025-2026");
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchRecords(); }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const res = await fetch("/api/manpower");
    setRecords(await res.json());
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
      formData.append("title", title || selectedFile.name);
      formData.append("academicYear", yearLabel);
      formData.append("semester", semester);

      const res = await fetch("/api/manpower", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setMessage("Uploaded!");
        setSelectedFile(null);
        setTitle("");
        if (fileRef.current) fileRef.current.value = "";
        fetchRecords();
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
    await fetch(`/api/manpower/${id}`, { method: "DELETE" });
    fetchRecords();
  };

  // Group by year
  const grouped: Record<string, ManpowerRecord[]> = {};
  for (const r of records) {
    if (!grouped[r.academicYear]) grouped[r.academicYear] = [];
    grouped[r.academicYear].push(r);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition">← Back</Link>
        <h1 className="text-2xl font-bold">TA Manpower Assignment</h1>
      </div>

      <form onSubmit={handleUpload} className="bg-white border rounded-xl p-5 mb-8 space-y-3">
        <h2 className="font-semibold text-sm">Upload Manpower Record</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600">Academic Year</label>
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
            <label className="text-xs text-gray-600">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2025 S1 TA Assignment" className="w-full px-2 py-1.5 border rounded text-xs" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          <button type="submit" disabled={!selectedFile || uploading}
            className="px-4 py-1.5 bg-hkbu-navy text-white rounded text-sm hover:bg-hkbu-accent disabled:opacity-50">
            {uploading ? "Uploading..." : "Upload"}
          </button>
          {message && <span className={`text-xs ${message.includes("error")||message.includes("Failed")?"text-red-500":"text-green-600"}`}>{message}</span>}
        </div>
      </form>

      {/* Records grouped by year */}
      {Object.keys(grouped).sort().reverse().map((year) => (
        <div key={year} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span className="inline-block w-1.5 h-4 bg-hkbu-navy rounded-full" />
            {year}
          </h3>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2">Title</th>
                  <th className="text-left px-4 py-2">Semester</th>
                  <th className="text-left px-4 py-2">File</th>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {grouped[year].map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{r.title}</td>
                    <td className="px-4 py-2">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{r.semester}</span>
                    </td>
                    <td className="px-4 py-2">
                      <a href={r.fileUrl} target="_blank" rel="noopener"
                        className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </a>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => handleDelete(r.id)} className="text-red-500 text-xs hover:text-red-700">Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {records.length === 0 && (
        <div className="text-center py-12 text-gray-400">{loading ? "Loading..." : "No records yet"}</div>
      )}
    </div>
  );
}
