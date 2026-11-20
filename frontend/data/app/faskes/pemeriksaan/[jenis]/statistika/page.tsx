import { notFound } from "next/navigation";
import ExamTabs from "@/components/ExamTabs";
import PageShell from "@/components/PageShell";
import { examTypes } from "@/data/mock";

// Placeholder: the Statistika content comes in Phase 7.
// Reads the exam type from the URL; all pages are pre-built, so blocking is fine (no loading design yet).
export const instant = false;

export default async function StatistikaPage({ params }: PageProps<"/faskes/pemeriksaan/[jenis]/statistika">) {
  const { jenis } = await params;
  const exam = examTypes.find((e) => e.slug === jenis);
  if (!exam) notFound();

  return (
    <PageShell crumbs={["Detail Pemeriksaan", `${exam.label} - Statistika`]}>
      <ExamTabs exam={exam} active="statistika" />
    </PageShell>
  );
}
