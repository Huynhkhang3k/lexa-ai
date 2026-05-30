import type { CareerFieldId } from "./career-fields";

export type Career = {
  id: string;
  name: string;
  tagline: string;
  highlight?: string;
  description: string;
  skills: string[];
  averageSalary: string;
  relatedSubjects: string[];
  opportunities: string[];
  workEnvironment: string;
  studyPath: string;
  field: CareerFieldId;
};
