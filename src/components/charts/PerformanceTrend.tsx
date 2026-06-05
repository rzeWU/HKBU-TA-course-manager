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
  Filler,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AssessmentPoint {
  type: string;
  yearLabel: string;
  semester: string;
  meanScore: number;
  medianScore: number;
  maxScore: number;
  minScore: number;
  studentCount: number;
  totalPoints: number;
}

interface Props {
  title: string;
  data: AssessmentPoint[];
  metric: "mean" | "median";
  onHover?: (point: AssessmentPoint | null) => void;
}

const SEMESTER_COLORS: Record<string, { border: string; bg: string }> = {
  "Semester 1": { border: "rgb(59, 130, 246)", bg: "rgba(59, 130, 246, 0.1)" },
  "Semester 2": { border: "rgb(16, 185, 129)", bg: "rgba(16, 185, 129, 0.1)" },
};

export default function PerformanceTrend({ title, data, metric, onHover }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">No data available yet</p>
      </div>
    );
  }

  // Group by semester
  const semesters = [...new Set(data.map((d) => d.semester))].sort();
  // X-axis: unique year labels
  const yearLabels = [...new Set(data.map((d) => d.yearLabel))].sort();

  // Build a lookup: year -> semester -> point
  const lookup: Record<string, Record<string, AssessmentPoint>> = {};
  for (const d of data) {
    if (!lookup[d.yearLabel]) lookup[d.yearLabel] = {};
    lookup[d.yearLabel][d.semester] = d;
  }

  // For each semester, create a dataset
  const datasets = semesters.map((sem, idx) => {
    const colors =
      SEMESTER_COLORS[sem] ||
      Object.values(SEMESTER_COLORS)[idx % Object.values(SEMESTER_COLORS).length] ||
      SEMESTER_COLORS["Semester 1"];

    const values = yearLabels.map((y) => lookup[y]?.[sem]?.[metric === "mean" ? "meanScore" : "medianScore"] ?? null);

    return {
      label: `${sem} ${metric === "mean" ? "(μ)" : "(m)"}`,
      data: values,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      borderWidth: 2.5,
      pointRadius: 5,
      pointHoverRadius: 7,
      fill: false,
      tension: 0.3,
      spanGaps: false,
    };
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    onHover: (_event: unknown, elements: Array<{ index: number }>) => {
      if (!onHover) return;
      if (elements.length === 0) {
        onHover(null);
        return;
      }
      const idx = elements[0].index;
      const year = yearLabels[idx];
      // Find any semester that has data for this year, or null
      for (const sem of semesters) {
        const point = lookup[year]?.[sem];
        if (point) {
          onHover(point);
          return;
        }
      }
      onHover(null);
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: { usePointStyle: true, padding: 20 },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        callbacks: {
          title: function (items: Array<{ label: string }>) {
            return items[0].label;
          },
          label: function (context: TooltipItem<"line">) {
            const value = context.raw as number | null;
            if (value === null) return "No data";
            const year = yearLabels[context.dataIndex];
            const sem = semesters[context.datasetIndex];
            const point = lookup[year]?.[sem];
            if (!point) return `${context.dataset.label}: ${value.toFixed(1)}`;
            return [
              `${context.dataset.label}: ${value.toFixed(1)}`,
              `Students: ${point.studentCount}`,
              `Range: ${point.minScore} – ${point.maxScore}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: Math.ceil(
          Math.max(
            ...data.map((d) =>
              metric === "mean" ? d.meanScore : d.medianScore
            ),
            90
          ) / 10
        ) * 10 + 10,
        ticks: {
          callback: function (value: string | number) {
            return typeof value === "number" ? value.toFixed(0) : value;
          },
        },
        grid: { color: "rgba(0, 0, 0, 0.06)" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-xs text-gray-400 mb-4">
        Showing {metric === "mean" ? "Mean (μ)" : "Median (m)"} per semester
      </p>
      <div className="h-72">
        <Line
          data={{ labels: yearLabels, datasets }}
          options={options}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
        {semesters.map((sem) => (
          <div key={sem} className="flex gap-2 items-center">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  SEMESTER_COLORS[sem]?.border ??
                  SEMESTER_COLORS["Semester 1"].border,
              }}
            />
            <span className="font-medium">{sem}</span>
            {yearLabels.map((y) => {
              const p = lookup[y]?.[sem];
              if (!p) return null;
              return (
                <span key={y} className="text-gray-400">
                  {y}: {metric === "mean" ? p.meanScore.toFixed(1) : p.medianScore.toFixed(1)} (n={p.studentCount})
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
