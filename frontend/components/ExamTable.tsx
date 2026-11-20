"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight } from "react-feather";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import SearchField from "@/components/SearchField";
import SearchSort from "@/components/SearchSort";
import { examTypes, type Exam } from "@/data/mock";

const toDate = (d: string) => d.split("-").reverse().join("/");
const labelOf = (e: Exam) => examTypes.find((t) => t.slug === e.type)!.label;
const result = (e: Exam, positive: boolean) => (positive ? labelOf(e) : `Bukan ${labelOf(e)}`);
const detected = (positive: boolean | null) => (positive === null ? "Dalam Antrean" : positive ? "Terdeteksi" : "Tidak terdeteksi");

// Columns 150/150/200/150/150/150 px at full width (1040px, as in Figma); they shrink together on narrower screens.
const faskesGrid = "max-w-[1040px] grid-cols-[repeat(2,minmax(0,150fr))_minmax(0,200fr)_repeat(3,minmax(0,150fr))]";
const faskesHref = (e: Exam) => `/faskes/pemeriksaan/${e.type}/${e.id}`;

// One column set per table design. `search` is the text the search bar matches.
const kinds = {
  // Desktop-9 147:392, Desktop-10 149:3832, Desktop-16 166:5125, Desktop-8 132:438
  faskes: {
    columns: ["ID Rekam Medis", "Nama Pasien", "AI Confidence Score", "Radiologi", "Tanggal Verifikasi", "Hasil Verifikasi"],
    grid: faskesGrid,
    cells: (e: Exam) => [
      e.medicalRecordNo,
      e.patientName,
      `${result(e, e.aiPositive)} | ${e.aiScore}%`,
      e.radiologist ?? "-",
      e.verifiedAt ? toDate(e.verifiedAt) : "-",
      e.verdictPositive === null ? "Dalam Antrean" : result(e, e.verdictPositive),
    ],
    href: faskesHref,
    search: (e: Exam) => `${e.medicalRecordNo} ${e.patientName}`,
  },
  // Faskes dashboard, Desktop-12 163:737
  dashboard: {
    columns: ["ID Rekam Medis", "Nama Pasien", "Confidence Score AI", "Dokter Radiologi", "Tanggal Verifikasi", "Hasil Verifikasi"],
    grid: faskesGrid,
    cells: (e: Exam) => [
      e.medicalRecordNo,
      e.patientName,
      `${result(e, e.aiPositive)} | ${e.aiScore}%`,
      e.radiologist ?? "-",
      e.verifiedAt ? toDate(e.verifiedAt) : "-",
      detected(e.verdictPositive),
    ],
    href: faskesHref,
    search: (e: Exam) => `${e.medicalRecordNo} ${e.patientName}`,
  },
  // Radiologi queue: Antrean Verifikasi Desktop-20 243:1046 and the Radiologi dashboard Desktop-17 228:681 (150/150/150/150/200 px)
  antrean: {
    columns: ["ID Rekam Medis", "Jenis Pemeriksaan", "Asal Faskes", "Tanggal Masuk", "Confidence Score AI"],
    grid: "max-w-[872px] grid-cols-[repeat(4,minmax(0,150fr))_minmax(0,200fr)]",
    cells: (e: Exam) => [e.medicalRecordNo, labelOf(e), e.faskes, toDate(e.submittedAt), `${result(e, e.aiPositive)} | ${e.aiScore}%`],
    href: (e: Exam) => `/radiologi/antrean/${e.id}`,
    search: (e: Exam) => `${e.medicalRecordNo} ${e.faskes}`,
  },
  // Radiologi Riwayat, Desktop-31 243:4136 (150/150/200/150/150 px)
  riwayatRadiologi: {
    columns: ["ID Rekam Medis", "Jenis Pemeriksaan", "Hasil Verifikasi", "Asal Faskes", "Tanggal Verifikasi"],
    grid: "max-w-[872px] grid-cols-[repeat(2,minmax(0,150fr))_minmax(0,200fr)_repeat(2,minmax(0,150fr))]",
    cells: (e: Exam) => [e.medicalRecordNo, labelOf(e), detected(e.verdictPositive), e.faskes, e.verifiedAt ? toDate(e.verifiedAt) : "-"],
    href: (e: Exam) => `/radiologi/riwayat/${e.id}`,
    search: (e: Exam) => `${e.medicalRecordNo} ${e.faskes}`,
  },
};

const dateOf = (e: Exam) => e.verifiedAt ?? e.submittedAt;

const sorts = [
  { label: "Terbaru → Terlama", compare: (a: Exam, b: Exam) => dateOf(b).localeCompare(dateOf(a)) },
  { label: "Terlama → Terbaru", compare: (a: Exam, b: Exam) => dateOf(a).localeCompare(dateOf(b)) },
  { label: "Nama A–Z", compare: (a: Exam, b: Exam) => a.patientName.localeCompare(b.patientName) },
  { label: "Confidence tertinggi", compare: (a: Exam, b: Exam) => b.aiScore - a.aiScore },
];

// Radiologi filters (Desktop-20 / -31). Index 0 = everything.
const typeOptions = ["Semua", ...examTypes.map((t) => t.label)];
const resultOptions = ["Semua", "Terdeteksi", "Tidak terdeteksi"];

type Props = {
  rows: Exam[];
  kind?: keyof typeof kinds;
  pageSize?: number; // no pagination when left out
  tools?: boolean; // search + sort (Faskes) or search + filters (Radiologi) above the table
  typeBar?: boolean; // colored exam-type bar at the start of each row
};

export default function ExamTable({ rows, kind = "faskes", pageSize, tools = false, typeBar = false }: Props) {
  const { columns, grid, cells, href, search } = kinds[kind];
  const radiologi = kind === "antrean" || kind === "riwayatRadiologi";
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(0);
  const [typeFilter, setTypeFilter] = useState(0);
  const [resultFilter, setResultFilter] = useState(0);
  const [page, setPage] = useState(1);

  const q = query.toLowerCase();
  const shown = rows
    .filter((e) => search(e).toLowerCase().includes(q))
    .filter((e) => typeFilter === 0 || e.type === examTypes[typeFilter - 1].slug)
    .filter((e) => resultFilter === 0 || e.verdictPositive === (resultFilter === 1))
    .sort(sorts[sort].compare);
  const size = pageSize ?? shown.length;
  const pageCount = Math.max(1, Math.ceil(shown.length / size));
  const pageRows = shown.slice((page - 1) * size, page * size);

  // Every search, sort or filter change goes back to page 1
  const reset =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      setPage(1);
    };

  return (
    <>
      {tools && !radiologi && (
        <SearchSort
          searchLabel="Cari ID Rekam Medis atau nama pasien"
          query={query}
          onQuery={reset(setQuery)}
          sorts={sorts.map((option) => option.label)}
          sort={sort}
          onSort={reset(setSort)}
        />
      )}
      {tools && radiologi && (
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
          <SearchField aria-label="Cari ID Rekam Medis atau asal faskes" value={query} onChange={(e) => reset(setQuery)(e.target.value)} />
          <Dropdown label="Jenis Pemeriksaan" options={typeOptions} value={typeFilter} onChange={reset(setTypeFilter)} />
          <Dropdown label="Tanggal" options={sorts.slice(0, 2).map((option) => option.label)} value={sort} onChange={reset(setSort)} />
          {kind === "riwayatRadiologi" && (
            <Dropdown label="Hasil Verifikasi" options={resultOptions} value={resultFilter} onChange={reset(setResultFilter)} />
          )}
        </div>
      )}

      {/* Scrolls sideways only when the screen is too narrow for the columns */}
      <div className="overflow-x-auto rounded-lg border border-neutral-300 p-3">
        <div className="flex min-w-[760px] flex-col gap-3">
          {/* Every row (header too) is 2 lines tall, text centered; longer text is cut with "…" */}
          <div className="flex h-[42px] items-center gap-1.5 font-bold">
            <span className="flex min-w-0 flex-1 items-center gap-1">
              {typeBar && <span className="w-1 shrink-0" />}
              <span className={`grid flex-1 items-center gap-4.5 ${grid}`}>
                {columns.map((label) => (
                  <span key={label} className="line-clamp-2">
                    {label}
                  </span>
                ))}
              </span>
            </span>
            <span className="w-5 shrink-0" />
          </div>
          {/* -mb-px: Figma's divider takes no height */}
          <div className="-mb-px h-px bg-neutral-300" />
          <div className="flex flex-col gap-4.5 py-1.5">
            {pageRows.map((e) => (
              <Link key={e.id} href={href(e)} className="flex h-[42px] items-center gap-1.5">
                <span className="flex min-w-0 flex-1 items-center gap-1">
                  {typeBar && <span className={`h-[21px] w-1 shrink-0 rounded-sm ${examTypes.find((t) => t.slug === e.type)!.color}`} />}
                  <span className={`grid flex-1 items-center gap-4.5 ${grid}`}>
                    {cells(e).map((text, i) => (
                      <span key={i} className="line-clamp-2">
                        {text}
                      </span>
                    ))}
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {pageSize && (
        <div className="mt-[15px] flex items-center justify-end gap-3">
          <Button variant="outline" aria-label="Halaman sebelumnya" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ArrowLeft />
          </Button>
          <span>
            {page}/{pageCount}
          </span>
          <Button variant="outline" aria-label="Halaman berikutnya" disabled={page === pageCount} onClick={() => setPage(page + 1)}>
            <ArrowRight />
          </Button>
        </div>
      )}
    </>
  );
}
