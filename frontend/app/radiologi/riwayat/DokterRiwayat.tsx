"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, Search } from "lucide-react";
import { useRadiologistExams } from "@/components/VerificationProvider";
import { examTypes } from "@/data/mock";
import { examLabel, formatDate, verdictLabel } from "../format";

// Riwayat Kasus Terverifikasi (ported from Grace's RadiologRiwayat): the radiologist's verified cases.

const PAGE_SIZE = 10;

export default function DokterRiwayat() {
  const exams = useRadiologistExams();

  const [q, setQ] = useState("");
  const [jenis, setJenis] = useState("");
  const [tgl, setTgl] = useState("");
  const [hasil, setHasil] = useState("");
  const [page, setPage] = useState(1);

  const rows = exams
    .filter((e) => e.verifiedAt !== null)
    .sort((a, b) => (b.verifiedAt ?? "").localeCompare(a.verifiedAt ?? ""))
    .map((e) => ({
      id: e.id,
      rm: e.medicalRecordNo,
      jenis: examLabel(e.type),
      hasil: verdictLabel(e),
      faskes: e.faskes,
      tanggal: formatDate(e.verifiedAt),
    }));

  const dates = Array.from(new Set(rows.map((r) => r.tanggal)));

  const query = q.trim().toLowerCase();
  const filtered = rows.filter(
    (r) =>
      (!query || [r.id, r.rm, r.jenis, r.hasil, r.faskes].some((v) => v.toLowerCase().includes(query))) &&
      (!jenis || r.jenis === jenis) &&
      (!tgl || r.tanggal === tgl) &&
      (!hasil || r.hasil === hasil),
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const select = (label: string, value: string, set: (v: string) => void, options: string[]) => (
    <div className="sel">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => {
          set(e.target.value);
          setPage(1);
        }}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="sel-icon" />
    </div>
  );

  return (
    <div>
      <h1 className="t18">Riwayat Kasus Terverifikasi</h1>
      <hr className="rule" />

      <div className="filters">
        <label className="search">
          <Search size={16} color="var(--neutral-400)" />
          <input
            placeholder="Search bar"
            aria-label="Cari riwayat"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </label>
        {select("Jenis Pemeriksaan", jenis, setJenis, examTypes.map((t) => t.label))}
        {select("Tanggal", tgl, setTgl, dates)}
        {select("Hasil Verifikasi", hasil, setHasil, ["Terdeteksi", "Tidak terdeteksi"])}
      </div>

      <div className="card">
        <div className="thead">
          <span className="w150">ID Rekam Medis</span>
          <span className="w150">Jenis Pemeriksaan</span>
          <span className="w200">Hasil Verifikasi</span>
          <span className="w150">Asal Faskes</span>
          <span className="w150">Tanggal Verifikasi</span>
        </div>

        {visible.length === 0 ? (
          <div className="empty">Tidak ada data yang cocok.</div>
        ) : (
          visible.map((r) => (
            <div key={r.id} className="trow" style={{ cursor: "default" }}>
              <div className="cells">
                <span className="w150" style={{ fontWeight: 700, color: "var(--primary-600)" }}>{r.rm}</span>
                <span className="w150">{r.jenis}</span>
                <span className="w200" style={{ color: r.hasil === "Terdeteksi" ? "#0e7940" : "var(--neutral-800)", fontWeight: 500 }}>
                  {r.hasil}
                </span>
                <span className="w150">{r.faskes}</span>
                <span className="w150">{r.tanggal}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pager">
        <button type="button" className="btn sq" aria-label="Sebelumnya" onClick={() => setPage(current - 1)} disabled={current <= 1}>
          <ArrowLeft size={16} />
        </button>
        <span>
          {current}/{pages}
        </span>
        <button type="button" className="btn sq" aria-label="Berikutnya" onClick={() => setPage(current + 1)} disabled={current >= pages}>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
