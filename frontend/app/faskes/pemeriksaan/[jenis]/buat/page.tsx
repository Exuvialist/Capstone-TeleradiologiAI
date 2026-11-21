import { notFound } from "next/navigation";
import ExamTabs from "@/components/ExamTabs";
import PageShell from "@/components/PageShell";
import { examTypes } from "@/data/mock";
import BuatForm from "./BuatForm";

// Reads the exam type from the URL; all pages are pre-built, so blocking is fine (no loading design yet).
export const instant = false;

export default async function BuatPage({ params }: PageProps<"/faskes/pemeriksaan/[jenis]/buat">) {
  const { jenis } = await params;
  const exam = examTypes.find((e) => e.slug === jenis);
  if (!exam) notFound();

  return (
    <PageShell crumbs={["Detail Pemeriksaan", `${exam.label} - Buat Pemeriksaan`]}>
      {/* Fills the window (minus the 64px top bar and 40px padding) so the footer buttons stay at the bottom */}
      <div className="flex min-h-[calc(100vh-104px)] flex-col">
        <ExamTabs exam={exam} active="buat" />
        <BuatForm
          type={exam.slug}
          detailHref={`/faskes/pemeriksaan/${exam.slug}/${exam.prefix}-0123`}
          draftsHref={`/faskes/pemeriksaan/${exam.slug}/drafts`}
        />
      </div>
    </PageShell>
  );
}
