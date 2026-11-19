import { useState } from 'react'
import { ChevronDown, ChevronRight, Download, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PneumoniaLayout from '../components/PneumoniaTabs'
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
  const { cases, setCurrentCase, addToast } = usePneumonia()

  const [period, setPeriod] = useState<Period>('Harian')
  const [dateRange, setDateRange] = useState('Mar 27 - Apr 23, 2026')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  const activeStats = statsByPeriod[period]

  const handleDownloadReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,ID,Nama,AI_Score,Radiolog,Tanggal,Hasil\n' +
      '#PN-0123,Gracella Uhuy,90%,Dr. Tama,19/10/2026,Bukan Pneumonia\n' +
      '#PN-0124,Ahmad Dani,94%,Dr. Tama,19/10/2026,Pneumonia\n' +
      '#PN-0125,Siti Nurhaliza,88%,Dr. Bernard Bear,19/10/2026,Bukan Pneumonia\n'

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `laporan-analitik-${period.toLowerCase()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    addToast(`Laporan analitik (${period}) berhasil diunduh.`, 'success')
  }

  const handleRowClick = (c: PatientRecord) => {
    setCurrentCase(c)
    navigate('/faskes-3t/detail/hasil')
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
            Jumlah Kasus Pneumonia Terverifikasi
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
            {cases.slice(0, 3).map((c, i) => (
              <tr
                key={c.id + i}
                style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                onClick={() => handleRowClick(c)}
                className="table-row-hover"
              >
                <td style={{ fontWeight: 600 }}>{c.id}</td>
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
                    {c.aiResult ? `${c.aiResult.diagnosis} | ${c.aiResult.confidence}%` : 'Pneumonia | 90%'}
                  </span>
                </td>
                <td>{c.radiologist || 'Dr. Tama'}</td>
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
                    {c.verificationResult || 'Bukan Pneumonia'}
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
