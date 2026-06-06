"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { PROGRAMS } from "@/lib/programs";

interface CourseRecord {
  id: string;
  code: string;
  name: string;
  programSlug: string;
  isActive: boolean;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [programSlug, setProgramSlug] = useState(PROGRAMS[0].slug);
  const [description, setDescription] = useState("");
  const [courseUrl, setCourseUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const res = await fetch("/api/courses");
    const data = await res.json();
    setCourses(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) { setMessage("Code and name are required"); return; }
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.toUpperCase(), name, programSlug, description, courseUrl }),
    });
    if (res.ok) {
      setMessage("Course added!");
      setCode(""); setName("");
      fetchCourses();
    } else {
      const d = await res.json();
      setMessage(d.error || "Failed");
    }
  };

  const handleToggleActive = async (course: CourseRecord) => {
    await fetch("/api/courses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: course.code, isActive: !course.isActive }),
    });
    fetchCourses();
  };

  const handleSwitchProgram = async (course: CourseRecord, newSlug: string) => {
    await fetch("/api/courses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: course.code, programSlug: newSlug }),
    });
    fetchCourses();
  };

  const getProgramName = (slug: string) => PROGRAMS.find((p) => p.slug === slug)?.name || slug;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition">← Back</Link>
        <h1 className="text-2xl font-bold">Manage Courses</h1>
      </div>

      <form onSubmit={handleAdd} className="bg-white border rounded-xl p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-sm">Add Course</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600">Course Code</label>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="ECON7880" className="w-full px-2 py-1.5 border rounded text-xs" />
          </div>
          <div>
            <label className="text-xs text-gray-600">Course Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Big Data Analytics" className="w-full px-2 py-1.5 border rounded text-xs" />
          </div>
          <div>
            <label className="text-xs text-gray-600">Program</label>
            <select value={programSlug} onChange={(e) => setProgramSlug(e.target.value)}
              className="w-full px-2 py-1.5 border rounded text-xs">
              {PROGRAMS.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">Course URL</label>
            <input type="text" value={courseUrl} onChange={(e) => setCourseUrl(e.target.value)}
              placeholder="https://mscdabe.hkbu.edu.hk/..." className="w-full px-2 py-1.5 border rounded text-xs" />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-600">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief course description..." rows={2}
            className="w-full px-2 py-1.5 border rounded text-xs" />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="px-4 py-1.5 bg-hkbu-navy text-white rounded text-sm hover:bg-hkbu-accent">Add Course</button>
          {message && <span className={`text-xs ${message.includes("Failed")||message.includes("error")?"text-red-500":"text-green-600"}`}>{message}</span>}
        </div>
      </form>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-2">Code</th>
              <th className="text-left px-4 py-2">Program</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Switch</th>
              <th className="text-left px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="px-4 py-2 font-medium">{c.code}</td>
                <td className="px-4 py-2">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{getProgramName(c.programSlug)}</span>
                </td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <select
                    value={c.programSlug}
                    onChange={(e) => handleSwitchProgram(c, e.target.value)}
                    className="text-xs border rounded px-1.5 py-0.5"
                  >
                    {PROGRAMS.map((p) => (
                      <option key={p.slug} value={p.slug}>{p.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <button onClick={() => handleToggleActive(c)} className="text-xs text-gray-500 hover:text-blue-600">
                    {c.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {courses.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">{loading ? "Loading..." : "No courses"}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
