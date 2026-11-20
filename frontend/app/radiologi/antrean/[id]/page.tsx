import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import VerifyView from "@/components/VerifyView";
import { examTypes, radiologistExams } from "@/data/mock";

// Figma: Desktop-29 243:3136, Desktop-30 243:3983
// Reads the exam ID from the URL; all pages are pre-built, so blocking is fine (no loading design yet).
export const instant = false;

export function generateStaticParams() {
  return radiologistExams.map((e) => ({ id: e.id }));
}

export default async function VerifyPage({ params }: PageProps<"/radiologi/antrean/[id]">) {
  const { id } = await params;
  const exam = radiologistExams.find((e) => e.id === id);
  if (!exam) notFound();
  const { label } = examTypes.find((t) => t.slug === exam.type)!;

  return (
    <PageShell crumbs={["Antrean Verifikasi", `${label} - #${exam.id}`]}>
      <VerifyView id={exam.id} />
    </PageShell>
  );
}
