"use client";

import { useState } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface DetailItem { id: string; courseCode: string; weeklyHours: number; duties: string | null; skills: string | null; }
interface SemData { year: string; fullYear: string; sem: string; hasManpower: boolean; details: DetailItem[]; }
interface HourPoint { year: string; fullYear: string; semester: string; hours: number; }

const SEM_COLORS: Record<string, string> = { "Semester 1": "rgb(59,130,246)", "Semester 2": "rgb(16,185,129)", "Summer Term": "rgb(245,158,11)" };
const SEM_LABELS: Record<string, string> = { "Semester 1": "S1", "Semester 2": "S2", "Summer Term": "ST" };
const ALL_SEMS = ["Semester 1", "Semester 2", "Summer Term"];

export function DashboardCharts({
  initialSems, hoursData, teachingYears,
}: {
  initialSems: SemData[];
  hoursData: HourPoint[];
  teachingYears: Array<[string, Record<string, number>]>;
}) {
  // Find latest year for default tab
  const latestYear = initialSems[0]?.fullYear || "";
  const [activeYear, setActiveYear] = useState(latestYear);
  const [activeSem, setActiveSem] = useState<string | null>(null);

  // Years with data
  const years = [...new Set(initialSems.map((s) => s.fullYear))].sort().reverse();
  const displayYear = activeYear || years[0] || "";

  // Get semester data for active year
  const yearSems = ALL_SEMS.map((sem) => {
    const found = initialSems.find((s) => s.fullYear === displayYear && s.sem === sem);
    return { sem, label: SEM_LABELS[sem] || sem, hasManpower: !!found, details: found?.details || [] };
  });

  // Default active semester
  const effectiveSem = activeSem || yearSems.find((s) => s.hasManpower)?.sem || "";
  const activeDetails = yearSems.find((s) => s.sem === effectiveSem)?.details || [];
  const totalHours = activeDetails.reduce((s, d) => s + d.weeklyHours, 0);
  const avgHours = activeDetails.length > 0 ? (totalHours / activeDetails.length).toFixed(1) : "0";

  // Hours chart
  const chartYears = [...new Set(hoursData.map((h) => h.year))].sort();
  const chartDatasets = ALL_SEMS.map((sem) => ({
    label: SEM_LABELS[sem] || sem,
    data: chartYears.map((y) => {
      const p = hoursData.find((h) => h.year === y && h.semester === sem);
      return p ? p.hours : null;
    }),
    borderColor: SEM_COLORS[sem] || "#888",
    borderWidth: 2.5, pointRadius: 5, pointHoverRadius: 7,
    tension: 0.3, spanGaps: false,
  }));

  const maxH = Math.max(...hoursData.map((h) => h.hours), 1);

  return (
    <div className="space-y-6">
      {/* Semester tabs */}
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold text-sm text-gray-700 mb-4">Active Courses</h3>
        {years.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <svg className="w-8 h-8 mb-2 mx-auto opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xs">Upload a TA Manpower file to see courses</p>
          </div>
        ) : (
          <>
            {/* Year selector */}
            <div className="flex gap-2 mb-4">
              {years.map((y) => (
                <button key={y} onClick={() => { setActiveYear(y); setActiveSem(null); }}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                    displayYear === y ? "bg-hkbu-navy text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>{y.split("-")[0]}</button>
              ))}
            </div>

            {/* S1/S2/ST tabs */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {yearSems.map((ys) => (
                <button
                  key={ys.sem}
                  onClick={() => ys.hasManpower && setActiveSem(ys.sem)}
                  disabled={!ys.hasManpower}
                  className={`p-3 rounded-lg text-sm font-medium transition text-center ${
                    ys.hasManpower && effectiveSem === ys.sem
                      ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
                      : ys.hasManpower
                      ? "bg-white border-2 border-gray-200 text-gray-600 hover:border-blue-300"
                      : "bg-gray-50 border-2 border-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <div className="text-lg font-bold">{ys.label}</div>
                  <div className="text-xs mt-0.5">
                    {ys.hasManpower ? `${ys.details.length} course(s)` : "No data"}
                  </div>
                </button>
              ))}
            </div>

            {/* Course list for active semester */}
            {activeDetails.length > 0 ? (
              <div className="space-y-2">
                {activeDetails.map((d) => (
                  <div key={d.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm text-hkbu-navy">{d.courseCode}</span>
                      <span className="text-xs text-gray-400">{d.weeklyHours}h/wk</span>
                    </div>
                    <div className="text-xs text-gray-500 max-w-[300px] truncate">
                      {d.duties || d.skills || ""}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-2">Click a semester tab to view courses</p>
            )}
          </>
        )}
      </div>

      {/* Row: Teaching Years + Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Teaching Years */}
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">Teaching Years</h3>
          {teachingYears.length === 0 ? (
            <p className="text-xs text-gray-400 py-4">No data</p>
          ) : (
            <div className="space-y-2">
              {teachingYears.map(([year, sems]) => (
                <div key={year} className="text-sm flex items-center gap-2">
                  <span className="font-medium text-gray-700 w-10">{year.split("-")[0]}</span>
                  {["S1", "S2", "ST"].map((label) => (
                    <span key={label}
                      className={`px-2 py-0.5 rounded text-xs ${
                        sems[label] ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-300"
                      }`}>{label}{sems[label] ? `(${sems[label]})` : "(0)"}</span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Analysis */}
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">
            Summary {displayYear ? `· ${displayYear.split("-")[0]}${effectiveSem ? ` ${SEM_LABELS[effectiveSem] || effectiveSem}` : ""}` : ""}
          </h3>
          {activeDetails.length === 0 ? (
            <p className="text-xs text-gray-400 py-4">Select a semester to see summary</p>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex flex-wrap gap-1">
                <span className="text-gray-500">Courses:</span>
                {activeDetails.map((d) => (
                  <span key={d.id} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">{d.courseCode}</span>
                ))}
              </div>
              <div>
                <span className="text-gray-500">Total weekly hours: </span>
                <span className="font-semibold text-hkbu-navy">{totalHours}h</span>
                <span className="text-gray-400"> (avg {avgHours}h/course)</span>
              </div>
              <div>
                <span className="text-gray-500">Workload: </span>
                <span className={`font-semibold ${totalHours > 15 ? "text-red-600" : totalHours > 10 ? "text-amber-600" : "text-green-600"}`}>
                  {totalHours > 15 ? "Heavy 🔴" : totalHours > 10 ? "Moderate 🟡" : "Light 🟢"}
                </span>
                {totalHours > 0 && (
                  <span className="text-gray-400 ml-1">
                    ({(totalHours / 40 * 100).toFixed(0)}% of full-time)
                  </span>
                )}
              </div>
              {activeDetails.some((d) => d.duties) && (
                <div>
                  <span className="text-gray-500">Key duties: </span>
                  <span className="text-gray-600 leading-relaxed">
                    {[...new Set(activeDetails.filter((d) => d.duties).map((d) => d.duties))].join("; ")}
                  </span>
                </div>
              )}
              {activeDetails.some((d) => d.skills) && (
                <div>
                  <span className="text-gray-500">Skills: </span>
                  <span className="text-gray-600 leading-relaxed">
                    {[...new Set(activeDetails.filter((d) => d.skills).map((d) => d.skills))].join("; ")}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Avg Weekly Hours Chart */}
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold text-sm text-gray-700 mb-4">Average Weekly Hours</h3>
        {hoursData.length === 0 ? (
          <p className="text-xs text-gray-400 py-4">No hours data. Add course details in TA Manpower.</p>
        ) : (
          <div className="h-56">
            <Line
              data={{ labels: chartYears, datasets: chartDatasets }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top", labels: { boxWidth: 10, font: { size: 11 } } },
                  tooltip: { callbacks: { label: (ctx: TooltipItem<"line">) => ctx.raw !== null ? `${ctx.dataset.label}: ${ctx.raw}h/wk` : "No data" } },
                },
                scales: {
                  y: { beginAtZero: true, max: Math.ceil(maxH * 1.3), ticks: { font: { size: 10 } } },
                  x: { ticks: { font: { size: 10 } } },
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
