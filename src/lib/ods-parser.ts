import * as XLSX from "xlsx";
import type { ParsedOdsData, StudentEntry } from "./types";

const STAT_KEYWORDS = [
  "mean", "median", "max", "min", "maximum", "minimum",
  "std", "stdev", "average", "sd", "mode", "count", "total", "",
];

function isStatKeyword(value: string): boolean {
  const cleaned = value.toLowerCase().trim().replace(/[^a-z]/g, "");
  return STAT_KEYWORDS.includes(cleaned);
}

function findColumnIndex(headers: string[], keywords: string[]): number {
  for (const kw of keywords) {
    const idx = headers.findIndex((h) =>
      h.toLowerCase().includes(kw.toLowerCase())
    );
    if (idx >= 0) return idx;
  }
  return -1;
}

export function parseOdsFile(buffer: ArrayBuffer): ParsedOdsData {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rawData: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
  });

  if (rawData.length < 3) {
    throw new Error(
      "File has too few rows. Expected at least header, points, and student rows."
    );
  }

  // Row 0: headers
  const headers = rawData[0].map((h) => String(h ?? "").trim());

  // Row 1: max points per question
  const pointsRow = rawData[1];

  // Find key columns
  const idColIndex = findColumnIndex(headers, ["id number", "id"]);
  const totalColIndex = findColumnIndex(headers, ["total (", "total"]);
  const commentsColIndex = findColumnIndex(headers, ["comment"]);
  const specialIssueColIndex = findColumnIndex(headers, [
    "special issue illustration",
    "special issue",
  ]);

  if (idColIndex < 0) {
    throw new Error("Could not find ID number column in headers.");
  }
  if (totalColIndex < 0) {
    throw new Error("Could not find Total column in headers.");
  }

  // Score question headers (columns between ID and Total)
  const scoreQuestionHeaders = headers
    .slice(idColIndex + 1, totalColIndex)
    .map((h) => h.replace(/\s*\(\d+\)\s*/g, "").trim());

  // Extract max points per question
  const scorePoints: (number | null)[] = [];
  for (let i = idColIndex + 1; i < totalColIndex; i++) {
    const val = pointsRow[i];
    const num = val !== undefined && val !== "" ? Number(val) : NaN;
    scorePoints.push(isNaN(num) ? null : num);
  }

  // Separate student rows from summary rows
  const studentRows: unknown[][] = [];
  for (let i = 2; i < rawData.length; i++) {
    const firstCell = String(rawData[i][0] ?? "").trim();
    if (firstCell === "" || isStatKeyword(firstCell)) {
      continue; // summary or empty row
    }
    studentRows.push(rawData[i]);
  }

  // Parse student entries
  const students: StudentEntry[] = studentRows.map((row) => {
    const subScores: Record<string, number> = {};
    for (let j = 0; j < scoreQuestionHeaders.length; j++) {
      const colIdx = idColIndex + 1 + j;
      const raw = row[colIdx];
      let value: number;
      if (typeof raw === "number") {
        value = raw;
      } else if (typeof raw === "string" && raw.trim() !== "") {
        value = parseFloat(raw.replace(/,/g, ".")) || 0;
      } else {
        value = 0;
      }
      subScores[scoreQuestionHeaders[j]] = value;
    }

    const totalRaw = row[totalColIndex];
    const totalScore =
      typeof totalRaw === "number"
        ? totalRaw
        : parseFloat(
            String(totalRaw ?? "0").replace(/,/g, ".")
          ) || 0;

    return {
      surname: String(row[0] ?? "").trim(),
      firstName: String(row[1] ?? "").trim(),
      studentId: String(row[idColIndex] ?? "").trim(),
      totalScore,
      subScores,
      comments:
        commentsColIndex >= 0
          ? String(row[commentsColIndex] ?? "").trim() || null
          : null,
      specialIssue:
        specialIssueColIndex >= 0
          ? String(row[specialIssueColIndex] ?? "").trim() || null
          : null,
    };
  });

  // Compute statistics from student data
  const scores = students.map((s) => s.totalScore).sort((a, b) => a - b);
  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const mid = Math.floor(scores.length / 2);
  const median =
    scores.length % 2 === 0
      ? (scores[mid - 1] + scores[mid]) / 2
      : scores[mid];

  return {
    headers,
    pointsRow: scorePoints,
    students,
    summaryStats: {
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      max: Math.max(...scores),
      min: Math.min(...scores),
      studentCount: students.length,
    },
  };
}
