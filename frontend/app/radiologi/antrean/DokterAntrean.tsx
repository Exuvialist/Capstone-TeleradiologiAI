"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Search } from "lucide-react";
import { useRadiologistExams } from "@/components/VerificationProvider";
import { examTypes } from "@/data/mock";
import { aiLabel, examLabel, formatDate } from "../format";

// Antrean Verifikasi (ported from Grace's RadiologAntrean): the radiologist's cases not verified yet.

const PAGE_SIZE = 10;

export default function DokterAntrean() {
  const exams = useRadiologistExams();

  const [q, setQ] = useState("");
  const [jenis, setJenis] = useState("");
  const [tgl, setTgl] = useState("");
  const [page, setPage] = useState(1);

  const rows = exams
    .filter((e) => e.verifiedAt === null)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .map((e) => ({
      id: e.id,
      rm: e.medicalRecordNo,
      jenis: examLabel(e.type),
      faskes: e.faskes,
      tanggal: formatDate(e.submittedAt),
      ai: aiLabel(e),
    }));

  const dates = Array.from(new Set(rows.map((r) => r.tanggal)));

  const query = q.trim().toLowerCase();
  const filtered = rows.filter(
    (r) =>
      (!query || [r.id, r.rm, r.jenis, r.faskes, r.ai].some((v) => v.toLowerCase().includes(query))) &&
      (!jenis || r.jenis === jenis) &&
      (!tgl || r.tanggal === tgl),
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div>
      <h1 className="t18" style={{ margin: 0 }}>Antrean Verifikasi</h1>
      <hr className="rule" style={{ margin: "8px 0 14px" }} />

      <div className="filters">
        <label className="search">
          <Search size={16} color="var(--neutral-400)" />
          <input
            placeholder="Search bar"
            aria-label="Cari antrean"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </label>

        <div className="sel">
          <select
            aria-label="Jenis Pemeriksaan"
            value={jenis}
            onChange={(e) => {
              setJenis(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Jenis Pemeriksaan</option>
            {examTypes.map((t) => (
              <option key={t.slug} value={t.label}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="sel-icon" />
        </div>

        <div className="sel">
          <select
            aria-label="Tanggal"
            value={tgl}
            onChange={(e) => {
              setTgl(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tanggal</option>
            {dates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="sel-icon" />
        </div>
      </div>

      <div className="card" style={{ padding: "14px 16px" }}>
        <div className="thead" style={{ fontSize: 13, paddingBottom: 10, marginBottom: 10 }}>
          <span className="w150">ID Rekam Medis</span>
          <span className="w150">Jenis Pemeriksaan</span>
          <span className="w150">Asal Faskes</span>
          <span className="w150">Tanggal Masuk</span>
          <span className="w200">Confidence Score AI</span>
        </div>

        {visible.length === 0 ? (
          <div className="empty">Tidak ada data yang cocok.</div>
        ) : (
          visible.map((r) => (
            <Link key={r.id} href={`/radiologi/antrean/${r.id}`} className="trow" style={{ padding: "6px 4px", fontSize: 14 }}>
              <div className="cells">
                <span className="w150" style={{ fontWeight: 700, color: "var(--primary-600)" }}>{r.rm}</span>
                <span className="w150">{r.jenis}</span>
                <span className="w150">{r.faskes}</span>
                <span className="w150">{r.tanggal}</span>
                <span className="w200">{r.ai}</span>
              </div>
              <ChevronRight size={16} className="ico" />
            </Link>
          ))
        )}
      </div>

      <div className="pager" style={{ marginTop: 12 }}>
        <button
          type="button"
          className="btn sq"
          style={{ width: 32, height: 32, padding: 0 }}
          aria-label="Sebelumnya"
          onClick={() => setPage(current - 1)}
          disabled={current <= 1}
        >
          <ArrowLeft size={14} />
        </button>
        <span style={{ fontSize: 12 }}>
          {current}/{pages}
        </span>
        <button
          type="button"
          className="btn sq"
          style={{ width: 32, height: 32, padding: 0 }}
          aria-label="Berikutnya"
          onClick={() => setPage(current + 1)}
          disabled={current >= pages}
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
