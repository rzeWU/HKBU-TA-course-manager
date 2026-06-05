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

function dynamicBuckets(scores: number[]): {
  labels: string[];
  counts: number[];
  bucketWidth: number;
} {
  const nonZero = scores.filter((s) => s > 0);
  if (nonZero.length === 0) {
    return { labels: ["0-100"], counts: [scores.length], bucketWidth: 100 };
  }

  const min = Math.min(...nonZero);
  const max = Math.max(...nonZero);
  const range = max - min;

  // Choose bucket width based on score spread
  let bucketWidth: number;
  if (range <= 10) bucketWidth = 1;
  else if (range <= 25) bucketWidth = 2;
  else if (range <= 50) bucketWidth = 5;
  else bucketWidth = 10;

  // Snap min down and max up to bucket boundaries
  const snapMin = Math.floor(min / bucketWidth) * bucketWidth;
  const snapMax = Math.ceil(max / bucketWidth) * bucketWidth;

  const bucketCount = Math.ceil((snapMax - snapMin) / bucketWidth);
  const counts = new Array(bucketCount).fill(0);
  const labels: string[] = [];

  for (let i = 0; i < bucketCount; i++) {
    const low = snapMin + i * bucketWidth;
    const high = low + bucketWidth;
    labels.push(high === 100 ? `${low}-${high}` : `${low}-${high}`);
  }

  for (const s of scores) {
    if (s <= 0) {
      counts[0]++;
      continue;
    }
    if (s >= snapMax) {
      counts[bucketCount - 1]++;
      continue;
    }
    const idx = Math.floor((s - snapMin) / bucketWidth);
    counts[Math.min(idx, bucketCount - 1)]++;
  }

  return { labels, counts, bucketWidth };
}

export default function ScoreDistribution({ scores, selectedPoint }: Props) {
  const { labels, counts, maxCount, chartData, options, bucketWidth } =
    useMemo(() => {
      if (!scores || scores.length === 0) {
        return {
          labels: [] as string[],
          counts: [] as number[],
          maxCount: 0,
          chartData: null,
          options: null,
          bucketWidth: 0,
        };
      }

      const { labels: lbs, counts: cnts, bucketWidth: bw } = dynamicBuckets(scores);
      const max = Math.max(...cnts, 1);

      const data = {
        labels: lbs,
        datasets: [
          {
            label: "Students",
            data: cnts,
            backgroundColor: cnts.map((_, i) => {
              const intensity = Math.min(i / Math.max(lbs.length - 1, 1), 1);
              return `rgba(59, 130, 246, ${0.3 + intensity * 0.55})`;
            }),
            borderColor: "rgba(59, 130, 246, 0.9)",
            borderWidth: 1,
            borderRadius: 2,
            barPercentage: Math.max(0.3, Math.min(0.6, 0.5 - lbs.length * 0.02)),
            categoryPercentage: Math.max(0.5, Math.min(0.85, 1 - lbs.length * 0.03)),
            hoverBackgroundColor: "rgb(37, 99, 235)",
          },
        ],
      };

      const opts = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 150 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(17, 24, 39, 0.95)",
            padding: 12,
            callbacks: {
              title: function (items: Array<{ label: string }>) {
                const range = items[0].label;
                return bw <= 2 ? `Score: ${range}` : `Score range: ${range}`;
              },
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
              font: { size: 10 },
            },
            grid: { color: "rgba(0, 0, 0, 0.05)" },
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { size: lbs.length > 15 ? 8 : 10 },
              maxRotation: lbs.length > 10 ? 45 : 0,
              autoSkip: lbs.length > 12,
            },
          },
        },
      };

      return {
        labels: lbs,
        counts: cnts,
        maxCount: max,
        chartData: data,
        options: opts,
        bucketWidth: bw,
      };
    }, [scores]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 h-full">
      {selectedPoint ? (
        <>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-700 text-sm">Distribution</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {selectedPoint.yearLabel} {selectedPoint.semester}
            </span>
            {bucketWidth > 0 && (
              <span className="text-[10px] text-gray-400 ml-auto">
                bucket: {bucketWidth}pt
              </span>
            )}
          </div>
          <div className="flex gap-3 mb-2 text-xs text-gray-500">
            <span>μ={selectedPoint.meanScore.toFixed(1)}</span>
            <span>m={selectedPoint.medianScore.toFixed(1)}</span>
            <span>n={selectedPoint.studentCount}</span>
          </div>
          {chartData && options ? (
            <div className="h-64">
              <Bar data={chartData} options={options} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              No scores available
            </div>
          )}
        </>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          <p className="text-sm mb-1">Distribution</p>
          <p className="text-xs">← Click a point on the trend chart</p>
        </div>
      )}
    </div>
  );
}
