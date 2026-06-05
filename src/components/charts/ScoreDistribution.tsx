"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  title: string;
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
      const idx = Math.floor(s / 10);
      counts[Math.min(idx, 9)]++;
    }
  }
  return counts;
}

export default function ScoreDistribution({ title, scores, selectedPoint }: Props) {
  if (!scores || scores.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400 text-sm">
            {selectedPoint
              ? `Hover over a data point on the chart above to see score distribution`
              : `No distribution data available`}
          </p>
        </div>
      </div>
    );
  }

  const bucketCounts = bucketScores(scores);
  const maxCount = Math.max(...bucketCounts, 1);

  const chartData = {
    labels: BUCKETS,
    datasets: [
      {
        label: "Students",
        data: bucketCounts,
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        padding: 12,
        callbacks: {
          label: function (context: { raw: unknown; dataIndex: number }) {
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
        max: Math.ceil(maxCount * 1.2),
        ticks: { stepSize: Math.max(1, Math.ceil(maxCount / 5)) },
        grid: { color: "rgba(0, 0, 0, 0.06)" },
        title: {
          display: true,
          text: "Number of Students",
        },
      },
      x: {
        grid: { display: false },
        title: {
          display: true,
          text: "Score Range",
        },
      },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        {selectedPoint && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {selectedPoint.yearLabel} · {selectedPoint.semester}
          </span>
        )}
      </div>
      {selectedPoint && (
        <div className="flex gap-4 mb-3 text-sm text-gray-500">
          <span>μ = {selectedPoint.meanScore.toFixed(1)}</span>
          <span>m = {selectedPoint.medianScore.toFixed(1)}</span>
          <span>n = {selectedPoint.studentCount}</span>
        </div>
      )}
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
