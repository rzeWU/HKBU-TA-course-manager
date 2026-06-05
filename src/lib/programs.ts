export interface Program {
  slug: string;
  name: string;
  fullName: string;
  courseCodes: string[];
  color: string;
}

export const PROGRAMS: Program[] = [
  {
    slug: "mscdabe",
    name: "MScDABE",
    fullName: "MSc in Data Analytics and Business Economics",
    courseCodes: ["ECON7880"],
    color: "#1a365d",
  },
  {
    slug: "mscaecon",
    name: "MScAECON",
    fullName: "MSc in Applied Economics",
    courseCodes: ["ECON3105"],
    color: "#2d5a27",
  },
];

export function getProgramBySlug(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}

export function getProgramByCourseCode(code: string): Program | undefined {
  return PROGRAMS.find((p) => p.courseCodes.includes(code.toUpperCase()));
}
