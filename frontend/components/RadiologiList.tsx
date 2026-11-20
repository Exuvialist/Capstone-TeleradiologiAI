"use client";

import ExamTable from "@/components/ExamTable";
import { useRadiologistExams } from "@/components/VerificationProvider";

// Dr. Shinyu's queue (Desktop-20) or verified cases (Desktop-31), including verifications made in this browser.
export default function RadiologiList({ verified }: { verified: boolean }) {
  const rows = useRadiologistExams().filter((e) => !!e.verifiedAt === verified);
  return <ExamTable rows={rows} kind={verified ? "riwayatRadiologi" : "antrean"} pageSize={10} tools="filters" />;
}
