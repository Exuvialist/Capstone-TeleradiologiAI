"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { Printer } from "react-feather";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import type { Exam } from "@/data/mock";

// The report of a verified exam. The browser's print window opens once the images have loaded,
// so it can be saved as PDF ("Save as PDF"). Sidebar, top bar and these buttons are hidden when printing.
const label = "text-b4 font-bold";
const toDate = (d: string) => d.split("-").reverse().join("/");
const today = () => new Date().toLocaleDateString("en-GB"); // dd/mm/yyyy
const noSubscribe = () => () => {};

function Fields({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-2 gap-3">
      {items.map(([name, value]) => (
        <div key={name} className="flex flex-col gap-1">
          <dt className={label}>{name}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Report({ exam, examLabel }: { exam: Exam; examLabel: string }) {
  const printedAt = useSyncExternalStore(noSubscribe, today, () => "");
  const printed = useRef(false);
  const result = (positive: boolean) => (positive ? examLabel : `Bukan ${examLabel}`);
  const [year, month, day] = exam.birthDate.split("-");

  useEffect(() => {
    if (printed.current) return; // once (React runs effects twice in development)
    printed.current = true;
    const images = [...document.querySelectorAll<HTMLImageElement>("#laporan img")];
    const loaded = images.map((img) => img.complete || new Promise((done) => (img.onload = img.onerror = done)));
    Promise.all(loaded).then(() => window.print());
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <BackButton />
        <Button variant="neutral" onClick={() => window.print()}>
          <Printer />
          Cetak / Simpan PDF
        </Button>
      </div>

      {/* 794px = A4 width on screen */}
      <article id="laporan" className="mx-auto flex w-full max-w-[794px] flex-col gap-5 rounded-lg border border-neutral-300 p-8 print:max-w-none print:border-0 print:p-0">
        <header className="flex items-center justify-between gap-3 border-b border-neutral-300 pb-4">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="flex size-9 items-center justify-center rounded-md bg-neutral-800 text-neutral-100 [print-color-adjust:exact]">T</span>
            Teleradiologi AI
          </span>
          <span className="text-b4">Dicetak {printedAt}</span>
        </header>

        <div>
          <h1 className="text-h8">Laporan Pemeriksaan {examLabel}</h1>
          <p>
            #{exam.id} · {exam.faskes}
          </p>
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="font-bold">Data Pasien</h2>
          <Fields
            items={[
              ["ID Rekam Medis", exam.medicalRecordNo],
              ["Nama Pasien", exam.patientName],
              ["Tanggal Lahir", `${day} / ${month} / ${year}`],
              ["Jenis Kelamin", exam.gender],
              ["Asal Faskes", exam.faskes],
              ["Tanggal Masuk", toDate(exam.submittedAt)],
            ]}
          />
        </section>

        <section className="flex flex-col gap-1">
          <h2 className="font-bold">Gejala Klinis</h2>
          <p>{exam.symptoms}</p>
        </section>

        <section className="flex break-inside-avoid flex-col gap-2">
          <h2 className="font-bold">Citra X-ray</h2>
          {exam.images.map((src) => (
            <div key={src} className="relative h-[320px] overflow-hidden rounded-md border border-neutral-300 bg-neutral-200 print:h-[240px]">
              <Image src={src} alt={`Citra X-ray ${exam.id}`} fill sizes="794px" loading="eager" className="object-contain" />
            </div>
          ))}
        </section>

        <section className="flex break-inside-avoid flex-col gap-2">
          <h2 className="font-bold">Hasil</h2>
          <Fields
            items={[
              ["Hasil Analisis AI", `${result(exam.aiPositive)} | ${exam.aiScore}%`],
              ["Dokter Radiologi", exam.radiologist ?? "-"],
              ["Tanggal Verifikasi", toDate(exam.verifiedAt!)],
              [
                "Hasil Verifikasi",
                <>
                  <span className="block font-bold">{result(exam.verdictPositive!)}</span>
                  {exam.verdictPositive !== exam.aiPositive && <span className="block text-b4">(Hasil Deteksi AI ditolak)</span>}
                </>,
              ],
            ]}
          />
          <div className="flex flex-col gap-1">
            <span className={label}>Catatan</span>
            <p>{exam.note ?? "-"}</p>
          </div>
        </section>
      </article>
    </div>
  );
}
