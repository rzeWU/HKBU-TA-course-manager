"use client";

import { useMemo } from "react";
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
  selectedPoint: AssessmentPoint | null;
  onSelect: (point: AssessmentPoint | null) => void;
}

const SEMESTER_COLORS: Record<string, { border: string; bg: string; selected: string }> = {
  "Semester 1": {
    border: "rgb(59, 130, 246)",
    bg: "rgba(59, 130, 246, 0.08)",
    selected: "rgb(30, 64, 175)",
  },
  "Semester 2": {
    border: "rgb(16, 185, 129)",
    bg: "rgba(16, 185, 129, 0.08)",
    selected: "rgb(6, 95, 70)",
  },
};

export default function PerformanceTrend({
  title,
  data,
  metric,
  selectedPoint,
  onSelect,
}: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">No data available yet</p>
      </div>
    );
  }

  const semesters = [...new Set(data.map((d) => d.semester))].sort();
  const yearLabels = [...new Set(data.map((d) => d.yearLabel))].sort();

  const lookup: Record<string, Record<string, AssessmentPoint>> = {};
  for (const d of data) {
    if (!lookup[d.yearLabel]) lookup[d.yearLabel] = {};
    lookup[d.yearLabel][d.semester] = d;
  }

  const selectedKey = selectedPoint
    ? `${selectedPoint.yearLabel}|${selectedPoint.semester}`
    : null;

  const datasets = semesters.map((sem) => {
    const colors =
      SEMESTER_COLORS[sem] ||
      SEMESTER_COLORS["Semester 1"];

    const values = yearLabels.map((y) => {
      const p = lookup[y]?.[sem];
      return p ? (metric === "mean" ? p.meanScore : p.medianScore) : null;
    });

    return {
      label: `${sem} ${metric === "mean" ? "(μ)" : "(m)"}`,
      data: values,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      borderWidth: 2.5,
      pointRadius: yearLabels.map((y) => {
        const p = lookup[y]?.[sem];
        if (!p) return 0;
        return selectedPoint &&
          selectedPoint.yearLabel === y &&
          selectedPoint.semester === sem
          ? 8
          : 5;
      }),
      pointHoverRadius: 7,
      pointBorderWidth: yearLabels.map((y) => {
        const p = lookup[y]?.[sem];
        if (!p) return 0;
        return selectedPoint &&
          selectedPoint.yearLabel === y &&
          selectedPoint.semester === sem
          ? 3
          : 1;
      }),
      pointBackgroundColor: yearLabels.map((y) => {
        const p = lookup[y]?.[sem];
        if (!p) return colors.border;
        return selectedPoint &&
          selectedPoint.yearLabel === y &&
          selectedPoint.semester === sem
          ? colors.selected
          : colors.border;
      }),
      fill: false,
      tension: 0.3,
      spanGaps: false,
      borderDash: sem === "Semester 2" ? [6, 3] : [],
    };
  });

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      onClick: (
        _event: unknown,
        elements: Array<{ index: number; datasetIndex: number }>
      ) => {
        if (elements.length === 0) {
          onSelect(null);
          return;
        }
        const el = elements[0];
        const year = yearLabels[el.index];
        const sem = semesters[el.datasetIndex];
        const point = lookup[year]?.[sem];
        if (point) {
          // Toggle off if clicking the same point
          if (
            selectedPoint &&
            selectedPoint.yearLabel === year &&
            selectedPoint.semester === sem
          ) {
            onSelect(null);
          } else {
            onSelect(point);
          }
        } else {
          onSelect(null);
        }
      },
      plugins: {
        legend: {
          position: "top" as const,
          labels: { usePointStyle: true, padding: 16, boxWidth: 10 },
        },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.95)",
          padding: 14,
          titleFont: { size: 14, weight: "bold" as const },
          bodyFont: { size: 13 },
          displayColors: true,
          callbacks: {
            title: function (items: Array<{ label: string }>) {
              return `📅 ${items[0].label}`;
            },
            label: function (context: TooltipItem<"line">) {
              const value = context.raw as number | null;
              if (value === null) return "No data";
              const year = yearLabels[context.dataIndex];
              const sem = semesters[context.datasetIndex];
              const point = lookup[year]?.[sem];
              if (!point)
                return `${context.dataset.label}: ${value.toFixed(1)}`;
              return [
                `${context.dataset.label}: ${value.toFixed(1)}`,
                `  Students: ${point.studentCount}`,
                `  Range: ${point.minScore} – ${point.maxScore}`,
              ];
            },
          },
        },
      },
      scales: {
        y: {
          min: 0,
          max:
            Math.ceil(
              Math.max(
                ...data.map((d) =>
                  metric === "mean" ? d.meanScore : d.medianScore
                ),
                90
              ) / 10
            ) *
              10 +
            10,
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
    }),
    [data, metric, yearLabels, semesters, lookup, selectedPoint, onSelect]
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <span className="text-xs text-gray-400">
          Click a data point to see distribution →
        </span>
      </div>
      <div className="h-64">
        <Line
          data={{ labels: yearLabels, datasets }}
          options={options}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
        {semesters.map((sem) => {
          const colors =
            SEMESTER_COLORS[sem] || SEMESTER_COLORS["Semester 1"];
          return (
            <div key={sem} className="flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.border }}
              />
              <span className="font-medium">{sem}:</span>
              {yearLabels.map((y) => {
                const p = lookup[y]?.[sem];
                if (!p) return null;
                const isSelected =
                  selectedPoint &&
                  selectedPoint.yearLabel === y &&
                  selectedPoint.semester === sem;
                return (
                  <span
                    key={y}
                    className={`cursor-pointer hover:underline ${
                      isSelected
                        ? "text-blue-700 font-semibold"
                        : "text-gray-400"
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        onSelect(null);
                      } else if (p) {
                        onSelect(p);
                      }
                    }}
                  >
                    {y}: {metric === "mean" ? p.meanScore.toFixed(1) : p.medianScore.toFixed(1)}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
