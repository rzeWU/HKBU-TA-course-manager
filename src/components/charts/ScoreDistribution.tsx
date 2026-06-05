"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

interface Props {
  scores: number[] | null;
  selectedPoint: {
    yearLabel: string;
    semester: string;
    meanScore: number;
    medianScore: number;
    studentCount: number;
  } | null;
}

const BUCKETS = [
  "0-10", "10-20", "20-30", "30-40", "40-50",
  "50-60", "60-70", "70-80", "80-90", "90-100",
];

function bucketScores(scores: number[]): number[] {
  const counts = new Array(10).fill(0);
  for (const s of scores) {
    if (s >= 100) counts[9]++;
    else if (s < 0) counts[0]++;
    else {
      counts[Math.min(Math.floor(s / 10), 9)]++;
    }
  }
  return counts;
}

export default function ScoreDistribution({
  scores,
  selectedPoint,
}: Props) {
  const { bucketCounts, maxCount, chartData, options } = useMemo(() => {
    if (!scores || scores.length === 0) {
      return { bucketCounts: null, maxCount: 0, chartData: null, options: null };
    }

    const counts = bucketScores(scores);
    const max = Math.max(...counts, 1);

    const data = {
      labels: BUCKETS,
      datasets: [
        {
          label: "Students",
          data: counts,
          backgroundColor: counts.map((_, i) => {
            // Gradient: light blue to dark blue
            const intensity = Math.min(i / 9, 1);
            return `rgba(59, 130, 246, ${0.25 + intensity * 0.6})`;
          }),
          borderColor: "rgba(59, 130, 246, 0.8)",
          borderWidth: 1,
          borderRadius: 3,
          hoverBackgroundColor: "rgb(37, 99, 235)",
        },
      ],
    };

    const opts = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 200 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.95)",
          padding: 12,
          callbacks: {
            label: function (context: { raw: unknown }) {
              const count = context.raw as number;
              const pct =
                scores.length > 0
                  ? ((count / scores.length) * 100).toFixed(1)
                  : "0";
              return `${count} students (${pct}%)`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: Math.ceil(max * 1.15),
          ticks: {
            stepSize: Math.max(1, Math.ceil(max / 6)),
            font: { size: 11 },
          },
          grid: { color: "rgba(0, 0, 0, 0.05)" },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 } },
        },
      },
    };

    return { bucketCounts: counts, maxCount: max, chartData: data, options: opts };
  }, [scores]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 h-full">
      {selectedPoint ? (
        <>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-700 text-sm">
              Score Distribution
            </h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {selectedPoint.yearLabel} {selectedPoint.semester}
            </span>
          </div>
          <div className="flex gap-4 mb-3 text-xs text-gray-500">
            <span>μ = {selectedPoint.meanScore.toFixed(1)}</span>
            <span>m = {selectedPoint.medianScore.toFixed(1)}</span>
            <span>n = {selectedPoint.studentCount}</span>
          </div>
          {chartData && options ? (
            <div className="h-64">
              <Bar data={chartData} options={options} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              No individual scores available for this selection
            </div>
          )}
        </>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          <p className="text-sm mb-1">Score Distribution</p>
          <p className="text-xs">
            ← Click a point on the trend chart
          </p>
        </div>
      )}
    </div>
  );
}
