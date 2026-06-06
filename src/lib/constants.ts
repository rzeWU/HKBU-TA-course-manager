export const ASSESSMENT_TYPES = [
  "Assignment 1", "Assignment 2", "Assignment 3",
  "Midterm", "Final",
  "Quiz", "In-class Quiz", "Presentation",
] as const;

export const ASSESSMENT_ORDER: Record<string, number> = {
  "Assignment 1": 0, "Assignment 2": 1, "Assignment 3": 2,
  "Midterm": 3, "Final": 4,
  "Quiz": 5, "In-class Quiz": 6, "Presentation": 7,
};

export const ASSESSMENT_ABBREV: Record<string, string> = {
  "Assignment 1": "A1", "Assignment 2": "A2", "Assignment 3": "A3",
  "Midterm": "Mid", "Final": "Fin",
  "Quiz": "Quiz", "In-class Quiz": "IQ", "Presentation": "Pres",
};

export const FILE_KINDS = [
  "Criteria", "Question Paper", "Grade Sheet", "Solution", "Other",
];

export const SEMESTERS = ["Semester 1", "Semester 2", "Summer Term"];
