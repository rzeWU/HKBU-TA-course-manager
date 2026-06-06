"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface WorkloadRecord {
  year: string;
  fullYear: string;
  semester: string;
  hours: number;
}

const SEM_COLORS: Record<string, string> = {
  "Semester 1": "rgb(59, 130, 246)",
  "Semester 2": "rgb(16, 185, 129)",
  "Summer Term": "rgb(245, 158, 11)",
};

export function WorkloadChart({ records }: { records: WorkloadRecord[] }) {
  if (records.length === 0) {
    return <p className="text-sm text-gray-400 h-48 flex items-center justify-center">No hours data</p>;
  }

  const semesters = [...new Set(records.map((r) => r.semester))].sort();
  const years = [...new Set(records.map((r) => r.year))].sort();

  const lookup: Record<string, Record<string, number>> = {};
  for (const r of records) {
    if (!lookup[r.year]) lookup[r.year] = {};
    lookup[r.year][r.semester] = r.hours;
  }

  const datasets = semesters.map((sem) => ({
    label: sem.replace("Semester ", "S"),
    data: years.map((y) => lookup[y]?.[sem] ?? null),
    borderColor: SEM_COLORS[sem] || "#888",
    backgroundColor: "transparent",
    borderWidth: 2.5,
    pointRadius: 5,
    pointHoverRadius: 7,
    tension: 0.3,
    spanGaps: false,
  }));

  const maxH = Math.max(...records.map((r) => r.hours), 1);

  return (
    <div className="h-48">
      <Line
        data={{ labels: years, datasets }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { boxWidth: 10, font: { size: 10 } } },
            tooltip: {
              callbacks: {
                label: (ctx: TooltipItem<"line">) =>
                  ctx.raw !== null ? `${ctx.dataset.label}: ${ctx.raw}h/week` : "No data",
              },
            },
          },
          scales: {
            y: { beginAtZero: true, max: Math.ceil(maxH * 1.2), ticks: { font: { size: 10 } } },
            x: { ticks: { font: { size: 10 } } },
          },
        }}
      />
    </div>
  );
}
