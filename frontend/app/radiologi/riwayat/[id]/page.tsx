import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import VerifyView from "@/components/VerifyView";
import { examTypes, radiologistExams } from "@/data/mock";

// No Figma frame: the verify page (Desktop-29) read-only, opened from Riwayat
// Reads the exam ID from the URL; all pages are pre-built, so blocking is fine (no loading design yet).
export const instant = false;

export function generateStaticParams() {
  return radiologistExams.map((e) => ({ id: e.id }));
}

export default async function RiwayatDetailPage({ params }: PageProps<"/radiologi/riwayat/[id]">) {
  const { id } = await params;
  const exam = radiologistExams.find((e) => e.id === id);
  if (!exam) notFound();
  const { label } = examTypes.find((t) => t.slug === exam.type)!;

  return (
    <PageShell crumbs={["Riwayat", `${label} - #${exam.id}`]}>
      <VerifyView id={exam.id} />
    </PageShell>
  );
}
