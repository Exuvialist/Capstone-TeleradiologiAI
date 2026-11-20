import { examTypes, type Exam } from "@/data/mock";

// Helpers that turn the Exam data (data/mock.ts) into the text Grace's radiologi pages show.

const MON = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// "pneumonia" → "Pneumonia"
export const examLabel = (slug: string) => examTypes.find((t) => t.slug === slug)?.label ?? slug;

// "2026-10-19" → "19/10/2026"
export function formatDate(ymd: string | null | undefined) {
  if (!ymd) return "-";
  const [y, m, d] = ymd.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

// "2000-05-01" → "01 / Mei / 2000"
export function formatBirthDate(ymd: string) {
  const [y, m, d] = ymd.split("-");
  return `${d} / ${MON[Number(m) - 1] ?? m} / ${y}`;
}

// What the AI said: "Pneumonia" or "Bukan Pneumonia"
export const aiText = (e: Exam) => (e.aiPositive ? examLabel(e.type) : `Bukan ${examLabel(e.type)}`);

// "Pneumonia | 90%"
export const aiLabel = (e: Exam) => `${aiText(e)} | ${e.aiScore}%`;

// The radiologist's verdict
export const verdictLabel = (e: Exam) => (e.verdictPositive ? "Terdeteksi" : "Tidak terdeteksi");

// Today as YYYY-MM-DD (local time), the format Exam uses for verifiedAt
export function todayYmd() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}
