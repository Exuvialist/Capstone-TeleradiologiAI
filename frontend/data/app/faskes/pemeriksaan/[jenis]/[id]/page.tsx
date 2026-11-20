import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { exams, examTypes } from "@/data/mock";

// Pre-builds every dummy exam of this type (PN-0123, PN-0124, …).
export function generateStaticParams({ params }: { params: { jenis: string } }) {
  return exams.filter((e) => e.type === params.jenis).map((e) => ({ id: e.id }));
}

// Placeholder: the detail content comes in Phase 6.
// Reads the exam type from the URL; all pages are pre-built, so blocking is fine (no loading design yet).
export const instant = false;

export default async function DetailPage({ params }: PageProps<"/faskes/pemeriksaan/[jenis]/[id]">) {
  const { jenis, id } = await params;
  const exam = examTypes.find((e) => e.slug === jenis);
  if (!exam) notFound();

  return <PageShell crumbs={["Detail Pemeriksaan", exam.label, `#${id}`]} />;
}
