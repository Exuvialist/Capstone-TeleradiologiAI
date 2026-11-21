"use client";

import Link from "next/link";
import { ChevronRight } from "react-feather";
import { useDrafts } from "@/components/DraftProvider";

// Same table style as ExamTable: 42px rows, text centered, cut after two lines.
const grid = "grid flex-1 items-center gap-4.5 max-w-[486px] grid-cols-[repeat(3,minmax(0,150fr))]";
const columns = ["ID Rekam Medis", "Nama Pasien", "Tanggal Disimpan"];
const pad = (n: number) => String(n).padStart(2, "0");
const savedLabel = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

export default function DraftList({ type, buatHref }: { type: string; buatHref: string }) {
  const { drafts, open } = useDrafts(type);

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-300 p-3">
      <div className="flex min-w-[500px] flex-col gap-3">
        <div className="flex h-[42px] items-center gap-1.5 font-bold">
          <span className="flex min-w-0 flex-1">
            <span className={grid}>
              {columns.map((c) => (
                <span key={c} className="line-clamp-2">
                  {c}
                </span>
              ))}
            </span>
          </span>
          <span className="w-5 shrink-0" />
        </div>
        {/* -mb-px: Figma's divider takes no height */}
        <div className="-mb-px h-px bg-neutral-300" />
        <div className="flex flex-col gap-4.5 py-1.5">
          {drafts.length === 0 && <p className="flex h-[42px] items-center">Belum ada draft.</p>}
          {/* A row opens Buat Pemeriksaan with the draft filled in */}
          {drafts.map((d) => (
            <Link key={d.id} href={buatHref} onClick={() => open(d)} className="flex h-[42px] items-center gap-1.5">
              <span className="flex min-w-0 flex-1">
                <span className={grid}>
                  {[d.medicalRecordNo || "-", d.patientName || "-", savedLabel(d.savedAt)].map((text, i) => (
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
  );
}
