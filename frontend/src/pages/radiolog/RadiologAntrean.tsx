import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { usePneumonia } from '../../context/PneumoniaContext'
import type { PatientRecord } from '../../types/patient'

export function DokterAntrean() {
  const navigate = useNavigate()
  const { cases } = usePneumonia()

  const [filterType, setFilterType] = useState<'Semua' | 'Pneumonia' | 'Kanker Tulang' | 'Tumor Otak'>('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch pending verification cases live from database
  const pendingCases = useMemo(() => {
    return cases.filter((c) => c.status === 'menunggu' || c.status === 'proses')
  }, [cases])

  const filtered = useMemo(() => {
    return pendingCases.filter((item) => {
      const diag = item.aiResult?.diagnosis || ''
      const cat = diag.includes('Tumor') ? 'Tumor Otak' : diag.includes('Kanker') ? 'Kanker Tulang' : 'Pneumonia'
      const matchType = filterType === 'Semua' || cat === filterType
      const matchQuery =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nama.toLowerCase().includes(searchQuery.toLowerCase())
      return matchType && matchQuery
    })
  }, [pendingCases, filterType, searchQuery])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h1 className="h-7" style={{ margin: 0, fontSize: 26 }}>
        Antrean Verifikasi ({pendingCases.length} Kasus Menunggu)
      </h1>

      <div style={{ borderBottom: '1px solid var(--neutral-300)', paddingBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Semua', 'Pneumonia', 'Kanker Tulang', 'Tumor Otak'] as const).map((tab) => {
              const active = filterType === tab
              const count =
                tab === 'Semua'
                  ? pendingCases.length
                  : pendingCases.filter((c) => (c.aiResult?.diagnosis || '').includes(tab)).length

              return (
                <button
                  key={tab}
                  type="button"
                  className={`btn ${active ? 'btn-neutral' : 'btn-outline'}`}
                  style={{ fontSize: 13, padding: '6px 12px' }}
                  onClick={() => setFilterType(tab)}
                >
                  {tab} ({count})
                </button>
              )
            })}
          </div>

          {/* Quick Search */}
          <div className="input-search-box" style={{ width: 260, height: 36 }}>
            <Search size={16} color="var(--neutral-400)" />
            <input
              type="text"
              placeholder="Cari ID / Pasien / Faskes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 160 }}>ID Rekam Medis</th>
                <th style={{ width: 170 }}>Jenis Pemeriksaan</th>
                <th style={{ width: 180 }}>Asal Faskes</th>
                <th style={{ width: 160 }}>Tanggal Masuk</th>
                <th>Confidence Score AI</th>
                <th style={{ width: 80, textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--neutral-400)' }}>
                    Tidak ada antrean verifikasi untuk filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const diag = item.aiResult?.diagnosis || 'Pneumonia'
                  const cat = diag.includes('Tumor') ? 'Tumor Otak' : diag.includes('Kanker') ? 'Kanker Tulang' : 'Pneumonia'

                  return (
                    <tr
                      key={item.id}
                      className="table-row-hover"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/dokter-radiologi/verifikasi/${encodeURIComponent(item.id)}`)}
                    >
                      <td style={{ fontWeight: 600 }}>{item.id}</td>
                      <td>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            background:
                              cat === 'Pneumonia'
                                ? 'rgba(95, 92, 176, 0.12)'
                                : cat === 'Kanker Tulang'
                                ? 'rgba(88, 132, 187, 0.15)'
                                : 'rgba(90, 187, 130, 0.15)',
                            color:
                              cat === 'Pneumonia'
                                ? 'var(--quaternary-600)'
                                : cat === 'Kanker Tulang'
                                ? 'var(--primary-600)'
                                : 'var(--tertiary-600)',
                          }}
                        >
                          {cat}
                        </span>
                      </td>
                      <td>Faskes Shinyu</td>
                      <td>{item.createdAt ? item.createdAt.split('-').reverse().join('/') : '19/10/2026'}</td>
                      <td style={{ fontWeight: 500 }}>
                        {diag} | {item.aiResult?.confidence || 90}%
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '4px 8px', fontSize: 12 }}
                          title="Periksa Kasus"
                        >
                          <span>Periksa</span>
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pager" style={{ marginTop: 20 }}>
          <button
            type="button"
            className="btn btn-white"
            style={{ padding: '6px 10px' }}
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ArrowLeft size={16} />
          </button>
          <span style={{ fontSize: 13, padding: '0 8px' }}>Halaman {currentPage} dari 1</span>
          <button type="button" className="btn btn-white" style={{ padding: '6px 10px' }} disabled>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}



export default DokterAntrean
