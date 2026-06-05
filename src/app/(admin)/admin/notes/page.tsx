"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const COURSES = ["ECON7880", "ECON3105"];
const ASSESSMENT_TYPES = [
  "Assignment 1", "Assignment 2", "Assignment 3", "Midterm", "Final",
];

interface NoteRecord {
  id: string;
  assessmentType: string;
  academicYear: string;
  content: string;
  updatedAt: string;
}

export default function AdminNotesPage() {
  const [course, setCourse] = useState(COURSES[0]);
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [assessmentType, setAssessmentType] = useState(ASSESSMENT_TYPES[0]);
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchNotes();
  }, [course]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchNotes = async () => {
    setLoading(true);
    const res = await fetch(`/api/courses/${course}/notes`);
    const data = await res.json();
    setNotes(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!content.trim()) {
      setMessage("Content cannot be empty");
      return;
    }

    const res = await fetch(`/api/courses/${course}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessmentType, academicYear, content }),
    });

    if (res.ok) {
      setMessage("Note saved");
      setContent("");
      fetchNotes();
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to save note");
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/courses/${course}/notes/${id}`, { method: "DELETE" });
    fetchNotes();
  };

  const handleEdit = (note: NoteRecord) => {
    setAssessmentType(note.assessmentType);
    setAcademicYear(note.academicYear);
    setContent(note.content);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition">← Back</Link>
        <h1 className="text-2xl font-bold">Manage Notes</h1>
      </div>

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

      {/* Add/Edit form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold mb-4">Add / Edit Note</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Assessment Type
              </label>
              <select
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {ASSESSMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="2025-2026"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Content (Markdown supported)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Describe what changed and why..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Save Note
          </button>
          {message && (
            <p className={`text-sm ${message.includes("error") ? "text-red-500" : "text-green-600"}`}>
              {message}
            </p>
          )}
        </form>
      </div>

      {/* Notes list */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-start"
          >
            <div>
              <div className="flex gap-2 items-center mb-2">
                <span className="text-sm font-medium text-blue-700">
                  {note.assessmentType}
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-sm text-gray-500">
                  {note.academicYear}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                {note.content}
              </p>
            </div>
            <div className="flex gap-2 ml-4 shrink-0">
              <button
                onClick={() => handleEdit(note)}
                className="text-blue-500 hover:text-blue-700 text-xs"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(note.id)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="text-center py-8 text-gray-400">
            {loading ? "Loading..." : "No notes yet"}
          </p>
        )}
      </div>
    </div>
  );
}
