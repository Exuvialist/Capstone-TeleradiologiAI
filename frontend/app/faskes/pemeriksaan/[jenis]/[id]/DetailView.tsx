"use client";

import { useAssignments } from "@/components/AssignmentProvider";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import ImageViewer from "@/components/ImageViewer";
import { InfoBox, InfoRow } from "@/components/InfoBox";
import type { Exam } from "@/data/mock";

// Figma: Desktop-4 125:12044 (AI result), Desktop-6 127:13135 (auto-assigned),
// Desktop-15 166:4682 (assigned to a radiologist), Desktop-14 166:4367 (verified).
const filled = "rounded-md border border-primary-300 bg-primary-100 p-[7px]";
const label = "text-b4 font-bold";
const panel = "rounded-lg border border-neutral-300 p-3";

export default function DetailView({ exam, examLabel, href }: { exam: Exam; examLabel: string; href: string }) {
  const { assignments, assign } = useAssignments();
  const assigned = assignments[exam.id]; // made in this browser, overrides the dummy data
  const radiologist = assigned ? assigned.radiologist : exam.radiologist;
  const autoAssigned = assigned ? assigned.radiologist === null : exam.autoAssigned;
  const state = exam.verifiedAt ? "verified" : radiologist ? "assigned" : autoAssigned ? "auto" : "ai";

  const result = (positive: boolean) => (positive ? examLabel : `Bukan ${examLabel}`);
  const ai = `${result(exam.aiPositive)} | ${exam.aiScore}%`;
  const [year, month, day] = exam.birthDate.split("-");

  return (
    <div className="flex min-h-[calc(100vh-104px)] flex-col">
      <BackButton />

      <div className={`${panel} mt-5 grid grid-cols-1 gap-4.5 @2xl:grid-cols-2`}>
        <div className="flex flex-col gap-3">
          <section className="flex flex-col gap-1.5">
            <h2 className="font-bold">Data Pasien</h2>
            <div className={`${panel} flex flex-col gap-3`}>
              <div className="flex flex-col gap-1">
                <span className={label}>ID Rekam Medis</span>
                <span className={filled}>{exam.medicalRecordNo}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={label}>Nama Pasien</span>
                <span className={filled}>{exam.patientName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={label}>Tanggal Lahir</span>
                <span className="flex items-center gap-1 text-center">
                  <span className={`${filled} w-[37px]`}>{day}</span>
                  <span className="w-[7px]">/</span>
                  <span className={`${filled} w-[37px]`}>{month}</span>
                  <span className="w-[7px]">/</span>
                  <span className={`${filled} w-[53px]`}>{year}</span>
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={label}>Jenis Kelamin</span>
                <span className="flex gap-2">
                  {["Laki-Laki", "Perempuan"].map((option) => (
                    <span
                      key={option}
                      className={`rounded-md border p-[7px] ${option === exam.gender ? "border-neutral-800 bg-neutral-800 text-neutral-100" : "border-neutral-400"}`}
                    >
                      {option}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </section>
          <div className="flex flex-1 flex-col gap-1">
            <span className={label}>Gejala Klinis</span>
            <p className={`${filled} min-h-[140px] flex-1`}>{exam.symptoms}</p>
          </div>
        </div>

        <section className="flex flex-col gap-1.5">
          <h2 className="font-bold">{state === "verified" ? "Hasil Radiologi" : "Hasil"}</h2>
          <div className={`${panel} flex flex-col gap-3`}>
            {state === "ai" && (
              <div className="flex flex-col gap-1">
                <span className={label}>Hasil Analisis AI</span>
                <div className="flex items-center justify-between rounded-md border border-secondary-300 bg-secondary-200 p-2 text-secondary-1000">
                  <span className="text-b2 font-bold">{result(exam.aiPositive)}</span>
                  <span>
                    Confidence Score: <b>{exam.aiScore}%</b>
                  </span>
                </div>
              </div>
            )}
            {(state === "auto" || state === "assigned") && (
              <InfoBox>
                <InfoRow label="Status">Menunggu Verifikasi</InfoRow>
                {state === "assigned" && <InfoRow label="Nama Radiologi">{radiologist}</InfoRow>}
                <InfoRow label="Hasil Analisis AI">{ai}</InfoRow>
              </InfoBox>
            )}
            {state === "verified" && exam.verdictPositive !== null && (
              <InfoBox>
                <InfoRow label="Nama Radiologi">{radiologist}</InfoRow>
                <InfoRow label="Tanggal diverifikasi">{exam.verifiedAt!.split("-").reverse().join("/")}</InfoRow>
                <InfoRow label="Hasil Verifikasi">
                  <span className="block font-bold">{result(exam.verdictPositive)}</span>
                  {exam.verdictPositive !== exam.aiPositive && <span className="block text-b4">(Hasil Deteksi AI ditolak)</span>}
                </InfoRow>
                <div>
                  <span className={`${label} block`}>Catatan</span>
                  <p>{exam.note}</p>
                </div>
              </InfoBox>
            )}
            <ImageViewer images={exam.images} />
          </div>
        </section>
      </div>

      {state === "verified" && (
        <div className="sticky bottom-5 mt-auto flex justify-end gap-[9px] pt-5">
          {/* Opens the printable report (save it as PDF from the print window) */}
          <Button variant="neutral" href={`${href}/laporan`} className="flex-1 justify-center @md:w-[188px] @md:flex-none">
            Export Laporan
          </Button>
        </div>
      )}
      {state === "ai" && (
        <div className="sticky bottom-5 mt-auto flex justify-end gap-[9px] pt-5">
          <Button variant="outline" href={`${href}/assign`} className="flex-1 justify-center @md:w-[188px] @md:flex-none">
            Manual Assignment
          </Button>
          <Button variant="neutral" onClick={() => assign(exam.id, null)} className="flex-1 justify-center @md:w-[188px] @md:flex-none">
            Automatic Assignment
          </Button>
        </div>
      )}
    </div>
  );
}
