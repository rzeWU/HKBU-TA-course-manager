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
}

const COLORS = [
  { border: "rgb(59, 130, 246)", bg: "rgba(59, 130, 246, 0.1)" },
  { border: "rgb(16, 185, 129)", bg: "rgba(16, 185, 129, 0.1)" },
  { border: "rgb(245, 158, 11)", bg: "rgba(245, 158, 11, 0.1)" },
  { border: "rgb(239, 68, 68)", bg: "rgba(239, 68, 68, 0.1)" },
  { border: "rgb(139, 92, 246)", bg: "rgba(139, 92, 246, 0.1)" },
];

export default function PerformanceTrend({ title, data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">No data available yet</p>
      </div>
    );
  }

  const labels = data.map((d) => `${d.yearLabel}\n${d.semester}`);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Mean (μ)",
        data: data.map((d) => d.meanScore),
        borderColor: COLORS[0].border,
        backgroundColor: COLORS[0].bg,
        borderWidth: 2.5,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.3,
      },
      {
        label: "Median (m)",
        data: data.map((d) => d.medianScore),
        borderColor: COLORS[1].border,
        backgroundColor: COLORS[1].bg,
        borderWidth: 2.5,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderDash: [5, 3],
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
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
            return items[0].label.replace("\n", " · ");
          },
          label: function (context: TooltipItem<"line">) {
            const idx = context.datasetIndex;
            const point = data[context.dataIndex];
            if (!point) return "";
            const value =
              idx === 0 ? point.meanScore : point.medianScore;
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
          Math.max(...data.map((d) => Math.max(d.meanScore, d.medianScore))) /
            10
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
      <h3 className="font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="h-72">
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-4 flex gap-4 text-xs text-gray-500">
        {data.map((d, i) => (
          <div key={i} className="flex gap-1">
            <span className="font-medium">
              {d.yearLabel} {d.semester}
            </span>
            <span>μ={d.meanScore.toFixed(1)}</span>
            <span>n={d.studentCount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
