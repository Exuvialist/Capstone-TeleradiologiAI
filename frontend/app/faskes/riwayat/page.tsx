import ExamTable from "@/components/ExamTable";
import PageShell from "@/components/PageShell";
import { exams } from "@/data/mock";

// Figma Desktop-16 166:5125: all verified exams, colored bar = exam type.
// Title, divider and filters (search, Jenis Pemeriksaan, Tanggal, Hasil Verifikasi) as on Radiologi Riwayat (Desktop-31).
export default function FaskesRiwayatPage() {
  return (
    <PageShell crumbs={["Riwayat"]}>
      <h1 className="text-b1 font-bold">Riwayat Kasus Terverifikasi</h1>
      <hr className="mt-2.5 mb-[11px] border-neutral-300" />
      <ExamTable rows={exams.filter((e) => e.verifiedAt)} pageSize={13} typeBar tools="filters" />
    </PageShell>
  );
}
