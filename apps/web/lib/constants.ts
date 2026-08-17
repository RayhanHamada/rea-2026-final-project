export const ROLE = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  CANDIDATE: "candidate",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];
