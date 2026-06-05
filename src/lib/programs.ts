export interface Program {
  slug: string;
  name: string;
  fullName: string;
  color: string;
}

export const PROGRAMS: Program[] = [
  {
    slug: "mscdabe",
    name: "MScDABE",
    fullName: "MSc in Data Analytics and Business Economics",
    color: "#1a365d",
  },
  {
    slug: "mscaecon",
    name: "MScAECON",
    fullName: "MSc in Applied Economics",
    color: "#2d5a27",
  },
];

export function getProgramBySlug(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}

export function getProgramByCourseCode(_code: string): Program | undefined {
  // No longer needed - program is stored on the course itself
  return undefined;
}
