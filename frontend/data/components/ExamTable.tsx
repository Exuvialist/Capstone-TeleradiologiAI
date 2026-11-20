"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Filter } from "react-feather";
import Button from "@/components/Button";
import SearchField from "@/components/SearchField";
import { examTypes, type Exam } from "@/data/mock";

// Figma: Desktop-9 147:392 and Desktop-10 149:3832 (with search + sort), Desktop-16 166:5125 (with type bar)
const columns = [
  { label: "ID Rekam Medis", width: "w-[150px]" },
  { label: "Nama Pasien", width: "w-[150px]" },
  { label: "AI Confidence Score", width: "w-[200px]" },
  { label: "Radiologi", width: "w-[150px]" },
  { label: "Tanggal Verifikasi", width: "w-[150px]" },
  { label: "Hasil Verifikasi", width: "w-[150px]" },
];

const dateOf = (e: Exam) => e.verifiedAt ?? e.submittedAt;

const sorts = [
  { label: "Terbaru → Terlama", compare: (a: Exam, b: Exam) => dateOf(b).localeCompare(dateOf(a)) },
  { label: "Terlama → Terbaru", compare: (a: Exam, b: Exam) => dateOf(a).localeCompare(dateOf(b)) },
  { label: "Nama A–Z", compare: (a: Exam, b: Exam) => a.patientName.localeCompare(b.patientName) },
  { label: "Confidence tertinggi", compare: (a: Exam, b: Exam) => b.aiScore - a.aiScore },
];

const menuItem = "flex w-full cursor-pointer items-center rounded-md p-2 hover:bg-primary-200";

function cells(e: Exam) {
  const { label } = examTypes.find((t) => t.slug === e.type)!;
  const result = (positive: boolean) => (positive ? label : `Bukan ${label}`);
  return [
    e.medicalRecordNo,
    e.patientName,
    `${result(e.aiPositive)} | ${e.aiScore}%`,
    e.radiologist,
    e.verifiedAt ? e.verifiedAt.split("-").reverse().join("/") : "-",
    e.verdictPositive === null ? "Dalam Antrean" : result(e.verdictPositive),
  ];
}

type Props = {
  rows: Exam[];
  pageSize: number;
  tools?: boolean; // search + sort above the table
  typeBar?: boolean; // colored exam-type bar at the start of each row
};

export default function ExamTable({ rows, pageSize, tools = false, typeBar = false }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState(1);

  const q = query.toLowerCase();
  const shown = rows
    .filter((e) => `${e.medicalRecordNo} ${e.patientName}`.toLowerCase().includes(q))
    .sort(sorts[sort].compare);
  const pageCount = Math.max(1, Math.ceil(shown.length / pageSize));
  const pageRows = shown.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      {tools && (
        <div className="relative mb-2.5 flex items-center gap-1.5">
          <SearchField
            aria-label="Cari ID Rekam Medis atau nama pasien"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          <Button variant="outline" aria-label="Urutkan" selected={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            <Filter />
          </Button>
          {menuOpen && (
            <div className="absolute top-full left-[311px] z-10 mt-1 flex w-max flex-col gap-1 rounded-sm border border-primary-200 bg-primary-100 p-1">
              {sorts.map((option, i) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => {
                    setSort(i);
                    setPage(1);
                    setMenuOpen(false);
                  }}
                  className={`${menuItem} ${i === sort ? "font-bold" : ""}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-lg border border-neutral-300 p-3">
        <div className="flex gap-1 font-bold">
          {typeBar && <span className="w-1 shrink-0" />}
          <div className="flex gap-4.5">
            {columns.map((c) => (
              <span key={c.label} className={c.width}>
                {c.label}
              </span>
            ))}
          </div>
        </div>
        {/* -mb-px: Figma's divider takes no height */}
        <div className="-mb-px h-px bg-neutral-300" />
        <div className="flex flex-col gap-4.5 py-1.5">
          {pageRows.map((e) => (
            <Link key={e.id} href={`/faskes/pemeriksaan/${e.type}/${e.id}`} className="flex items-start justify-between">
              <span className="flex items-center gap-1">
                {typeBar && <span className={`h-[21px] w-1 shrink-0 rounded-sm ${examTypes.find((t) => t.slug === e.type)!.color}`} />}
                <span className="flex gap-4.5">
                  {cells(e).map((text, i) => (
                    <span key={i} className={columns[i].width}>
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
    </>
  );
}
