"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { ChevronDown, Download } from "react-feather";
import ExamChart, { type Period } from "@/components/ExamChart";
import ExamTable from "@/components/ExamTable";
import { useRadiologistExams } from "@/components/VerificationProvider";
import { examTypes, exams, type Exam } from "@/data/mock";

// Dashboards and the Statistika tab. Figma: Desktop-12 163:737 (Faskes), Desktop-17 228:681 (Radiologi), Desktop-8 132:438 (Statistika).
// Everything (chart, numbers, table) follows the picked date range, counted by the date the exam came in.
type Props = { variant: "faskes" | "radiologi" } | { variant: "statistika"; jenis: string };

const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// Dates are "YYYY-MM-DD" strings.
const shift = (date: string, days: number) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const monthsBack = (date: string, count: number) => {
  const d = new Date(`${date.slice(0, 7)}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - count);
  return d.toISOString().slice(0, 10);
};
const dayMonth = (date: string) => `${+date.slice(8)} ${months[+date.slice(5, 7) - 1]}`;

// "13–19 Okt 2026", "13 Sep – 19 Okt 2026", "13 Des 2025 – 19 Jan 2026"
function rangeLabel(from: string, to: string) {
  const end = `${dayMonth(to)} ${to.slice(0, 4)}`;
  if (from === to) return end;
  if (from.slice(0, 4) !== to.slice(0, 4)) return `${dayMonth(from)} ${from.slice(0, 4)} – ${end}`;
  if (from.slice(5, 7) !== to.slice(5, 7)) return `${dayMonth(from)} – ${end}`;
  return `${+from.slice(8)}–${end}`;
}

// Each button groups the bars and resets the range to end on the "Sampai" date.
const periods = {
  Harian: { unit: "hari", keyLength: 10, from: (to: string) => shift(to, -6) },
  Bulanan: { unit: "bulan", keyLength: 7, from: (to: string) => monthsBack(to, 11) },
  Tahunan: { unit: "tahun", keyLength: 4, from: (to: string) => `${+to.slice(0, 4) - 4}-01-01` },
};

// Chart x-axis label for a day ("13 Okt"), month ("Okt '26", short so 12 months fit) or year ("2026") key.
const keyLabel = (key: string) => {
  const [y, m, d] = key.split("-");
  return d ? dayMonth(key) : m ? `${months[+m - 1]} '${y.slice(2)}` : y;
};

const latest = (rows: Exam[]) =>
  [...rows].sort((a, b) => (b.verifiedAt ?? b.submittedAt).localeCompare(a.verifiedAt ?? a.submittedAt)).slice(0, 5);

export default function Analytics(props: Props) {
  // Default: the dummy data's last week. Switch to today once the backend is in.
  const [range, setRange] = useState({ from: "2026-10-13", to: "2026-10-19" });
  const [period, setPeriod] = useState<Period>("Harian");
  const [open, setOpen] = useState(false);
  const radiologistExams = useRadiologistExams();

  const type = props.variant === "statistika" ? examTypes.find((t) => t.slug === props.jenis)! : null;
  const types = type ? [type] : [...examTypes].reverse(); // Figma order: Tumor Otak, Kanker Tulang, Pneumonia
  const mine = props.variant === "radiologi" ? radiologistExams : exams.filter((e) => !type || e.type === type.slug);
  const inRange = mine.filter((e) => e.submittedAt >= range.from && e.submittedAt <= range.to);
  const verified = inRange.filter((e) => e.verifiedAt);
  const queued = inRange.filter((e) => !e.verifiedAt);

  // One chart item per day / month / year in the range
  const { unit, keyLength } = periods[period];
  const keys: string[] = [];
  for (let d = range.from; d <= range.to; d = shift(d, 1)) {
    if (keys.at(-1) !== d.slice(0, keyLength)) keys.push(d.slice(0, keyLength));
  }
  const data = keys.map((key) => ({
    key,
    label: keyLabel(key),
    ...Object.fromEntries(types.map((t) => [t.slug, inRange.filter((e) => e.type === t.slug && e.submittedAt.startsWith(key)).length])),
  }));

  const doctors = new Set(inRange.map((e) => e.radiologist).filter(Boolean)).size;
  const averageAi = inRange.length ? Math.round(inRange.reduce((sum, e) => sum + e.aiScore, 0) / inRange.length) : 0;
  const stats: { label: string; value: number; unit: string; href?: string }[] =
    props.variant === "faskes"
      ? [
          { label: "Dokter Aktif", value: doctors, unit: "Dokter" },
          { label: "Selesai Diverifikasi", value: verified.length, unit: "Kasus", href: "/faskes/riwayat" },
          { label: "Menunggu Verifikasi", value: queued.length, unit: "Kasus" },
          { label: "Rata-rata Keyakinan AI", value: averageAi, unit: "%" },
        ]
      : props.variant === "radiologi"
        ? [
            { label: "Antrean Verifikasi", value: queued.length, unit: "Kasus", href: "/radiologi/antrean" },
            { label: "Selesai Diverifikasi", value: verified.length, unit: "Kasus", href: "/radiologi/riwayat" },
            {
              label: `Diverifikasi pada ${dayMonth(range.to)}`,
              value: mine.filter((e) => e.verifiedAt === range.to).length,
              unit: "Kasus",
              href: "/radiologi/riwayat",
            },
            { label: "Rata-rata Keyakinan AI", value: averageAi, unit: "%" },
          ]
        : [
            { label: "Jumlah Dokter Aktif", value: doctors, unit: "Dokter" },
            {
              label: `Jumlah Kasus ${type!.label} Terverifikasi`,
              value: verified.length,
              unit: "Kasus",
              href: `/faskes/pemeriksaan/${type!.slug}/terverifikasi`,
            },
            { label: "Jumlah Kasus Tertunda", value: queued.length, unit: "Kasus", href: `/faskes/pemeriksaan/${type!.slug}/dalam-proses` },
          ];

  const download = () => {
    const rows = [["Periode", ...types.map((t) => t.label)], ...data.map((d) => [d.key, ...types.map((t) => d[t.slug as keyof typeof d])])];
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" }));
    link.download = `pemeriksaan_${range.from}_${range.to}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const Title = type ? "h2" : "h1"; // Statistika already has the exam name as its h1

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Title className="text-b1 font-bold">{type ? "Analitik" : "Analitik Pemeriksaan"}</Title>
        <div className="flex items-center gap-5">
          <div className="relative">
            <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex cursor-pointer items-center gap-0.5 font-bold">
              {rangeLabel(range.from, range.to)}
              <ChevronDown className="size-5" />
            </button>
            {/* Same light-blue style as the sort menu */}
            {open && (
              <div className="absolute top-full right-0 z-10 mt-1 flex w-max flex-col gap-1 rounded-sm border border-primary-200 bg-primary-100 p-1">
                {(["from", "to"] as const).map((end) => (
                  <label key={end} className="flex items-center justify-between gap-3 p-2">
                    {end === "from" ? "Dari" : "Sampai"}
                    <input
                      type="date"
                      value={range[end]}
                      min={end === "to" ? range.from : undefined}
                      max={end === "from" ? range.to : "9999-12-31"} // a 4-digit max year keeps both inputs the same width
                      onChange={(e) => e.target.value && setRange({ ...range, [end]: e.target.value })}
                      className="rounded-md border border-neutral-400 bg-neutral-100 p-[7px]"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
          <button type="button" aria-label="Unduh CSV" onClick={download} className="cursor-pointer">
            <Download className="size-5" />
          </button>
        </div>
      </div>

      {/* Side by side from 896px of content, stacked below */}
      <div className="mt-2.5 flex flex-col gap-2 @4xl:flex-row">
        <ExamChart
          title={type ? "Jumlah Pemeriksaan" : "Total Pemeriksaan"}
          period={period}
          onPeriod={(p) => {
            setPeriod(p);
            setRange({ from: periods[p].from(range.to), to: range.to });
          }}
          data={data}
          types={types}
          unit={unit}
          range={rangeLabel(range.from, range.to)}
          compact={!!type}
        />
        <div className="flex shrink-0 flex-col gap-[19px] rounded-lg border border-neutral-300 pt-[19px] pr-[13px] pb-5 pl-[11px] @4xl:w-[324px]">
          {stats.map((s, i) => {
            const body = (
              <>
                {s.label}
                <span className="flex items-center gap-3">
                  <span className="text-h6">{s.value}</span>
                  {s.unit}
                </span>
              </>
            );
            return (
              <Fragment key={s.label}>
                {/* -mb-px: Figma's divider takes no height */}
                {i > 0 && <div className="-mb-px h-px bg-neutral-300" />}
                {s.href ? (
                  <Link href={s.href} className="flex flex-col gap-4">
                    {body}
                  </Link>
                ) : (
                  <div className="flex flex-col gap-4">{body}</div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      {type ? <h2 className="mt-4 mb-2 text-b2 font-bold">Analitik</h2> : <div className="mt-4.5" />}
      {props.variant === "radiologi" ? (
        <ExamTable rows={latest(queued)} kind="antrean" />
      ) : (
        <ExamTable rows={latest(verified)} kind={type ? "faskes" : "dashboard"} typeBar={!type} />
      )}
    </>
  );
}
