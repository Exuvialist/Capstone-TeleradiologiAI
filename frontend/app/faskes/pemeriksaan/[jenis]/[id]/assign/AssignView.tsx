"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAssignments } from "@/components/AssignmentProvider";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import { InfoBox, InfoRow } from "@/components/InfoBox";
import SearchSort from "@/components/SearchSort";
import { radiologists, type Exam } from "@/data/mock";

// Figma Desktop-11 161:494: pick a radiologist, then go back to the detail page (Desktop-15).
type Doctor = (typeof radiologists)[number];

const sorts = [
  { label: "Kasus paling sedikit", compare: (a: Doctor, b: Doctor) => a.pending - b.pending },
  { label: "Pengalaman terlama", compare: (a: Doctor, b: Doctor) => b.experience - a.experience },
  { label: "Nama A–Z", compare: (a: Doctor, b: Doctor) => a.name.localeCompare(b.name) },
];

const filled = "rounded-md border border-primary-300 bg-primary-100 p-[7px]";

export default function AssignView({ exam, examLabel, detailHref }: { exam: Exam; examLabel: string; detailHref: string }) {
  const router = useRouter();
  const { assign } = useAssignments();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(0);

  const doctors = radiologists
    .filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
    .sort(sorts[sort].compare);

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <BackButton />
        <h1 className="text-b1 font-bold">Manual Assignment</h1>
      </div>

      <div className="mt-5 grid grid-cols-1 items-start gap-4.5 @3xl:grid-cols-[519fr_537fr] rounded-lg border border-neutral-300 p-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-b4 font-bold">ID Rekam Medis</span>
            <span className={filled}>{exam.medicalRecordNo}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-b4 font-bold">Nama Pasien</span>
            <span className={filled}>{exam.patientName}</span>
          </div>
        </div>
        <InfoBox>
          <InfoRow label="Status">Menunggu Verifikasi</InfoRow>
          <InfoRow label="Hasil Analisis AI">
            {exam.aiPositive ? examLabel : `Bukan ${examLabel}`} | {exam.aiScore}%
          </InfoRow>
        </InfoBox>
      </div>

      <div className="mt-5">
        <SearchSort
          searchLabel="Cari nama dokter"
          query={query}
          onQuery={setQuery}
          sorts={sorts.map((s) => s.label)}
          sort={sort}
          onSort={setSort}
        />
      </div>

      <div className="grid grid-cols-1 gap-[19px] @xl:grid-cols-2 @4xl:grid-cols-3">
        {doctors.map((doctor) => (
          <div key={doctor.name} className="flex h-[192px] flex-col items-end justify-between rounded-lg border border-neutral-300 p-3">
            <div className="flex w-full flex-col gap-3">
              <span className="text-b2 font-bold">{doctor.name}</span>
              <div className="-mb-px h-px bg-neutral-300" />
              <div className="flex flex-col gap-2">
                <span className="flex gap-4">
                  <span className="w-[175px]">Pengalaman Radiologi</span>
                  {doctor.experience} Tahun
                </span>
                <span className="flex gap-4">
                  <span className="w-[175px]">Jumlah Perlu Diverifikasi</span>
                  {doctor.pending} Kasus
                </span>
              </div>
            </div>
            <Button
              variant="neutral"
              onClick={() => {
                assign(exam.id, doctor.name);
                router.push(detailHref);
              }}
            >
              Assign
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
