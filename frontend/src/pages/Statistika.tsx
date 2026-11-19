import { useState } from 'react'
import { ChevronDown, ChevronRight, Download, Calendar } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import PneumoniaLayout, { getModuleInfo } from '../components/PneumoniaTabs'
import { usePneumonia, type PatientRecord } from '../context/PneumoniaContext'

type Period = 'Harian' | 'Bulanan' | 'Tahunan'

interface PeriodData {
  count: string
  activeDoctors: number
  verifiedCases: string
  pendingCases: string
  bars: Array<{ label: string; value: number }>
}

const statsByPeriod: Record<Period, PeriodData> = {
  Harian: {
    count: '100',
    activeDoctors: 34,
    verifiedCases: '34',
    pendingCases: '34',
    bars: [
      { label: '08:00', value: 12 },
      { label: '10:00', value: 24 },
      { label: '12:00', value: 18 },
      { label: '14:00', value: 32 },
      { label: '16:00', value: 28 },
      { label: '18:00', value: 16 },
      { label: '20:00', value: 8 },
    ],
  },
  Bulanan: {
    count: '2.450',
    activeDoctors: 48,
    verifiedCases: '1.820',
    pendingCases: '630',
    bars: [
      { label: 'Minggu 1', value: 520 },
      { label: 'Minggu 2', value: 680 },
      { label: 'Minggu 3', value: 740 },
      { label: 'Minggu 4', value: 510 },
    ],
  },
  Tahunan: {
    count: '28.900',
    activeDoctors: 52,
    verifiedCases: '24.150',
    pendingCases: '4.750',
    bars: [
      { label: 'Jan', value: 2100 },
      { label: 'Feb', value: 2400 },
      { label: 'Mar', value: 2900 },
      { label: 'Apr', value: 2700 },
      { label: 'Mei', value: 3100 },
      { label: 'Jun', value: 2600 },
    ],
  },
}

export default function Statistika() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cases, setCurrentCase, addToast } = usePneumonia()

  const currentModule = getModuleInfo(location.pathname)
  const isBone = currentModule.type === 'kanker-tulang'
  const isBrain = currentModule.type === 'tumor-otak'

  const [period, setPeriod] = useState<Period>('Harian')
  const [dateRange, setDateRange] = useState('Mar 27 - Apr 23, 2026')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  const activeStats = statsByPeriod[period]

  const handleDownloadReport = () => {
    const defaultCsvPrefix = isBone ? '#KT-012' : isBrain ? '#TO-012' : '#PN-012'
    const csvContent =
      'data:text/csv;charset=utf-8,ID,Nama,AI_Score,Radiolog,Tanggal,Hasil\n' +
      `${defaultCsvPrefix}4,Nabila Putri,94%,Dr. Nadia,18/10/2026,Terdeteksi\n` +
      `${defaultCsvPrefix}5,Dimas Anggara,91%,Dr. Nadia,18/10/2026,Tidak terdeteksi\n` +
      `${defaultCsvPrefix}6,Anisa Maharani,95%,Dr. Tama,17/10/2026,Terdeteksi\n`

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `laporan-analitik-${currentModule.type}-${period.toLowerCase()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    addToast(`Laporan analitik ${currentModule.title} (${period}) berhasil diunduh.`, 'success')
  }

  const moduleCases = cases.filter((c) => {
    if (isBone) return c.id.startsWith('#KT-')
    if (isBrain) return c.id.startsWith('#TO-')
    return c.id.startsWith('#PN-')
  })

  const displayCases: PatientRecord[] = [...moduleCases]
  if (displayCases.length < 3) {
    if (isBone) {
      displayCases.push({
        id: '#KT-0125',
        nama: 'Dimas Anggara',
        dd: '12',
        mm: 'Mei',
        yyyy: '1999',
        gender: 'L',
        gejala: 'Nyeri tumpul tungkai kanan.',
        files: [{ name: 'rontgen-02.jpeg', size: '120.KB', url: '/sample-xray.jpeg' }],
        aiResult: { diagnosis: 'Bukan Kanker Tulang', confidence: 91, finding: 'Tidak ditemukan reaksi periosteal agresif.' },
        radiologist: 'Dr. Nadia',
        verificationDate: '18/10/2026',
        verificationResult: 'Bukan Kanker Tulang',
        status: 'terverifikasi',
        createdAt: '2026-10-18',
      })
      displayCases.push({
        id: '#KT-0126',
        nama: 'Anisa Maharani',
        dd: '04',
        mm: 'Jul',
        yyyy: '2001',
        gender: 'P',
        gejala: 'Pembengkakan proksimal tibia kiri.',
        files: [{ name: 'rontgen-03.jpeg', size: '135.KB', url: '/sample-xray.jpeg' }],
        aiResult: { diagnosis: 'Kanker Tulang (Osteosarcoma)', confidence: 95, finding: 'Lesi sklerotik litik campuran.' },
        radiologist: 'Dr. Tama',
        verificationDate: '17/10/2026',
        verificationResult: 'Kanker Tulang Terkonfirmasi',
        status: 'terverifikasi',
        createdAt: '2026-10-17',
      })
    } else if (isBrain) {
      displayCases.push({
        id: '#TO-0126',
        nama: 'Dian Sastrowardoyo',
        dd: '10',
        mm: 'Mar',
        yyyy: '1992',
        gender: 'P',
        gejala: 'Nyeri kepala sebelah kanan berkala.',
        files: [{ name: 'mri-02.jpeg', size: '140.KB', url: '/sample-xray.jpeg' }],
        aiResult: { diagnosis: 'Bukan Tumor Otak', confidence: 89, finding: 'Struktur parenkim serebri dalam batas normal.' },
        radiologist: 'Dr. Arif',
        verificationDate: '17/10/2026',
        verificationResult: 'Bukan Tumor Otak',
        status: 'terverifikasi',
        createdAt: '2026-10-17',
      })
      displayCases.push({
        id: '#TO-0127',
        nama: 'Farhan Maulana',
        dd: '25',
        mm: 'Des',
        yyyy: '1988',
        gender: 'L',
        gejala: 'Gangguan keseimbangan mendadak.',
        files: [{ name: 'mri-03.jpeg', size: '160.KB', url: '/sample-xray.jpeg' }],
        aiResult: { diagnosis: 'Tumor Otak (Meningioma)', confidence: 93, finding: 'Massa ekstra aksial frontoparietal berdensitas padat.' },
        radiologist: 'Dr. Tama',
        verificationDate: '16/10/2026',
        verificationResult: 'Tumor Otak Terkonfirmasi',
        status: 'terverifikasi',
        createdAt: '2026-10-16',
      })
    }
  }

  const handleRowClick = (c: PatientRecord) => {
    setCurrentCase(c)
    navigate(`${currentModule.basePath}/detail/hasil`)
  }

  const maxVal = Math.max(...activeStats.bars.map((b) => b.value))

  return (
    <PneumoniaLayout>
      {/* Judul & Range Tanggal */}
      <div className="section-title" style={{ fontSize: 16 }}>
        <span>Analitik</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: 13, padding: '4px 10px', height: 32 }}
            onClick={() => setShowDatePicker((prev) => !prev)}
          >
            <Calendar size={14} />
            <span>{dateRange}</span>
            <ChevronDown size={14} />
          </button>

          {showDatePicker && (
            <div
              className="popover"
              style={{
                position: 'absolute',
                top: 38,
                right: 36,
                zIndex: 20,
                background: '#fff',
                border: '1px solid var(--neutral-300)',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                padding: 6,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                minWidth: 180,
              }}
            >
              {['Hari Ini', '7 Hari Terakhir', 'Mar 27 - Apr 23, 2026', 'Bulan Ini', 'Tahun 2026'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`btn ${dateRange === r ? 'btn-neutral' : 'btn-white'}`}
                  style={{ justifyContent: 'flex-start', fontSize: 12 }}
                  onClick={() => {
                    setDateRange(r)
                    setShowDatePicker(false)
                    addToast(`Rentang tanggal diubah ke: ${r}`, 'info')
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '6px 8px', height: 32 }}
            onClick={handleDownloadReport}
            title="Unduh Data Analitik CSV"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Grid Grafik dan Statistik Samping */}
      <div className="stat-split">
        {/* Panel Grafik */}
        <div className="panel" style={{ padding: 10, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--neutral-800)' }}>Jumlah Pemeriksaan</span>
            <b style={{ fontSize: 24, flex: 1, letterSpacing: '-0.5px' }}>{activeStats.count}</b>

            {(['Harian', 'Bulanan', 'Tahunan'] as Period[]).map((l) => (
              <button
                key={l}
                type="button"
                className={`btn ${period === l ? 'btn-neutral' : 'btn-outline'}`}
                style={{ fontSize: 12, padding: '4px 10px', height: 28 }}
                onClick={() => setPeriod(l)}
              >
                {l}
              </button>
            ))}
          </div>

          {/* SVG Bar Chart Visualization */}
          <div
            className="canvas"
            style={{
              minHeight: 215,
              flex: 1,
              background: '#f8f9fb',
              border: '1px solid var(--neutral-300)',
              borderRadius: 8,
              padding: '16px 20px 10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: 155,
                gap: 12,
                paddingBottom: 8,
                borderBottom: '1px solid var(--neutral-300)',
              }}
            >
              {activeStats.bars.map((bar, idx) => {
                const heightPercent = Math.max(12, Math.round((bar.value / maxVal) * 100))
                const isHovered = hoveredBar === idx
                return (
                  <div
                    key={bar.label}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {isHovered && (
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#fff',
                          background: 'var(--neutral-800)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          marginBottom: 4,
                          animation: 'fadeIn 0.15s ease',
                        }}
                      >
                        {bar.value}
                      </div>
                    )}
                    <div
                      style={{
                        width: '70%',
                        maxWidth: 36,
                        height: `${heightPercent}%`,
                        backgroundColor: isHovered
                          ? 'var(--quaternary-600)'
                          : idx % 2 === 0
                          ? 'var(--primary-600)'
                          : 'var(--primary-300)',
                        borderRadius: '6px 6px 2px 2px',
                        transition: 'all 0.25s ease',
                      }}
                    />
                  </div>
                )
              })}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 6,
                fontSize: 11,
                color: 'var(--neutral-400)',
              }}
            >
              {activeStats.bars.map((b) => (
                <span key={b.label} style={{ flex: 1, textAlign: 'center' }}>
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Statistik Samping */}
        <div className="panel side-stat" style={{ padding: '0 14px' }}>
          <div className="blk">
            Jumlah Dokter Aktif
            <div className="big">
              {activeStats.activeDoctors}
              <span>Dokter</span>
            </div>
          </div>
          <div className="blk">
            Jumlah Kasus {currentModule.title} Terverifikasi
            <div className="big">
              {activeStats.verifiedCases}
              <span>Kasus</span>
            </div>
          </div>
          <div className="blk">
            Jumlah Kasus Tertunda
            <div className="big">
              {activeStats.pendingCases}
              <span>Kasus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Analitik Kasus Terkini */}
      <div className="section-title" style={{ marginTop: 20, fontWeight: 500 }}>
        Analitik
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
            {displayCases.slice(0, 3).map((c, i) => (
              <tr
                key={c.id + i}
                style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                onClick={() => handleRowClick(c)}
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
                    <span>{c.id}</span>
                  </div>
                </td>
                <td>{c.nama}</td>
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
                    {c.aiResult ? `${c.aiResult.diagnosis} | ${c.aiResult.confidence}%` : `${currentModule.title} | 90%`}
                  </span>
                </td>
                <td>{c.radiologist || (isBone ? 'Dr. Nadia' : isBrain ? 'Dr. Arif' : 'Dr. Tama')}</td>
                <td>{c.verificationDate || '19/10/2026'}</td>
                <td>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      background: 'var(--primary-100)',
                      color: 'var(--primary-600)',
                    }}
                  >
                    {c.verificationResult || (isBone ? 'Terdeteksi' : isBrain ? 'Terdeteksi' : 'Bukan Pneumonia')}
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
                    title="Lihat Detail Hasil"
                  >
                    <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PneumoniaLayout>
  )
}
