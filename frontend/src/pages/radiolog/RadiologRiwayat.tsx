import { useState, useMemo } from 'react'
import {
  Search,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { usePneumonia } from '../../context/PneumoniaContext'
import { formatDisplayDate } from '../../types/patient'

// Baseline queue from dokter-radiologi.html
const BASE_ROWS = [
  { id: '#PN-0123', jenis: 'Pneumonia', faskes: 'Faskes Shinyu', tanggal: '19/10/2026', hasil: 'Tidak terdeteksi' },
  { id: '#KT-0124', jenis: 'Kanker Tulang', faskes: 'Faskes Dohoon', tanggal: '19/10/2026', hasil: 'Terdeteksi' },
  { id: '#TO-0125', jenis: 'Tumor Otak', faskes: 'Faskes Youngjae', tanggal: '18/10/2026', hasil: 'Tidak terdeteksi' },
  { id: '#PN-0126', jenis: 'Pneumonia', faskes: 'Faskes Hanjin', tanggal: '18/10/2026', hasil: 'Terdeteksi' },
  { id: '#TO-0127', jenis: 'Tumor Otak', faskes: 'Faskes Jihoon', tanggal: '17/10/2026', hasil: 'Terdeteksi' },
  { id: '#KT-0128', jenis: 'Kanker Tulang', faskes: 'Faskes Kyungmin', tanggal: '17/10/2026', hasil: 'Tidak terdeteksi' },
  { id: '#PN-0129', jenis: 'Pneumonia', faskes: 'Faskes Shinyu', tanggal: '16/10/2026', hasil: 'Tidak terdeteksi' },
  { id: '#KT-0130', jenis: 'Kanker Tulang', faskes: 'Faskes Dohoon', tanggal: '16/10/2026', hasil: 'Terdeteksi' },
  { id: '#TO-0131', jenis: 'Tumor Otak', faskes: 'Faskes Youngjae', tanggal: '15/10/2026', hasil: 'Terdeteksi' },
  { id: '#PN-0132', jenis: 'Pneumonia', faskes: 'Faskes Hanjin', tanggal: '15/10/2026', hasil: 'Terdeteksi' },
]

export function DokterRiwayat() {
  const { cases } = usePneumonia()

  const [q, setQ] = useState('')
  const [jenis, setJenis] = useState('')
  const [tgl, setTgl] = useState('')
  const [hasil, setHasil] = useState('')
  const [page, setPage] = useState(1)

  // Merge live verified cases with base rows
  const allRows = useMemo(() => {
    const liveVerified = cases
      .filter((c) => c.status === 'terverifikasi')
      .map((c) => {
        const diag = c.aiResult?.diagnosis || 'Pneumonia'
        const cat = diag.includes('Tumor') ? 'Tumor Otak' : diag.includes('Kanker') ? 'Kanker Tulang' : 'Pneumonia'
        const dStr = formatDisplayDate(c.verificationDate || c.createdAt)
        const hStr = c.verificationResult || 'Terdeteksi'
        return {
          id: c.id,
          jenis: cat,
          hasil: hStr,
          faskes: c.faskes || 'Faskes Shinyu',
          tanggal: dStr,
        }
      })

    const seen = new Set<string>()
    const combined = []
    for (const item of [...liveVerified, ...BASE_ROWS]) {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        combined.push(item)
      }
    }
    return combined
  }, [cases])

  // Distinct dates for select dropdown
  const distinctDates = useMemo(() => {
    return Array.from(new Set(allRows.map((r) => r.tanggal)))
  }, [allRows])

  // Filtered rows
  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {
      const matchQ =
        !q ||
        r.id.toLowerCase().includes(q.toLowerCase()) ||
        r.jenis.toLowerCase().includes(q.toLowerCase()) ||
        r.hasil.toLowerCase().includes(q.toLowerCase()) ||
        r.faskes.toLowerCase().includes(q.toLowerCase())
      const matchJenis = !jenis || r.jenis === jenis
      const matchTgl = !tgl || r.tanggal === tgl
      const matchHasil = !hasil || r.hasil === hasil
      return matchQ && matchJenis && matchTgl && matchHasil
    })
  }, [allRows, q, jenis, tgl, hasil])

  return (
    <div>
      <h1 className="t18">Riwayat Kasus Terverifikasi</h1>
      <hr className="rule" />

      {/* Filters */}
      <div className="filters">
        <label className="search">
          <Search size={16} color="var(--neutral-400)" />
          <input
            id="lq"
            placeholder="Search bar"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>

        <div className="sel">
          <select
            id="fj"
            aria-label="Jenis Pemeriksaan"
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
          >
            <option value="">Jenis Pemeriksaan</option>
            <option value="Pneumonia">Pneumonia</option>
            <option value="Kanker Tulang">Kanker Tulang</option>
            <option value="Tumor Otak">Tumor Otak</option>
          </select>
          <ChevronDown size={14} className="sel-icon" />
        </div>

        <div className="sel">
          <select
            id="ft"
            aria-label="Tanggal"
            value={tgl}
            onChange={(e) => setTgl(e.target.value)}
          >
            <option value="">Tanggal</option>
            {distinctDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="sel-icon" />
        </div>

        <div className="sel">
          <select
            id="fh"
            aria-label="Hasil Verifikasi"
            value={hasil}
            onChange={(e) => setHasil(e.target.value)}
          >
            <option value="">Hasil Verifikasi</option>
            <option value="Terdeteksi">Terdeteksi</option>
            <option value="Tidak terdeteksi">Tidak terdeteksi</option>
          </select>
          <ChevronDown size={14} className="sel-icon" />
        </div>
      </div>

      {/* Table Card matching html */}
      <div className="card">
        <div className="thead">
          <span className="w150">ID Rekam Medis</span>
          <span className="w150">Jenis Pemeriksaan</span>
          <span className="w200">Hasil Verifikasi</span>
          <span className="w150">Asal Faskes</span>
          <span className="w150">Tanggal Verifikasi</span>
        </div>

        {filteredRows.length === 0 ? (
          <div className="empty">Tidak ada data yang cocok.</div>
        ) : (
          filteredRows.map((r) => {
            const isPos = r.hasil.includes('Terdeteksi') && !r.hasil.includes('Tidak')
            return (
              <div key={r.id} className="trow" style={{ cursor: 'default' }}>
                <div className="cells">
                  <span className="w150" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>{r.id}</span>
                  <span className="w150">{r.jenis}</span>
                  <span className="w200" style={{ color: isPos ? '#0e7940' : 'var(--neutral-700)', fontWeight: 500 }}>
                    {r.hasil}
                  </span>
                  <span className="w150">{r.faskes}</span>
                  <span className="w150">{r.tanggal}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pager matching html */}
      <div className="pager">
        <button
          type="button"
          className="btn sq"
          aria-label="Sebelumnya"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1}
        >
          <ArrowLeft size={16} />
        </button>
        <span>{page}/10</span>
        <button
          type="button"
          className="btn sq"
          aria-label="Berikutnya"
          onClick={() => setPage((prev) => Math.min(10, prev + 1))}
          disabled={page >= 10}
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default DokterRiwayat
