import { useState } from 'react'
import { ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import PneumoniaLayout, { getModuleInfo } from '../components/PneumoniaTabs'
import { usePneumonia, type PatientRecord } from '../context/PneumoniaContext'

export default function Daftar({ variant }: { variant: 'proses' | 'terverifikasi' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { cases, setCurrentCase } = usePneumonia()

  const currentModule = getModuleInfo(location.pathname)
  const isBone = currentModule.type === 'kanker-tulang'
  const isBrain = currentModule.type === 'tumor-otak'

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'detected' | 'non_detected'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  const isProses = variant === 'proses'
  const idPrefix = isBone ? '#KT-012' : isBrain ? '#TO-012' : '#PN-012'
  const diseaseName = currentModule.title
  const confirmedLabel = `${diseaseName} Terkonfirmasi`
  const negativeLabel = `Bukan ${diseaseName}`
  const defaultDoc = isBone ? 'Dr. Nadia' : isBrain ? 'Dr. Arif' : 'Dr. Tama'

  // Filter cases matching variant status & module
  const matchedStatusCases = cases.filter((c) => {
    const statusMatch = isProses ? (c.status === 'proses' || c.status === 'menunggu') : c.status === 'terverifikasi'
    if (!statusMatch) return false

    if (isBone) return c.id.startsWith('#KT-')
    if (isBrain) return c.id.startsWith('#TO-')
    return c.id.startsWith('#PN-')
  })

  // Generate 10 standard mockup rows if fewer items to preserve the table fullness from Figma
  const baseList: PatientRecord[] = [...matchedStatusCases]
  const targetCount = 10
  if (baseList.length < targetCount) {
    for (let i = baseList.length; i < targetCount; i++) {
      const isEven = i % 2 === 0
      const sampleName = isBone
        ? (isEven ? 'Nabila Putri' : i % 3 === 0 ? 'Dimas Anggara' : 'Anisa Maharani')
        : isBrain
        ? (isEven ? 'Raka Pratama' : i % 3 === 0 ? 'Dian Sastrowardoyo' : 'Farhan Maulana')
        : (isEven ? 'Gracella Uhuy' : i % 3 === 0 ? 'Budi Pratama' : 'Siti Rahma')

      baseList.push({
        id: `${idPrefix}${i}`,
        nama: sampleName,
        dd: '01',
        mm: 'Mei',
        yyyy: '2000',
        gender: isEven ? 'P' : 'L',
        gejala: isBone
          ? 'Nyeri tulang tumpul memberat malam hari.'
          : isBrain
          ? 'Nyeri kepala hebat disertai defisit neurologis fokal.'
          : 'Batuk berdahak, sesak ringan.',
        files: [{ name: 'untitled-attachment01.jpeg', size: '128.KB', url: '/sample-xray.jpeg' }],
        aiResult: {
          diagnosis: isEven ? diseaseName : negativeLabel,
          confidence: 90 + (i % 8),
          finding: isBone
            ? 'Lesi osteolitik kortikal disertai reaksi periosteal.'
            : isBrain
            ? 'Massa frontoparietal berbatas tegas.'
            : 'Normal thorax or mild infiltrate.',
        },
        radiologist: defaultDoc,
        verificationDate: isProses ? undefined : '19/10/2026',
        verificationResult: isProses ? undefined : (isEven ? confirmedLabel : negativeLabel),
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

    if (filterType === 'detected') {
      return item.aiResult?.diagnosis.toLowerCase().includes(diseaseName.toLowerCase()) && !item.aiResult?.diagnosis.toLowerCase().includes('bukan')
    }
    if (filterType === 'non_detected') {
      return item.aiResult?.diagnosis.toLowerCase().includes('bukan') || item.aiResult?.diagnosis.toLowerCase().includes('tidak')
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredList.length / 10))

  const handleRowClick = (patient: PatientRecord) => {
    setCurrentCase(patient)
    if (isProses) {
      navigate(`${currentModule.basePath}/detail/radiolog`)
    } else {
      navigate(`${currentModule.basePath}/detail/hasil`)
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
              {filterType === 'detected' ? diseaseName : negativeLabel}
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
              className={`btn ${filterType === 'detected' ? 'btn-neutral' : 'btn-white'}`}
              style={{ justifyContent: 'flex-start', fontSize: 13 }}
              onClick={() => {
                setFilterType('detected')
                setShowFilterDropdown(false)
              }}
            >
              Hanya {diseaseName}
            </button>
            <button
              type="button"
              className={`btn ${filterType === 'non_detected' ? 'btn-neutral' : 'btn-white'}`}
              style={{ justifyContent: 'flex-start', fontSize: 13 }}
              onClick={() => {
                setFilterType('non_detected')
                setShowFilterDropdown(false)
              }}
            >
              {negativeLabel}
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
              const aiDisplay = `${r.aiResult?.diagnosis || diseaseName} | ${r.aiResult?.confidence || 90}%`
              const tglDisplay = isProses ? '-' : (r.verificationDate || '19/10/2026')
              const hasilDisplay = isProses ? 'Dalam Antrean' : (r.verificationResult || negativeLabel)

              return (
                <tr
                  key={r.id + i}
                  style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                  onClick={() => handleRowClick(r)}
                  className="table-row-hover"
                >
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 3,
                          height: 16,
                          backgroundColor: currentModule.color,
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      />
                      <span>{r.id}</span>
                    </div>
                  </td>
                  <td>{r.nama}</td>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        background: 'var(--secondary-200)',
                        color: 'var(--secondary-1000)',
                        fontWeight: 600,
                      }}
                    >
                      {aiDisplay}
                    </span>
                  </td>
                  <td>{r.radiologist || defaultDoc}</td>
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
