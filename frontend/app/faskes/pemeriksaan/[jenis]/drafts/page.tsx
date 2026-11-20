import { notFound } from "next/navigation";
import ExamTabs from "@/components/ExamTabs";
import PageShell from "@/components/PageShell";
import { examTypes } from "@/data/mock";
import DraftList from "./DraftList";

// No Figma frame: the "Drafts Pemeriksaan" button's page, a table in the style of Dalam Proses.
// Reads the exam type from the URL; all pages are pre-built, so blocking is fine (no loading design yet).
export const instant = false;

export default async function DraftsPage({ params }: PageProps<"/faskes/pemeriksaan/[jenis]/drafts">) {
  const { jenis } = await params;
  const exam = examTypes.find((e) => e.slug === jenis);
  if (!exam) notFound();

  return (
    <PageShell crumbs={["Detail Pemeriksaan", `${exam.label} - Drafts Pemeriksaan`]}>
      <ExamTabs exam={exam} active="drafts" />
      <DraftList type={exam.slug} buatHref={`/faskes/pemeriksaan/${exam.slug}/buat`} />
    </PageShell>
  );
}
