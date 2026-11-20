import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { exams, examTypes } from "@/data/mock";
import AssignView from "./AssignView";

// Reads the exam from the URL; all pages are pre-built, so blocking is fine (no loading design yet).
export const instant = false;

export function generateStaticParams({ params }: { params: { jenis: string } }) {
  return exams.filter((e) => e.type === params.jenis).map((e) => ({ id: e.id }));
}

// Figma Desktop-11 161:494
export default async function AssignPage({ params }: PageProps<"/faskes/pemeriksaan/[jenis]/[id]/assign">) {
  const { jenis, id } = await params;
  const type = examTypes.find((t) => t.slug === jenis);
  const exam = exams.find((e) => e.id === id && e.type === jenis);
  if (!type || !exam) notFound();

  return (
    <PageShell crumbs={["Detail Pemeriksaan", type.label, `#${id}`]}>
      <AssignView exam={exam} examLabel={type.label} detailHref={`/faskes/pemeriksaan/${jenis}/${id}`} />
    </PageShell>
  );
}
