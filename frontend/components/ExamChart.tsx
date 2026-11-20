"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import Button from "@/components/Button";
import type { ExamType } from "@/data/mock";

// Chart card. Figma: Desktop-12 163:933 (dashboards), Desktop-8 132:464 (Statistika, `compact`: shorter, no legend).
export const periods = ["Harian", "Bulanan", "Tahunan"] as const;
export type Period = (typeof periods)[number];

type Props = {
  title: string;
  period: Period;
  onPeriod: (period: Period) => void;
  data: Record<string, string | number>[]; // one item per day/month/year: { label, <exam type slug>: count }
  types: ExamType[];
  unit: string; // "hari" | "bulan" | "tahun"
  range: string; // e.g. "13–19 Okt 2026"
  compact?: boolean;
};

const fill = (type: ExamType) => `var(${type.color.replace("bg-", "--color-")})`;
const tick = { fontSize: 12, fill: "var(--color-neutral-700)" };

export default function ExamChart({ title, period, onPeriod, data, types, unit, range, compact = false }: Props) {
  const totals = types.map((t) => ({ ...t, count: data.reduce((sum, d) => sum + Number(d[t.slug]), 0) }));
  const total = totals.reduce((sum, t) => sum + t.count, 0);
  const top = totals.reduce((a, b) => (b.count > a.count ? b : a));

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-neutral-300 px-2.5 pt-2.5 pb-[13px]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="flex items-center gap-2">
          {title}
          <span className="text-h7">{total}</span>
        </p>
        <div className="mt-px flex gap-2">
          {periods.map((p) => (
            <Button key={p} variant="outline" selected={p === period} onClick={() => onPeriod(p)}>
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className={`mt-[13px] mr-0.5 text-b4 ${compact ? "min-h-[303px]" : "min-h-[387px]"}`}>
        <div className="flex flex-wrap justify-between gap-x-4 px-4 pt-2.5">
          <span>Jumlah pemeriksaan per {unit}</span>
          <span className="text-neutral-700">{range}</span>
        </div>
        <BarChart
          responsive
          data={data}
          style={{ width: "100%", height: compact ? 226 : 310 }}
          margin={{ top: 22, right: 16, bottom: 0, left: 0 }}
          barGap={6}
        >
          <CartesianGrid vertical={false} stroke="var(--color-neutral-200)" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={10} tick={tick} />
          <YAxis width={48} axisLine={false} tickLine={false} tickSize={0} tickMargin={10} tick={tick} allowDecimals={false} tickCount={6} />
          {types.map((t) => (
            <Bar key={t.slug} dataKey={t.slug} name={t.label} fill={fill(t)} radius={[3, 3, 0, 0]} maxBarSize={18} />
          ))}
        </BarChart>
        <div className="mt-4 flex flex-wrap justify-between gap-x-4 px-4">
          <span>
            {total} pemeriksaan dalam {data.length} {unit}
          </span>
          {types.length > 1 && total > 0 && (
            <span className="text-neutral-700">
              {top.label} terbanyak: {top.count} pemeriksaan
            </span>
          )}
        </div>
      </div>

      {!compact && (
        <div className="mt-[13px] flex flex-wrap gap-x-8 gap-y-2 text-b4">
          {totals.map((t) => (
            <span key={t.slug} className="flex items-center gap-1.5">
              <span className={`size-4 rounded-sm ${t.color}`} />
              {t.label} · {t.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
