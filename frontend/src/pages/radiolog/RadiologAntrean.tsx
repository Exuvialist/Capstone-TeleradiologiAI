import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { usePneumonia } from '../../context/PneumoniaContext'
import { formatDisplayDate } from '../../types/patient'

// Baseline queue from dokter-radiologi.html
const DEFAULT_QUEUE = [
  { id: '#PN-0123', jenis: 'Pneumonia', faskes: 'Faskes Shinyu', tanggal: '19/10/2026', ai: 'Pneumonia | 90%' },
  { id: '#KT-0124', jenis: 'Kanker Tulang', faskes: 'Faskes Dohoon', tanggal: '19/10/2026', ai: 'Kanker Tulang | 87%' },
  { id: '#TO-0125', jenis: 'Tumor Otak', faskes: 'Faskes Youngjae', tanggal: '18/10/2026', ai: 'Tumor Otak | 94%' },
  { id: '#PN-0126', jenis: 'Pneumonia', faskes: 'Faskes Hanjin', tanggal: '18/10/2026', ai: 'Pneumonia | 92%' },
  { id: '#TO-0127', jenis: 'Tumor Otak', faskes: 'Faskes Jihoon', tanggal: '17/10/2026', ai: 'Tumor Otak | 89%' },
  { id: '#KT-0128', jenis: 'Kanker Tulang', faskes: 'Faskes Kyungmin', tanggal: '17/10/2026', ai: 'Kanker Tulang | 95%' },
  { id: '#PN-0129', jenis: 'Pneumonia', faskes: 'Faskes Shinyu', tanggal: '16/10/2026', ai: 'Pneumonia | 88%' },
  { id: '#KT-0130', jenis: 'Kanker Tulang', faskes: 'Faskes Dohoon', tanggal: '16/10/2026', ai: 'Kanker Tulang | 91%' },
  { id: '#TO-0131', jenis: 'Tumor Otak', faskes: 'Faskes Youngjae', tanggal: '15/10/2026', ai: 'Tumor Otak | 93%' },
  { id: '#PN-0132', jenis: 'Pneumonia', faskes: 'Faskes Hanjin', tanggal: '15/10/2026', ai: 'Pneumonia | 96%' },
]

export function DokterAntrean() {
  const navigate = useNavigate()
  const { cases } = usePneumonia()

  const [q, setQ] = useState('')
  const [jenis, setJenis] = useState('')
  const [tgl, setTgl] = useState('')
  const [page, setPage] = useState(1)

  // Merge live pending cases with default queue
  const allRows = useMemo(() => {
    const livePending = cases
      .filter((c) => c.status === 'menunggu' || c.status === 'proses')
      .map((c) => {
        const diag = c.aiResult?.diagnosis || 'Pneumonia'
        const conf = c.aiResult?.confidence || 90
        const cat = diag.includes('Tumor') ? 'Tumor Otak' : diag.includes('Kanker') ? 'Kanker Tulang' : 'Pneumonia'
        const dStr = formatDisplayDate(c.createdAt)
        return {
          id: c.id,
          jenis: cat,
          faskes: c.faskes || 'Faskes Shinyu',
          tanggal: dStr,
          ai: `${cat} | ${conf}%`,
        }
      })

    // Combine avoiding duplicate IDs
    const seen = new Set<string>()
    const combined = []
    for (const item of [...DEFAULT_QUEUE, ...livePending]) {
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

  // Filter rows
  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {
      const matchQ =
        !q ||
        r.id.toLowerCase().includes(q.toLowerCase()) ||
        r.jenis.toLowerCase().includes(q.toLowerCase()) ||
        r.faskes.toLowerCase().includes(q.toLowerCase()) ||
        r.ai.toLowerCase().includes(q.toLowerCase())
      const matchJenis = !jenis || r.jenis === jenis
      const matchTgl = !tgl || r.tanggal === tgl
      return matchQ && matchJenis && matchTgl
    })
  }, [allRows, q, jenis, tgl])

  return (
    <div>
      <h1 className="t18" style={{ margin: 0 }}>Antrean Verifikasi</h1>
      <hr className="rule" style={{ margin: '8px 0 14px' }} />

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
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div className="thead" style={{ fontSize: 13, paddingBottom: 10, marginBottom: 10 }}>
          <span className="w150">ID Rekam Medis</span>
          <span className="w150">Jenis Pemeriksaan</span>
          <span className="w150">Asal Faskes</span>
          <span className="w150">Tanggal Masuk</span>
          <span className="w200">Confidence Score AI</span>
        </div>

        {filteredRows.length === 0 ? (
          <div className="empty">Tidak ada data yang cocok.</div>
        ) : (
          filteredRows.map((r) => (
            <div
              key={r.id}
              className="trow"
              style={{ padding: '6px 4px', fontSize: 14 }}
              onClick={() => navigate(`/dokter-radiologi/verifikasi/${r.id.replace('#', '')}`)}
            >
              <div className="cells">
                <span className="w150" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>{r.id}</span>
                <span className="w150">{r.jenis}</span>
                <span className="w150">{r.faskes}</span>
                <span className="w150">{r.tanggal}</span>
                <span className="w200">{r.ai}</span>
              </div>
              <ChevronRight size={16} className="ico" />
            </div>
          ))
        )}
      </div>

      {/* Pager from html */}
      <div className="pager" style={{ marginTop: 12 }}>
        <button
          type="button"
          className="btn sq"
          style={{ width: 32, height: 32, padding: 0 }}
          aria-label="Sebelumnya"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1}
        >
          <ArrowLeft size={14} />
        </button>
        <span style={{ fontSize: 12 }}>{page}/10</span>
        <button
          type="button"
          className="btn sq"
          style={{ width: 32, height: 32, padding: 0 }}
          aria-label="Berikutnya"
          onClick={() => setPage((prev) => Math.min(10, prev + 1))}
          disabled={page >= 10}
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

export default DokterAntrean
