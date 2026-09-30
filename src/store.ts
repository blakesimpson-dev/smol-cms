import { getStore } from "@netlify/blobs";
import { defaults, getSectionDef, type SectionData } from "./schema";

type Stored = { data: SectionData; updatedAt: string };
export type LoadedSection = { data: SectionData; updatedAt: string | null };

// Site-wide blob stores are shared by every deploy, so previews get their own store
// to avoid editing production content by accident.
const contentStore = (isProd: boolean) =>
  getStore({ name: isProd ? "content" : "content-preview", consistency: "strong" });

export async function getSection(isProd: boolean, key: string): Promise<LoadedSection> {
  const def = getSectionDef(key);
  if (!def) throw new Error(`Unknown section: ${key}`);
  const stored = (await contentStore(isProd).get(key, { type: "json" })) as Stored | null;
  return { data: { ...defaults(def), ...stored?.data }, updatedAt: stored?.updatedAt ?? null };
}

export async function getSections(isProd: boolean, keys: string[]): Promise<Record<string, LoadedSection>> {
  const entries = await Promise.all(keys.map(async (k) => [k, await getSection(isProd, k)] as const));
  return Object.fromEntries(entries);
}

export async function saveSection(isProd: boolean, key: string, data: SectionData): Promise<void> {
  const value: Stored = { data, updatedAt: new Date().toISOString() };
  await contentStore(isProd).setJSON(key, value);
}
