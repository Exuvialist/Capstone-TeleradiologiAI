import { useState } from 'react'
import { ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PneumoniaLayout from '../components/PneumoniaTabs'
import { usePneumonia, type PatientRecord } from '../context/PneumoniaContext'

export default function Daftar({ variant }: { variant: 'proses' | 'terverifikasi' }) {
  const navigate = useNavigate()
  const { cases, setCurrentCase } = usePneumonia()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'pneumonia' | 'non_pneumonia'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  const isProses = variant === 'proses'

  // Filter cases matching variant status
  const matchedStatusCases = cases.filter((c) => {
    if (isProses) {
      return c.status === 'proses' || c.status === 'menunggu'
    } else {
      return c.status === 'terverifikasi'
    }
  })

  // Generate 10 standard mockup rows if fewer items to preserve the table fullness from Figma
  const baseList: PatientRecord[] = [...matchedStatusCases]
  const targetCount = 10
  if (baseList.length < targetCount) {
    for (let i = baseList.length; i < targetCount; i++) {
      const isEven = i % 2 === 0
      baseList.push({
        id: `#PN-012${i}`,
        nama: isEven ? 'Gracella Uhuy' : i % 3 === 0 ? 'Budi Pratama' : 'Siti Rahma',
        dd: '01',
        mm: 'Mei',
        yyyy: '2000',
        gender: isEven ? 'P' : 'L',
        gejala: 'Batuk berdahak, sesak ringan.',
        files: [{ name: 'untitled-attachment01.jpeg', size: '128.KB', url: '/sample-xray.jpeg' }],
        aiResult: {
          diagnosis: isEven ? 'Pneumonia' : 'Bukan Pneumonia',
          confidence: 90,
          finding: 'Normal thorax or mild infiltrate.',
        },
        radiologist: 'Dr. Tama',
        verificationDate: isProses ? undefined : '19/10/2026',
        verificationResult: isProses ? undefined : (isEven ? 'Pneumonia Terkonfirmasi' : 'Bukan Pneumonia'),
        status: isProses ? 'proses' : 'terverifikasi',
        createdAt: '2026-10-19',
      })
    }
  }

  // Filter by search term & filter type
  const filteredList = baseList.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.radiologist && item.radiologist.toLowerCase().includes(searchTerm.toLowerCase()))

    if (!matchesSearch) return false

    if (filterType === 'pneumonia') {
      return item.aiResult?.diagnosis.toLowerCase().includes('pneumonia')
    }
    if (filterType === 'non_pneumonia') {
      return item.aiResult?.diagnosis.toLowerCase().includes('bukan')
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredList.length / 10))

  const handleRowClick = (patient: PatientRecord) => {
    setCurrentCase(patient)
    if (isProses) {
      navigate('/faskes-3t/detail/radiolog')
    } else {
      navigate('/faskes-3t/detail/hasil')
    }
  }

  return (
    <PneumoniaLayout>
      <div className="toolbar" style={{ display: 'flex', gap: 8, position: 'relative' }}>
        <div className="input-search-box" style={{ flex: 'none', width: 260 }}>
          <Search size={16} color="var(--neutral-400)" />
          <input
            type="text"
            placeholder="Cari ID, pasien, atau radiolog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          type="button"
          className={`btn ${filterType !== 'all' ? 'btn-neutral' : 'btn-outline'}`}
          aria-label="Filter"
          onClick={() => setShowFilterDropdown((prev) => !prev)}
          title="Filter data tabel"
        >
          <Filter size={16} />
          {filterType !== 'all' && (
            <span style={{ fontSize: 12 }}>
              {filterType === 'pneumonia' ? 'Pneumonia' : 'Bukan Pneumonia'}
            </span>
          )}
        </button>

        {/* Filter Popup Menu */}
        {showFilterDropdown && (
          <div
            className="filter-popover"
            style={{
              position: 'absolute',
              top: 46,
              left: 270,
              zIndex: 20,
              background: '#fff',
              border: '1px solid var(--neutral-300)',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              padding: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              minWidth: 160,
            }}
          >
            <button
              type="button"
              className={`btn ${filterType === 'all' ? 'btn-neutral' : 'btn-white'}`}
              style={{ justifyContent: 'flex-start', fontSize: 13 }}
              onClick={() => {
                setFilterType('all')
                setShowFilterDropdown(false)
              }}
            >
              Semua Kasus
            </button>
            <button
              type="button"
              className={`btn ${filterType === 'pneumonia' ? 'btn-neutral' : 'btn-white'}`}
              style={{ justifyContent: 'flex-start', fontSize: 13 }}
              onClick={() => {
                setFilterType('pneumonia')
                setShowFilterDropdown(false)
              }}
            >
              Hanya Pneumonia
            </button>
            <button
              type="button"
              className={`btn ${filterType === 'non_pneumonia' ? 'btn-neutral' : 'btn-white'}`}
              style={{ justifyContent: 'flex-start', fontSize: 13 }}
              onClick={() => {
                setFilterType('non_pneumonia')
                setShowFilterDropdown(false)
              }}
            >
              Bukan Pneumonia
            </button>
          </div>
        )}
      </div>

      <div className="panel" style={{ padding: 0, overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              {[
                'ID Rekam Medis',
                'Nama Pasien',
                'AI Confidence Score',
                'Radiologi',
                'Tanggal Verifikasi',
                'Hasil Verifikasi',
              ].map((h) => (
                <th key={h} style={{ color: 'inherit', fontWeight: 700 }}>
                  {h}
                </th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {filteredList.map((r, i) => {
              const aiDisplay = `${r.aiResult?.diagnosis || 'Pneumonia'} | ${r.aiResult?.confidence || 90}%`
              const tglDisplay = isProses ? '-' : (r.verificationDate || '19/10/2026')
              const hasilDisplay = isProses ? 'Dalam Antrean' : (r.verificationResult || 'Bukan Pneumonia')

              return (
                <tr
                  key={r.id + i}
                  style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                  onClick={() => handleRowClick(r)}
                  className="table-row-hover"
                >
                  <td style={{ fontWeight: 600 }}>{r.id}</td>
                  <td>{r.nama}</td>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        background: r.aiResult?.diagnosis === 'Pneumonia' ? 'var(--secondary-200)' : 'var(--primary-100)',
                        color: r.aiResult?.diagnosis === 'Pneumonia' ? 'var(--secondary-1000)' : 'var(--primary-600)',
                        fontWeight: 600,
                      }}
                    >
                      {aiDisplay}
                    </span>
                  </td>
                  <td>{r.radiologist || 'Dr. Tama'}</td>
                  <td>{tglDisplay}</td>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        background: isProses ? 'var(--neutral-200)' : 'var(--primary-100)',
                        color: isProses ? 'var(--neutral-800)' : 'var(--primary-600)',
                      }}
                    >
                      {hasilDisplay}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--neutral-800)',
                      }}
                      title="Lihat Detail Pemeriksaan"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <button
          type="button"
          className="btn btn-outline"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          style={{ opacity: currentPage <= 1 ? 0.4 : 1, cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontWeight: 500 }}>
          {currentPage}/{totalPages}
        </span>
        <button
          type="button"
          className="btn btn-outline"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          style={{ opacity: currentPage >= totalPages ? 0.4 : 1, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </PneumoniaLayout>
  )
}
