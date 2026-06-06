"use client";

import { useState } from "react";
import { SEMESTERS } from "@/lib/constants";

interface HourEntry {
  year: string;
  sem: string;
  hours: number;
}

export function WeekHoursInput({ existingHours }: { existingHours: HourEntry[] }) {
  const [yearLabel, setYearLabel] = useState("2025-2026");
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [hours, setHours] = useState("");
  const [message, setMessage] = useState("");
  const [data, setData] = useState<HourEntry[]>(existingHours);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(hours);
    if (isNaN(h) || h < 0) { setMessage("Enter valid hours"); return; }

    const res = await fetch("/api/hours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ academicYear: yearLabel, semester, hours: h }),
    });

    if (res.ok) {
      setMessage("Saved!");
      setHours("");
      const updated = data.filter(
        (d) => !(d.year === yearLabel && d.sem === semester)
      );
      updated.push({ year: yearLabel, sem: semester, hours: h });
      setData(updated.sort((a, b) => a.year.localeCompare(b.year) || a.sem.localeCompare(b.sem)));
    } else {
      setMessage("Failed");
    }
  };

  return (
    <div>
      <form onSubmit={handleSave} className="flex gap-2 mb-4">
        <input type="text" value={yearLabel} onChange={(e) => setYearLabel(e.target.value)}
          className="w-24 px-2 py-1 border rounded text-xs" placeholder="Year" />
        <select value={semester} onChange={(e) => setSemester(e.target.value)}
          className="px-2 py-1 border rounded text-xs">
          {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="number" value={hours} onChange={(e) => setHours(e.target.value)}
          className="w-16 px-2 py-1 border rounded text-xs" placeholder="h" step="0.5" min="0" />
        <button type="submit" className="px-3 py-1 bg-hkbu-navy text-white rounded text-xs hover:bg-hkbu-accent">
          Save
        </button>
        {message && <span className={`text-xs ${message === "Saved!" ? "text-green-600" : "text-red-500"}`}>{message}</span>}
      </form>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {data
          .sort((a, b) => b.year.localeCompare(a.year) || b.sem.localeCompare(a.sem))
          .map((d, i) => (
            <div key={i} className="flex justify-between text-xs py-1 px-2 bg-gray-50 rounded">
              <span>{d.year.split("-")[0]} {d.sem.replace("Semester ", "S")}</span>
              <span className="font-medium text-hkbu-navy">{d.hours}h/week</span>
            </div>
          ))}
        {data.length === 0 && <p className="text-xs text-gray-400">No hours recorded yet</p>}
      </div>
    </div>
  );
}
