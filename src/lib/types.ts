export interface StudentEntry {
  studentId: string;
  surname: string;
  firstName: string;
  totalScore: number;
  subScores: Record<string, number>;
  comments: string | null;
  specialIssue: string | null;
}

export interface ParsedOdsData {
  headers: string[];
  pointsRow: (number | null)[];
  students: StudentEntry[];
  summaryStats: {
    mean: number;
    median: number;
    max: number;
    min: number;
    studentCount: number;
  };
}

export interface AssessmentUploadPayload {
  academicYear: string;
  semester: string;
  type: string;
  totalPoints: number;
  students: StudentEntry[];
  summaryStats: {
    mean: number;
    median: number;
    max: number;
    min: number;
    studentCount: number;
  };
}
