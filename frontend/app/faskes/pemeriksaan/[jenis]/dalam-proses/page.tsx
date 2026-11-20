import { notFound } from "next/navigation";
import ExamTable from "@/components/ExamTable";
import ExamTabs from "@/components/ExamTabs";
import PageShell from "@/components/PageShell";
import { exams, examTypes } from "@/data/mock";

// Figma Desktop-9 147:392
// Reads the exam type from the URL; all pages are pre-built, so blocking is fine (no loading design yet).
export const instant = false;

export default async function DalamProsesPage({ params }: PageProps<"/faskes/pemeriksaan/[jenis]/dalam-proses">) {
  const { jenis } = await params;
  const exam = examTypes.find((e) => e.slug === jenis);
  if (!exam) notFound();

  return (
    <PageShell crumbs={["Detail Pemeriksaan", `${exam.label} - Dalam Proses`]}>
      <ExamTabs exam={exam} active="dalam-proses" />
      <ExamTable rows={exams.filter((e) => e.type === exam.slug && !e.verifiedAt)} pageSize={10} tools />
    </PageShell>
  );
}
