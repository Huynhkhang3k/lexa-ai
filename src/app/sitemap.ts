import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXTAUTH_URL ?? "https://lexa-ai-beryl.vercel.app").replace(
    /\/$/,
    "",
  );
  const routes = [
    "",
    "/test",
    "/library",
    "/chat",
    "/translate",
    "/practice",
    "/login",
    "/privacy",
    "/terms",
  ];
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
