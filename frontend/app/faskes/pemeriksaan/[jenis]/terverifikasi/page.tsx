import { notFound } from "next/navigation";
import ExamTable from "@/components/ExamTable";
import ExamTabs from "@/components/ExamTabs";
import PageShell from "@/components/PageShell";
import { exams, examTypes } from "@/data/mock";

// Figma Desktop-10 149:3832
// Reads the exam type from the URL; all pages are pre-built, so blocking is fine (no loading design yet).
export const instant = false;

export default async function TerverifikasiPage({ params }: PageProps<"/faskes/pemeriksaan/[jenis]/terverifikasi">) {
  const { jenis } = await params;
  const exam = examTypes.find((e) => e.slug === jenis);
  if (!exam) notFound();

  return (
    <PageShell crumbs={["Detail Pemeriksaan", `${exam.label} - Terverifikasi`]}>
      <ExamTabs exam={exam} active="terverifikasi" />
      <ExamTable rows={exams.filter((e) => e.type === exam.slug && e.verifiedAt)} pageSize={10} tools />
    </PageShell>
  );
}
