"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { SEMESTERS } from "@/lib/constants";

interface ManpowerRecord { id: string; title: string; academicYear: string; semester: string; fileUrl: string; fileSize: number; createdAt: string; }
interface DetailRecord { id: string; manpowerId: string; courseCode: string; weeklyHours: number; duties: string | null; skills: string | null; }

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

  // Detail input state
  const [details, setDetails] = useState<Record<string, DetailRecord[]>>({});
  const [expandedManpower, setExpandedManpower] = useState<string | null>(null);
  const [detailCode, setDetailCode] = useState("");
  const [detailHours, setDetailHours] = useState("");
  const [detailDuties, setDetailDuties] = useState("");
  const [detailSkills, setDetailSkills] = useState("");

  const TA_NAME = "Wu Ruize";

  useEffect(() => { fetchRecords(); }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const res = await fetch("/api/manpower");
    const data: ManpowerRecord[] = await res.json();
    setRecords(data);
    // Fetch details for all
    const allDetails: Record<string, DetailRecord[]> = {};
    await Promise.all(data.map(async (r) => {
      const dr = await fetch(`/api/manpower/${r.id}/details`);
      allDetails[r.id] = await dr.json();
    }));
    setDetails(allDetails);
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { setMessage("Please select a file"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", title || selectedFile.name);
      formData.append("academicYear", yearLabel);
      formData.append("semester", semester);
      const res = await fetch("/api/manpower", { method: "POST", body: formData });
      if (res.ok) {
        setMessage("Uploaded!"); setSelectedFile(null); setTitle("");
        if (fileRef.current) fileRef.current.value = "";
        fetchRecords();
      } else { const d = await res.json(); setMessage(d.error || "Failed"); }
    } catch { setMessage("Network error"); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/manpower/${id}`, { method: "DELETE" });
    fetchRecords();
  };

  const handleAddDetail = async (manpowerId: string) => {
    if (!detailCode.trim()) return;
    await fetch(`/api/manpower/${manpowerId}/details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseCode: detailCode.toUpperCase(),
        weeklyHours: parseFloat(detailHours) || 0,
        duties: detailDuties,
        skills: detailSkills,
      }),
    });
    setDetailCode(""); setDetailHours(""); setDetailDuties(""); setDetailSkills("");
    fetchRecords();
  };

  const handleDeleteDetail = async (manpowerId: string, courseCode: string) => {
    await fetch(`/api/manpower/${manpowerId}/details?courseCode=${courseCode}`, { method: "DELETE" });
    fetchRecords();
  };

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
        <span className="text-xs text-gray-400 ml-auto">TA: {TA_NAME}</span>
      </div>

      <form onSubmit={handleUpload} className="bg-white border rounded-xl p-5 mb-8 space-y-3">
        <h2 className="font-semibold text-sm">Upload Manpower File</h2>
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
              placeholder="e.g. TA Assignment Sheet" className="w-full px-2 py-1.5 border rounded text-xs" />
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

      {Object.keys(grouped).sort().reverse().map((year) => (
        <div key={year} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span className="inline-block w-1.5 h-4 bg-hkbu-navy rounded-full" />{year}
          </h3>
          <div className="space-y-3">
            {grouped[year].map((r) => {
              const isExpanded = expandedManpower === r.id;
              const d = details[r.id] || [];
              const totalHours = d.reduce((s, dd) => s + dd.weeklyHours, 0);
              return (
                <div key={r.id} className="bg-white border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{r.semester.replace("Semester ","S").replace("Summer Term","ST")}</span>
                      <a href={r.fileUrl} target="_blank" rel="noopener" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {r.title}
                      </a>
                      {d.length > 0 && <span className="text-xs text-gray-400">{d.length} course(s) · {totalHours}h/week</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setExpandedManpower(isExpanded ? null : r.id); setDetailCode(""); setDetailHours(""); setDetailDuties(""); setDetailSkills(""); }}
                        className="text-xs text-gray-500 hover:text-blue-600">
                        {isExpanded ? "Collapse" : "Edit courses"}
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="text-red-500 text-xs hover:text-red-700">Del</button>
                    </div>
                  </div>

                  {/* Course details */}
                  {d.length > 0 && (
                    <div className="border-t px-4 py-2">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-500 border-b">
                            <th className="text-left py-1 w-20">Code</th>
                            <th className="text-left py-1 w-16">Hrs/wk</th>
                            <th className="text-left py-1">Duties</th>
                            <th className="text-left py-1">Skills</th>
                            <th className="w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {d.map((dd) => (
                            <tr key={dd.id} className="border-b last:border-0">
                              <td className="py-1 font-medium">{dd.courseCode}</td>
                              <td className="py-1">{dd.weeklyHours}h</td>
                              <td className="py-1 text-gray-500 max-w-[200px] truncate">{dd.duties || "—"}</td>
                              <td className="py-1 text-gray-500 max-w-[200px] truncate">{dd.skills || "—"}</td>
                              <td className="py-1">
                                <button onClick={() => handleDeleteDetail(r.id, dd.courseCode)} className="text-red-400 hover:text-red-600 text-[10px]">✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Add detail form */}
                  {isExpanded && (
                    <div className="border-t px-4 py-3 bg-gray-50">
                      <p className="text-xs font-medium text-gray-600 mb-2">Add Course Assignment (from {TA_NAME} row in manpower file)</p>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        <input type="text" value={detailCode} onChange={(e) => setDetailCode(e.target.value)}
                          placeholder="Course Code" className="px-2 py-1 border rounded text-xs" />
                        <input type="number" value={detailHours} onChange={(e) => setDetailHours(e.target.value)}
                          placeholder="Hours/week" className="px-2 py-1 border rounded text-xs" step="0.5" min="0" />
                        <input type="text" value={detailDuties} onChange={(e) => setDetailDuties(e.target.value)}
                          placeholder="Expected Duties" className="px-2 py-1 border rounded text-xs" />
                        <input type="text" value={detailSkills} onChange={(e) => setDetailSkills(e.target.value)}
                          placeholder="Preferred Skills" className="px-2 py-1 border rounded text-xs" />
                      </div>
                      <button onClick={() => handleAddDetail(r.id)}
                        className="px-3 py-1 bg-hkbu-navy text-white rounded text-xs hover:bg-hkbu-accent">Add</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {records.length === 0 && <div className="text-center py-12 text-gray-400">{loading ? "Loading..." : "No records yet"}</div>}
    </div>
  );
}
