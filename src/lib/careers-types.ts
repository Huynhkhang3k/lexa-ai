import type { CareerFieldId } from "./career-fields";
import type { RiasecCode } from "./holland-riasec";

export type Career = {
  id: string;
  name: string;
  tagline: string;
  /** Ảnh minh hoạ (thư viện nghề, lộ trình). */
  imageUrl?: string;
  highlight?: string;
  description: string;
  skills: string[];
  averageSalary: string;
  relatedSubjects: string[];
  opportunities: string[];
  workEnvironment: string;
  studyPath: string;
  field: CareerFieldId;
  riasecPrimary: RiasecCode;
  riasecSecondary: RiasecCode;
};

/** Dữ liệu nghề trước khi gắn lĩnh vực, ảnh và RIASEC (từ careers-riasec). */
export type CareerSeed = Omit<Career, "field" | "imageUrl" | "riasecPrimary" | "riasecSecondary">;
