import ExamTable from "@/components/ExamTable";
import PageShell from "@/components/PageShell";
import { exams } from "@/data/mock";

// Figma Desktop-16 166:5125: all verified exams, colored bar = exam type
export default function FaskesRiwayatPage() {
  return (
    <PageShell crumbs={["Riwayat"]}>
      <h1 className="mb-2.5 flex h-[27px] items-center text-b1 font-bold">Riwayat Kasus Terverifikasi</h1>
      <ExamTable rows={exams.filter((e) => e.verifiedAt)} pageSize={13} typeBar />
    </PageShell>
  );
}
