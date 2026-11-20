import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { exams, examTypes } from "@/data/mock";
import Report from "./Report";

// No Figma frame: "Export Laporan" on a verified exam (Desktop-14).
// Reads the exam from the URL; all pages are pre-built, so blocking is fine (no loading design yet).
export const instant = false;

// Pre-builds the report of every verified dummy exam of this type.
export function generateStaticParams({ params }: { params: { jenis: string } }) {
  return exams.filter((e) => e.type === params.jenis && e.verifiedAt).map((e) => ({ id: e.id }));
}

export default async function LaporanPage({ params }: PageProps<"/faskes/pemeriksaan/[jenis]/[id]/laporan">) {
  const { jenis, id } = await params;
  const type = examTypes.find((t) => t.slug === jenis);
  const exam = exams.find((e) => e.id === id && e.type === jenis);
  if (!type || !exam?.verifiedAt) notFound();

  return (
    <PageShell crumbs={["Detail Pemeriksaan", type.label, `#${id}`, "Laporan"]}>
      <Report exam={exam} examLabel={type.label} />
    </PageShell>
  );
}
