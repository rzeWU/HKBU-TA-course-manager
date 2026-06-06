import * as XLSX from "xlsx";

export interface ParsedCourseAssignment {
  courseCode: string;
  courseName: string | null;
  weeklyHours: number;
  duties: string | null;
  skills: string | null;
}

const TA_NAME = "wu ruize";
const TA_KEYWORDS = ["ta assigned", "ta name", "assigned to", "name", "assigned ta"];
const COURSE_KEYWORDS = ["course code", "course", "code", "subject"];
const HOURS_KEYWORDS = ["workload", "hours", "weekly hours", "expected workload", "hrs/week", "hours/week"];
const DUTIES_KEYWORDS = ["duties", "expected duties", "duty", "task", "tasks"];
const SKILLS_KEYWORDS = ["skills", "preferred skills", "skill", "qualification"];

// Extract course code and name from cell like "ECON7880 Big Data Analytics"
function extractCourseCode(raw: string): { code: string; name: string | null } {
  const cleaned = raw.trim();
  // Try to find pattern like ECON7880 or ECON 7880
  const match = cleaned.match(/[A-Za-z]{2,}\s*\d{4}/);
  if (match) {
    const code = match[0].replace(/\s/g, "").toUpperCase();
    const remaining = cleaned.substring((match.index ?? 0) + match[0].length).trim();
    return { code, name: remaining || null };
  }
  const code = cleaned.split(/[\s\-–]+/)[0].toUpperCase();
  const name = cleaned.substring(code.length).trim() || null;
  return { code, name };
}

function findCol(headers: string[], keywords: string[]): number {
  for (const kw of keywords) {
    const idx = headers.findIndex((h) => h.toLowerCase().trim().includes(kw));
    if (idx >= 0) return idx;
  }
  // Try partial match
  for (const kw of keywords) {
    const idx = headers.findIndex((h) =>
      kw.split(" ").every((w) => h.toLowerCase().includes(w))
    );
    if (idx >= 0) return idx;
  }
  return -1;
}

export function parseManpowerFile(buffer: ArrayBuffer): ParsedCourseAssignment[] {
  const workbook = XLSX.read(buffer, { type: "array" });

  // Try all sheets
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      blankrows: false,
      defval: "",
    });

    if (rows.length < 2) continue;

    // Find header row - look for row with multiple matching keywords
    let headerRowIdx = 0;
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      const row = rows[i].map((c) => String(c ?? "").toLowerCase().trim());
      const matchCount = [
        ...TA_KEYWORDS,
        ...COURSE_KEYWORDS,
        ...HOURS_KEYWORDS,
        ...DUTIES_KEYWORDS,
        ...SKILLS_KEYWORDS,
      ].filter((kw) => row.some((c) => c.includes(kw))).length;
      if (matchCount >= 2) {
        headerRowIdx = i;
        break;
      }
    }

    const headers = rows[headerRowIdx].map((h) => String(h ?? "").trim());
    const taCol = findCol(headers, TA_KEYWORDS);
    if (taCol < 0) continue; // Try next sheet

    const courseCol = findCol(headers, COURSE_KEYWORDS);
    const hoursCol = findCol(headers, HOURS_KEYWORDS);
    const dutiesCol = findCol(headers, DUTIES_KEYWORDS);
    const skillsCol = findCol(headers, SKILLS_KEYWORDS);

    const results: ParsedCourseAssignment[] = [];

    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      const ta = String(row[taCol] ?? "").trim().toLowerCase();
      if (!ta.includes(TA_NAME)) continue;

      const rawCode = courseCol >= 0 ? String(row[courseCol] ?? "").trim() : "";
      const { code, name: courseName } = extractCourseCode(rawCode);
      if (!code) continue;

      const hoursStr = hoursCol >= 0 ? String(row[hoursCol] ?? "").trim() : "0";
      const hours = parseFloat(hoursStr.replace(/[^0-9.]/g, "")) || 0;

      const duties = dutiesCol >= 0 ? String(row[dutiesCol] ?? "").trim() || null : null;
      const skills = skillsCol >= 0 ? String(row[skillsCol] ?? "").trim() || null : null;

      results.push({ courseCode: code, courseName, weeklyHours: hours, duties, skills });
    }

    if (results.length > 0) return results;
  }

  return [];
}
