"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import ImageViewer from "@/components/ImageViewer";
import { InfoBox, InfoRow } from "@/components/InfoBox";
import { useRadiologistExams, useVerification } from "@/components/VerificationProvider";
import { examTypes } from "@/data/mock";

// Radiologi verify page. Figma: Desktop-29 243:3136 (nothing chosen), Desktop-30 243:3983 (Tolak chosen, reason filled).
// Verified cases (opened from Riwayat, or after Konfirmasi) show the same page read-only.
const label = "text-b4 font-bold";
const panel = "rounded-lg border border-neutral-300 p-3";
const field =
  "rounded-md border border-neutral-400 bg-neutral-100 p-[7px] placeholder:text-neutral-400 not-placeholder-shown:border-primary-300 not-placeholder-shown:bg-primary-100";

export default function VerifyView({ id }: { id: string }) {
  const router = useRouter();
  const { verify } = useVerification();
  const exam = useRadiologistExams().find((e) => e.id === id)!;
  const examLabel = examTypes.find((t) => t.slug === exam.type)!.label;
  const result = (positive: boolean) => (positive ? examLabel : `Bukan ${examLabel}`);
  const readOnly = !!exam.verifiedAt;

  // The radiologist's result (true = disease present). Terima/Tolak and the Keputusan Radiologi menu set the same value.
  const [decision, setDecision] = useState(exam.verdictPositive);
  const [note, setNote] = useState(exam.note ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const accepted = decision === null ? null : decision === exam.aiPositive;
  const [year, month, day] = exam.birthDate.split("-");

  const confirm = () => {
    // Verification date = today (local time, YYYY-MM-DD)
    verify(exam.id, { verifiedAt: new Date().toLocaleDateString("en-CA"), verdictPositive: decision, note: note.trim() || null });
    router.push("/radiologi/antrean");
  };

  // Terima (green) / Tolak (red): light until chosen, solid when chosen
  const choice = (accept: boolean) => {
    const on = accepted === accept;
    const colors = accept
      ? on
        ? "border-green-200 bg-green-200 font-bold text-neutral-100"
        : "border-green-200 bg-green-alpha-10"
      : on
        ? "border-red-200 bg-red-200 font-bold text-neutral-100"
        : "border-red-100 bg-red-alpha-10";
    return (
      <button
        type="button"
        aria-pressed={on}
        disabled={readOnly}
        onClick={() => setDecision(accept ? exam.aiPositive : !exam.aiPositive)}
        className={`flex flex-1 cursor-pointer justify-center rounded-md border p-[7px] disabled:cursor-default ${colors}`}
      >
        {accept ? "Terima Hasil AI" : "Tolak Hasil AI"}
      </button>
    );
  };

  return (
    <div className="flex flex-col">
      <BackButton />

      {/* Side by side from 896px of content, stacked below */}
      <div className={`${panel} mt-5 flex flex-col gap-4.5 @4xl:flex-row @4xl:items-start`}>
        <div className="flex min-w-0 flex-1 flex-col gap-4.5">
          <section className="flex flex-col gap-1">
            <h2 className="font-bold">Data Pasien</h2>
            <div className={`${panel} flex flex-col gap-4`}>
              <dl className="grid grid-cols-2 gap-3">
                {[
                  ["ID Rekam Medis", exam.medicalRecordNo],
                  ["Nama Pasien", exam.patientName],
                  ["Tanggal Lahir", `${day} / ${month} / ${year}`],
                  ["Jenis Kelamin", exam.gender],
                ].map(([name, value]) => (
                  <div key={name} className="flex flex-col gap-1">
                    <dt className={label}>{name}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-col gap-1">
                <span className={label}>Gejala Klinis</span>
                <p>{exam.symptoms}</p>
              </div>
            </div>
          </section>
          <div className={`${panel} flex flex-col gap-3`}>
            <ImageViewer images={exam.images} compact />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-4.5 @4xl:w-[426px]">
          <section className="flex w-full flex-col gap-1.5">
            <h2 className="font-bold">Keputusan</h2>
            <div className={`${panel} flex h-[435px] flex-col gap-3`}>
              <InfoBox>
                <InfoRow label="Status">{readOnly ? "Terverifikasi" : "Menunggu Verifikasi"}</InfoRow>
                <InfoRow label="Hasil Analisis AI">
                  {result(exam.aiPositive)} | {exam.aiScore}%
                </InfoRow>
              </InfoBox>
              <div className="flex flex-col gap-1">
                <span className={label}>Verifikasi</span>
                <div className="flex w-full max-w-[300px] gap-2">
                  {choice(true)}
                  {choice(false)}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className={label}>Keputusan Radiologi</span>
                <div className="relative">
                  <button
                    type="button"
                    aria-expanded={menuOpen}
                    disabled={readOnly}
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={`flex w-full cursor-pointer rounded-md border p-[7px] disabled:cursor-default ${
                      decision === null ? "border-neutral-400 bg-neutral-100 text-neutral-400" : "border-primary-300 bg-primary-100"
                    }`}
                  >
                    {decision === null ? "Keputusan Radiologi" : result(decision)}
                  </button>
                  {/* Same light-blue style as the sort menu */}
                  {menuOpen && (
                    <div className="absolute top-full left-0 z-10 mt-1 flex w-full flex-col gap-1 rounded-sm border border-primary-200 bg-primary-100 p-1">
                      {[true, false].map((positive) => (
                        <button
                          key={String(positive)}
                          type="button"
                          onClick={() => {
                            setDecision(positive);
                            setMenuOpen(false);
                          }}
                          className={`flex w-full cursor-pointer items-center rounded-md p-2 hover:bg-primary-200 ${positive === decision ? "font-bold" : ""}`}
                        >
                          {result(positive)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <label className="flex flex-1 flex-col gap-1">
                <span className={label}>Alasan Modifikasi</span>
                <textarea
                  placeholder="Alasan Modifikasi"
                  value={note}
                  readOnly={readOnly}
                  onChange={(e) => setNote(e.target.value)}
                  className={`${field} flex-1 resize-none`}
                />
              </label>
            </div>
          </section>

          {/* Shows once a decision is picked; rejecting the AI needs a reason */}
          {!readOnly && decision !== null && (
            <Button variant="neutral" disabled={!accepted && !note.trim()} onClick={confirm} className="w-[188px] justify-center">
              Konfirmasi Keputusan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
