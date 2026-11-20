import React, { useState, useMemo } from 'react'
import {
  Search,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import { usePneumonia } from '../../context/PneumoniaContext'
import type { PatientRecord } from '../../types/patient'

export function DokterRiwayat() {
  const { cases } = usePneumonia()

  const [filterType, setFilterType] = useState<'Semua' | 'Pneumonia' | 'Kanker Tulang' | 'Tumor Otak'>('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null)

  // Fetch verified cases live from database
  const verifiedCases = useMemo(() => {
    return cases.filter((c) => c.status === 'terverifikasi')
  }, [cases])

  const filtered = useMemo(() => {
    return verifiedCases.filter((item) => {
      const diag = item.aiResult?.diagnosis || ''
      const cat = diag.includes('Tumor') ? 'Tumor Otak' : diag.includes('Kanker') ? 'Kanker Tulang' : 'Pneumonia'
      const matchType = filterType === 'Semua' || cat === filterType
      const matchQuery =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nama.toLowerCase().includes(searchQuery.toLowerCase())
      return matchType && matchQuery
    })
  }, [verifiedCases, filterType, searchQuery])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h1 className="h-7" style={{ margin: 0, fontSize: 26 }}>
        Riyawat Kasus Terverifikasi ({verifiedCases.length} Kasus Selesai)
      </h1>

      <div style={{ borderBottom: '1px solid var(--neutral-300)', paddingBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Semua', 'Pneumonia', 'Kanker Tulang', 'Tumor Otak'] as const).map((tab) => {
              const active = filterType === tab
              const count =
                tab === 'Semua'
                  ? verifiedCases.length
                  : verifiedCases.filter((c) => (c.aiResult?.diagnosis || '').includes(tab)).length

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

      {/* Main Table matching Desktop-31 */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 150 }}>ID Rekam Medis</th>
                <th style={{ width: 160 }}>Jenis Pemeriksaan</th>
                <th style={{ width: 190 }}>Hasil Verifikasi</th>
                <th style={{ width: 160 }}>Asal Faskes</th>
                <th style={{ width: 160 }}>Tanggal Verifikasi</th>
                <th style={{ width: 80, textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--neutral-400)' }}>
                    Tidak ada riwayat kasus terverifikasi untuk filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const diag = item.aiResult?.diagnosis || 'Pneumonia'
                  const cat = diag.includes('Tumor') ? 'Tumor Otak' : diag.includes('Kanker') ? 'Kanker Tulang' : 'Pneumonia'
                  const hasil = item.verificationResult || 'Terdeteksi'
                  const isNegative = hasil.toLowerCase().includes('bukan') || hasil.toLowerCase().includes('tidak')

                  return (
                    <tr
                      key={item.id}
                      className="table-row-hover"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedRecord(item)}
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
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            color: isNegative ? '#0e7940' : '#d61b2d',
                          }}
                        >
                          {hasil}
                        </span>
                      </td>
                      <td>Faskes Shinyu</td>
                      <td>{item.verificationDate || '19/10/2026'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '4px 8px', fontSize: 12 }}
                        >
                          <span>Detail</span>
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
          <button type="button" className="btn btn-white" style={{ padding: '6px 10px' }} disabled>
            <ArrowLeft size={16} />
          </button>
          <span style={{ fontSize: 13, padding: '0 8px' }}>Halaman 1 dari 1</span>
          <button type="button" className="btn btn-white" style={{ padding: '6px 10px' }} disabled>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Detail Record Drawer / Modal */}
      {selectedRecord && (
        <div className="modal-backdrop" onClick={() => setSelectedRecord(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={20} color="var(--primary-600)" />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                  Detail Verifikasi {selectedRecord.id}
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: 4 }}
                onClick={() => setSelectedRecord(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <span style={{ color: 'var(--neutral-400)', fontSize: 12 }}>Nama Pasien:</span>
                  <p style={{ fontWeight: 600, margin: 0 }}>{selectedRecord.nama}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--neutral-400)', fontSize: 12 }}>Jenis Pemeriksaan:</span>
                  <p style={{ fontWeight: 600, margin: 0 }}>{selectedRecord.aiResult?.diagnosis || 'Pneumonia'}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <span style={{ color: 'var(--neutral-400)', fontSize: 12 }}>Asal Faskes:</span>
                  <p style={{ margin: 0 }}>Faskes Shinyu</p>
                </div>
                <div>
                  <span style={{ color: 'var(--neutral-400)', fontSize: 12 }}>Tanggal Verifikasi:</span>
                  <p style={{ margin: 0 }}>{selectedRecord.verificationDate || '19/10/2026'}</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--neutral-200)', paddingTop: 10 }}>
                <span style={{ color: 'var(--neutral-400)', fontSize: 12 }}>Hasil Verifikasi:</span>
                <p style={{ fontWeight: 700, color: (selectedRecord.verificationResult || '').toLowerCase().includes('tidak') || (selectedRecord.verificationResult || '').toLowerCase().includes('bukan') ? '#0e7940' : '#d61b2d', margin: '2px 0 0 0' }}>
                  {selectedRecord.verificationResult || 'Terdeteksi'}
                </p>
              </div>

              <div>
                <span style={{ color: 'var(--neutral-400)', fontSize: 12 }}>Catatan Radiolog ({selectedRecord.radiologist || 'Dr. Shinyu'}):</span>
                <div
                  style={{
                    background: 'var(--primary-100)',
                    border: '1px solid var(--primary-300)',
                    borderRadius: 6,
                    padding: '8px 10px',
                    marginTop: 4,
                    lineHeight: '19px',
                  }}
                >
                  {selectedRecord.verificationNotes || 'Tidak ada catatan khusus.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedRecord(null)}
              >
                Tutup
              </button>
              <button
                type="button"
                className="btn btn-neutral"
                onClick={() => {
                  alert(`Mengunduh lembar hasil verifikasi resmi ${selectedRecord.id} (PDF)...`)
                }}
              >
                <Download size={14} />
                <span>Unduh Berkas PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



export default DokterRiwayat
