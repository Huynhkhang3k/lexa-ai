/** Công nghệ / công cụ phổ biến theo nghề — bổ sung cho thư viện nghề */
export const CAREER_TECHNOLOGIES: Record<string, string[]> = {
  "ai-eng": ["Python", "TensorFlow", "PyTorch", "Jupyter", "Git"],
  se: ["JavaScript", "TypeScript", "React", "Node.js", "Git"],
  da: ["SQL", "Python", "Excel", "Power BI", "Tableau"],
  ux: ["Figma", "Adobe XD", "Prototyping", "User research", "Design systems"],
  mk: ["Google Ads", "Meta Ads", "Canva", "Analytics", "SEO tools"],
  pm: ["Jira", "Notion", "Figma", "Analytics", "Roadmapping"],
  med: ["EMR systems", "Diagnostic tools", "Medical databases"],
  teacher: ["LMS", "Google Classroom", "Presentation tools"],
  law: ["Legal databases", "Document management", "Research tools"],
  arch: ["AutoCAD", "Revit", "SketchUp", "3D rendering"],
};

export function getCareerTechnologies(careerId: string, skills: string[]): string[] {
  const mapped = CAREER_TECHNOLOGIES[careerId];
  if (mapped?.length) return mapped;
  return skills.slice(0, 5);
}
