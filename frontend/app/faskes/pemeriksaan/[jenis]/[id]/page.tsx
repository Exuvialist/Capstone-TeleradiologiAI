import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { exams, examTypes } from "@/data/mock";
import DetailView from "./DetailView";

// Reads the exam from the URL; all pages are pre-built, so blocking is fine (no loading design yet).
export const instant = false;

// Pre-builds every dummy exam of this type (PN-0123, PN-0124, …).
export function generateStaticParams({ params }: { params: { jenis: string } }) {
  return exams.filter((e) => e.type === params.jenis).map((e) => ({ id: e.id }));
}

export default async function DetailPage({ params }: PageProps<"/faskes/pemeriksaan/[jenis]/[id]">) {
  const { jenis, id } = await params;
  const type = examTypes.find((t) => t.slug === jenis);
  const exam = exams.find((e) => e.id === id && e.type === jenis);
  if (!type || !exam) notFound();

  return (
    <PageShell crumbs={["Detail Pemeriksaan", type.label, `#${id}`]}>
      <DetailView exam={exam} examLabel={type.label} href={`/faskes/pemeriksaan/${jenis}/${id}`} />
    </PageShell>
  );
}
