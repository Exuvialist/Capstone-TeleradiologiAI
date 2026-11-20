import { useState, useMemo, useEffect } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Download,
  Calendar,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePneumonia, type PatientRecord } from '../../context/PneumoniaContext'
import { formatDisplayDate } from '../../types/patient'

type Period = 'Harian' | 'Bulanan' | 'Tahunan'

interface BarItem {
  label: string
  tumorOtak: number
  kankerTulang: number
  pneumonia: number
}

interface PeriodConfig {
  periodSubtitle: string
  dateRange: string
  totalPemeriksaan: string
  summaryLeft: string
  summaryRight: string
  legend: {
    tumorOtak: number
    kankerTulang: number
    pneumonia: number
  }
  stats: {
    dokterAktif: number
    selesaiVerifikasi: string
    menungguVerifikasi: string
    rataRataKeyakinan: number
  }
  yTicks: number[]
  maxY: number
  barWidth: number
  barGap: number
  data: BarItem[]
}

const dashboardDataset: Record<Period, PeriodConfig> = {
  Harian: {
    periodSubtitle: 'Jumlah pemeriksaan per hari',
    dateRange: '13-19 Okt 2026',
    totalPemeriksaan: '100',
    summaryLeft: '100 pemeriksaan dalam 7 hari',
    summaryRight: 'Dokumentasi terbanyak: 19 pemeriksaan',
    legend: {
      tumorOtak: 30,
      kankerTulang: 25,
      pneumonia: 45,
    },
    stats: {
      dokterAktif: 24,
      selesaiVerifikasi: '86 Kasus',
      menungguVerifikasi: '14 Kasus',
      rataRataKeyakinan: 92,
    },
    yTicks: [10, 8, 6, 4, 2, 0],
    maxY: 10,
    barWidth: 8,
    barGap: 3,
    data: [
      { label: '13 Okt', tumorOtak: 3, kankerTulang: 3, pneumonia: 5 },
      { label: '14 Okt', tumorOtak: 4, kankerTulang: 2, pneumonia: 6 },
      { label: '15 Okt', tumorOtak: 2, kankerTulang: 4, pneumonia: 4 },
      { label: '16 Okt', tumorOtak: 5, kankerTulang: 3, pneumonia: 7 },
      { label: '17 Okt', tumorOtak: 4, kankerTulang: 5, pneumonia: 6 },
      { label: '18 Okt', tumorOtak: 6, kankerTulang: 3, pneumonia: 8 },
      { label: '19 Okt', tumorOtak: 6, kankerTulang: 5, pneumonia: 9 },
    ],
  },
  Bulanan: {
    periodSubtitle: 'Jumlah pemeriksaan per bulan',
    dateRange: 'Tahun 2026',
    totalPemeriksaan: '2.450',
    summaryLeft: '2.450 pemeriksaan dalam 12 bulan',
    summaryRight: 'Dokumentasi terbanyak: 280 pemeriksaan',
    legend: {
      tumorOtak: 720,
      kankerTulang: 680,
      pneumonia: 1050,
    },
    stats: {
      dokterAktif: 36,
      selesaiVerifikasi: '2.180 Kasus',
      menungguVerifikasi: '270 Kasus',
      rataRataKeyakinan: 94,
    },
    yTicks: [100, 80, 60, 40, 20, 0],
    maxY: 100,
    barWidth: 5,
    barGap: 2,
    data: [
      { label: 'Jan', tumorOtak: 45, kankerTulang: 50, pneumonia: 75 },
      { label: 'Feb', tumorOtak: 55, kankerTulang: 45, pneumonia: 80 },
      { label: 'Mar', tumorOtak: 60, kankerTulang: 55, pneumonia: 90 },
      { label: 'Apr', tumorOtak: 50, kankerTulang: 60, pneumonia: 85 },
      { label: 'Mei', tumorOtak: 65, kankerTulang: 60, pneumonia: 95 },
      { label: 'Jun', tumorOtak: 70, kankerTulang: 55, pneumonia: 85 },
      { label: 'Jul', tumorOtak: 55, kankerTulang: 65, pneumonia: 90 },
      { label: 'Agu', tumorOtak: 60, kankerTulang: 55, pneumonia: 85 },
      { label: 'Sep', tumorOtak: 65, kankerTulang: 55, pneumonia: 90 },
      { label: 'Okt', tumorOtak: 75, kankerTulang: 60, pneumonia: 95 },
      { label: 'Nov', tumorOtak: 60, kankerTulang: 60, pneumonia: 85 },
      { label: 'Des', tumorOtak: 60, kankerTulang: 60, pneumonia: 95 },
    ],
  },
  Tahunan: {
    periodSubtitle: 'Jumlah pemeriksaan per tahun',
    dateRange: '2022 - 2026',
    totalPemeriksaan: '12.850',
    summaryLeft: '12.850 pemeriksaan dalam 5 tahun',
    summaryRight: 'Dokumentasi terbanyak: 3.450 pemeriksaan',
    legend: {
      tumorOtak: 3800,
      kankerTulang: 3450,
      pneumonia: 5600,
    },
    stats: {
      dokterAktif: 48,
      selesaiVerifikasi: '11.950 Kasus',
      menungguVerifikasi: '900 Kasus',
      rataRataKeyakinan: 95,
    },
    yTicks: [1500, 1200, 900, 600, 300, 0],
    maxY: 1500,
    barWidth: 14,
    barGap: 4,
    data: [
      { label: '2022', tumorOtak: 500, kankerTulang: 450, pneumonia: 750 },
      { label: '2023', tumorOtak: 650, kankerTulang: 600, pneumonia: 950 },
      { label: '2024', tumorOtak: 800, kankerTulang: 750, pneumonia: 1200 },
      { label: '2025', tumorOtak: 900, kankerTulang: 800, pneumonia: 1300 },
      { label: '2026', tumorOtak: 950, kankerTulang: 850, pneumonia: 1400 },
    ],
  },
}

function CountUp({ to, duration = 500 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const stepTime = 16
    const steps = Math.max(1, Math.floor(duration / stepTime))
    const increment = to / steps
    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      start += increment
      if (currentStep >= steps) {
        setVal(to)
        clearInterval(timer)
      } else {
        setVal(Math.round(start))
      }
    }, stepTime)
    return () => clearInterval(timer)
  }, [to, duration])
  return <>{val.toLocaleString('id-ID')}</>
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { cases, setCurrentCase, addToast } = usePneumonia()

  const [period, setPeriod] = useState<Period>('Harian')
  const [animKey, setAnimKey] = useState(0)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [hoveredInfo, setHoveredInfo] = useState<{ label: string; text: string } | null>(null)

  const currentConfig = dashboardDataset[period]

  // Dynamic metrics from live dataset
  const liveVerifiedCount = cases.filter((c) => c.status === 'terverifikasi').length || 86
  const livePendingCount = cases.filter((c) => c.status === 'menunggu' || c.status === 'proses').length || 14
  const liveAvgConf = useMemo(() => {
    const scores = cases.map((c) => c.aiResult?.confidence).filter((s): s is number => typeof s === 'number' && s > 0)
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 92
  }, [cases])

  const dynamicTableRows = useMemo(() => {
    const liveList = cases.slice(0, 5).map((c) => {
      const diag = c.aiResult?.diagnosis || 'Pneumonia'
      const conf = c.aiResult?.confidence || 90
      const isBone = diag.includes('Kanker') || c.id.startsWith('#KT-')
      const isBrain = diag.includes('Tumor') || c.id.startsWith('#TO-')
      const cat = isBone ? 'Kanker Tulang' : isBrain ? 'Tumor Otak' : 'Pneumonia'
      const dStr = formatDisplayDate(c.verificationDate || c.createdAt)
      return {
        id: c.id,
        nama: c.nama || 'Pasien Faskes',
        jenis: cat,
        score: `${cat} | ${conf}%`,
        radiolog: c.radiologist || 'Dr. Shinyu',
        tgl: dStr,
        hasil: c.verificationResult || (c.status === 'terverifikasi' ? 'Terdeteksi' : 'Menunggu'),
        rawCase: c,
      }
    })
    if (liveList.length > 0) return liveList
    return [
      { id: '#PN-0123', nama: 'Gracella Uhuy', jenis: 'Pneumonia', score: 'Pneumonia | 90%', radiolog: 'Dr. Tama', tgl: '19/10/2026', hasil: 'Tidak terdeteksi', rawCase: undefined as PatientRecord | undefined },
      { id: '#KT-0124', nama: 'Nabila Putri', jenis: 'Kanker Tulang', score: 'Kanker Tulang | 94%', radiolog: 'Dr. Nadia', tgl: '18/10/2026', hasil: 'Terdeteksi', rawCase: undefined as PatientRecord | undefined },
      { id: '#TO-0125', nama: 'Raka Pratama', jenis: 'Tumor Otak', score: 'Tumor Otak | 92%', radiolog: 'Dr. Arif', tgl: '17/10/2026', hasil: 'Terdeteksi', rawCase: undefined as PatientRecord | undefined },
    ]
  }, [cases])

  const handleDownloadReport = () => {
    let csv = 'ID Rekam Medis,Nama Pasien,Confidence Score AI,Dokter Radiologi,Tanggal Verifikasi,Hasil Verifikasi\n'
    dynamicTableRows.forEach((r) => {
      csv += `${r.id},"${r.nama}","${r.score}","${r.radiolog}",${r.tgl},"${r.hasil}"\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `analitik-pemeriksaan-${period.toLowerCase()}.csv`
    link.click()
    addToast(`Laporan analitik pemeriksaan (${period}) berhasil diunduh.`, 'success')
  }

  const handleRowClick = (r: (typeof dynamicTableRows)[0]) => {
    const isBone = r.jenis === 'Kanker Tulang' || r.id.startsWith('#KT-')
    const isBrain = r.jenis === 'Tumor Otak' || r.id.startsWith('#TO-')
    const mod = isBone ? 'kanker-tulang' : isBrain ? 'tumor-otak' : 'pneumonia'
    const diseaseName = isBone ? 'Kanker Tulang' : isBrain ? 'Tumor Otak' : 'Pneumonia'

    if (r.rawCase) {
      setCurrentCase(r.rawCase)
    } else {
      const dummy: PatientRecord = {
        id: r.id,
        nama: r.nama,
        dd: '01',
        mm: 'Mei',
        yyyy: '2000',
        gender: 'P',
        gejala: isBone
          ? 'Nyeri tulang tumpul memberat malam hari.'
          : isBrain
          ? 'Nyeri kepala hebat disertai defisit neurologis fokal.'
          : 'Pasien datang dengan keluhan klinis yang memerlukan evaluasi radiologi teleradiologi AI.',
        files: [{ name: 'untitled-attachment01.jpeg', size: '128.KB', url: '/sample-xray.jpeg' }],
        aiResult: {
          diagnosis: r.score.split('|')[0].trim(),
          confidence: parseInt(r.score.split('|')[1]?.replace('%', '').trim() || '90', 10),
          finding: 'Evaluasi radiologis komprehensif.',
        },
        radiologist: r.radiolog,
        verificationDate: r.tgl,
        verificationResult: r.hasil === 'Tidak terdeteksi' ? `Bukan ${diseaseName}` : `${diseaseName} Terkonfirmasi`,
        status: 'terverifikasi',
        createdAt: '2026-10-19',
      }
      setCurrentCase(dummy)
    }
    navigate(`/faskes-3t/${mod}/detail/hasil`)
  }

  return (
    <div>
      {/* Header Analitik Pemeriksaan */}
      <div
        className="page-title"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          marginBottom: 14,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--neutral-1000)' }}>
          Analitik Pemeriksaan
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', marginLeft: 'auto' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: 13, padding: '4px 10px', height: 32 }}
            onClick={() => setShowDatePicker((prev) => !prev)}
          >
            <span>{currentConfig.dateRange}</span>
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
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                padding: 6,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                minWidth: 170,
              }}
            >
              {(['Harian', 'Bulanan', 'Tahunan'] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn ${period === p ? 'btn-neutral' : 'btn-white'}`}
                  style={{ justifyContent: 'flex-start', fontSize: 12 }}
                  onClick={() => {
                    setPeriod(p)
                    setAnimKey((k) => k + 1)
                    setShowDatePicker(false)
                    addToast(`Tampilan analitik diubah ke: ${p}`, 'info')
                  }}
                >
                  <Calendar size={13} />
                  <span>{dashboardDataset[p].dateRange} ({p})</span>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '6px 8px', height: 32 }}
            onClick={handleDownloadReport}
            title="Unduh Laporan Analitik"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Split Grid: Grafik & Side Stat */}
      <div className="stat-split" style={{ gridTemplateColumns: '1fr 240px', gap: 12 }}>
        {/* Panel Grafik Kiri */}
        <div className="panel" style={{ padding: 16, display: 'flex', flexDirection: 'column' }}>
          {/* Baris Atas Total & Tombol Periode */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--neutral-400)' }}>Total Pemeriksaan</div>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginTop: 2 }}>
                <CountUp to={parseInt(currentConfig.totalPemeriksaan.replace(/\./g, ''), 10)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              {(['Harian', 'Bulanan', 'Tahunan'] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn ${period === p ? 'btn-neutral' : 'btn-outline'}`}
                  style={{ fontSize: 12, padding: '4px 10px', height: 28 }}
                  onClick={() => {
                    setPeriod(p)
                    setAnimKey((k) => k + 1)
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Subtext info yang berganti dinamis sesuai periode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--neutral-400)', marginBottom: 16 }}>
            <span>{currentConfig.periodSubtitle}</span>
            <span>Contoh data: {currentConfig.dateRange}</span>
          </div>

          {/* Chart Viewport: Grid Y-Axis, Bars sitting ON 0-line, and X-axis strictly BELOW 0-line */}
          <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
            {/* Plot Area with Grid Lines */}
            <div
              style={{
                position: 'relative',
                height: 160,
                marginLeft: 28,
                marginRight: 8,
              }}
            >
              {/* Grid Lines + Y-axis labels */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  pointerEvents: 'none',
                }}
              >
                {currentConfig.yTicks.map((v, i) => (
                  <div
                    key={v + '-' + i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      height: 1,
                      position: 'relative',
                    }}
                  >
                    {/* Y label positioned left outside plot */}
                    <span
                      style={{
                        position: 'absolute',
                        right: '100%',
                        marginRight: 8,
                        fontSize: 10,
                        color: 'var(--neutral-400)',
                        textAlign: 'right',
                        width: 28,
                      }}
                    >
                      {v}
                    </span>
                    {/* Horizontal Line: 0 is solid baseline, others dashed */}
                    <div
                      style={{
                        flex: 1,
                        borderBottom: v === 0 ? '1.5px solid #c3c1c1' : '1px dashed #e1e0e0',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Grouped Bars Container: sits directly on the 0-line with grow animation */}
              <div
                key={`anim-${animKey}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-around',
                  paddingLeft: 4,
                  paddingRight: 4,
                  zIndex: 2,
                }}
              >
                {currentConfig.data.map((d, idx) => {
                  const greenH = (d.tumorOtak / currentConfig.maxY) * 100
                  const blueH = (d.kankerTulang / currentConfig.maxY) * 100
                  const purpleH = (d.pneumonia / currentConfig.maxY) * 100

                  return (
                    <div
                      key={d.label + idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        gap: currentConfig.barGap,
                        height: '100%',
                        flex: 1,
                      }}
                    >
                      {/* Bar 1: Tumor Otak (Green) */}
                      <div
                        className="chart-bar-grow"
                        style={{
                          width: currentConfig.barWidth,
                          height: `${Math.min(100, Math.max(2, greenH))}%`,
                          backgroundColor: 'var(--tertiary-600)',
                          borderRadius: '2px 2px 0 0',
                          cursor: 'pointer',
                          animationDelay: `${idx * 25}ms`,
                          opacity: hoveredInfo && hoveredInfo.label !== `${idx}-to` ? 0.5 : 1,
                        }}
                        onMouseEnter={() =>
                          setHoveredInfo({ label: `${idx}-to`, text: `${d.label} - Tumor Otak: ${d.tumorOtak}` })
                        }
                        onMouseLeave={() => setHoveredInfo(null)}
                      />

                      {/* Bar 2: Kanker Tulang (Blue) */}
                      <div
                        className="chart-bar-grow"
                        style={{
                          width: currentConfig.barWidth,
                          height: `${Math.min(100, Math.max(2, blueH))}%`,
                          backgroundColor: 'var(--primary-600)',
                          borderRadius: '2px 2px 0 0',
                          cursor: 'pointer',
                          animationDelay: `${idx * 25 + 1 * 35}ms`,
                          opacity: hoveredInfo && hoveredInfo.label !== `${idx}-kt` ? 0.5 : 1,
                        }}
                        onMouseEnter={() =>
                          setHoveredInfo({ label: `${idx}-kt`, text: `${d.label} - Kanker Tulang: ${d.kankerTulang}` })
                        }
                        onMouseLeave={() => setHoveredInfo(null)}
                      />

                      {/* Bar 3: Pneumonia (Purple) */}
                      <div
                        className="chart-bar-grow"
                        style={{
                          width: currentConfig.barWidth,
                          height: `${Math.min(100, Math.max(2, purpleH))}%`,
                          backgroundColor: 'var(--quaternary-600)',
                          borderRadius: '2px 2px 0 0',
                          cursor: 'pointer',
                          animationDelay: `${idx * 25 + 2 * 35}ms`,
                          opacity: hoveredInfo && hoveredInfo.label !== `${idx}-pn` ? 0.5 : 1,
                        }}
                        onMouseEnter={() =>
                          setHoveredInfo({ label: `${idx}-pn`, text: `${d.label} - Pneumonia: ${d.pneumonia}` })
                        }
                        onMouseLeave={() => setHoveredInfo(null)}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* X-Axis Labels Row: Strictly BELOW the 0-line and centered */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginLeft: 28,
                marginRight: 8,
                marginTop: 8,
                paddingLeft: 4,
                paddingRight: 4,
              }}
            >
              {currentConfig.data.map((d) => (
                <div
                  key={d.label}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: period === 'Bulanan' ? 10 : 11,
                    color: 'var(--neutral-400)',
                    lineHeight: 1.2,
                  }}
                >
                  {d.label}
                </div>
              ))}
            </div>

            {/* Floating Tooltip info on hover */}
            {hoveredInfo && (
              <div
                style={{
                  position: 'absolute',
                  top: -28,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--neutral-800)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 4,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  pointerEvents: 'none',
                  animation: 'fadeIn 0.15s ease',
                }}
              >
                {hoveredInfo.text}
              </div>
            )}
          </div>

          {/* Subtext Bawah Grafik */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              color: 'var(--neutral-400)',
              marginTop: 14,
              paddingTop: 10,
              borderTop: '1px solid var(--neutral-200)',
            }}
          >
            <span>{currentConfig.summaryLeft}</span>
            <span>{currentConfig.summaryRight}</span>
          </div>

          {/* Legenda Grafik dengan Angka Dinamis */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginTop: 10,
              fontSize: 11,
              color: 'var(--neutral-800)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="sq" style={{ width: 10, height: 10, background: 'var(--tertiary-600)' }} />
              <span>Tumor Otak - <CountUp to={currentConfig.legend.tumorOtak} /></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="sq" style={{ width: 10, height: 10, background: 'var(--primary-600)' }} />
              <span>Kanker Tulang - <CountUp to={currentConfig.legend.kankerTulang} /></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="sq" style={{ width: 10, height: 10, background: 'var(--quaternary-600)' }} />
              <span>Pneumonia - <CountUp to={currentConfig.legend.pneumonia} /></span>
            </div>
          </div>
        </div>

        {/* Side Stat Panel Kanan (Tulisan vertikal di tengah / aligned center, bukan bottom) */}
        <div
          className="panel side-stat"
          style={{
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#fff',
          }}
        >
          {/* Blok 1: Dokter Aktif */}
          <div className="blk" style={{ padding: '8px 0', borderBottom: '1px solid var(--neutral-300)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-1000)' }}>Dokter Aktif</div>
            <div
              style={{
                fontSize: 38,
                lineHeight: '44px',
                fontWeight: 700,
                marginTop: 4,
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
              }}
            >
              <span><CountUp to={currentConfig.stats.dokterAktif} /></span>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--neutral-600)' }}>
                Dokter
              </span>
            </div>
          </div>

          {/* Blok 2: Selesai Diverifikasi */}
          <div className="blk" style={{ padding: '8px 0', borderBottom: '1px solid var(--neutral-300)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-1000)' }}>Selesai Diverifikasi</div>
            <div
              style={{
                fontSize: 38,
                lineHeight: '44px',
                fontWeight: 700,
                marginTop: 4,
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
              }}
            >
              <span><CountUp to={liveVerifiedCount} /></span>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--neutral-600)' }}>
                Kasus
              </span>
            </div>
          </div>

          {/* Blok 3: Menunggu Verifikasi */}
          <div className="blk" style={{ padding: '8px 0', borderBottom: '1px solid var(--neutral-300)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-1000)' }}>Menunggu Verifikasi</div>
            <div
              style={{
                fontSize: 38,
                lineHeight: '44px',
                fontWeight: 700,
                marginTop: 4,
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
              }}
            >
              <span><CountUp to={livePendingCount} /></span>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--neutral-600)' }}>
                Kasus
              </span>
            </div>
          </div>

          {/* Blok 4: Rata-rata Keyakinan AI */}
          <div className="blk" style={{ padding: '8px 0', borderBottom: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-1000)' }}>Rata-rata Keyakinan AI</div>
            <div
              style={{
                fontSize: 38,
                lineHeight: '44px',
                fontWeight: 700,
                marginTop: 4,
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
              }}
            >
              <span><CountUp to={liveAvgConf} /></span>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--neutral-600)' }}>
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Bawah: Kasus Terkini Lintas Modul (Format Seragam dengan Radiolog) */}
      <div className="card" style={{ padding: '14px 16px', marginTop: 16 }}>
        <div className="thead" style={{ fontSize: 13, paddingBottom: 10, marginBottom: 10 }}>
          <span className="w150">ID Rekam Medis</span>
          <span className="w150">Nama Pasien</span>
          <span className="w150">Jenis Pemeriksaan</span>
          <span className="w150">Tanggal Verifikasi</span>
          <span className="w200">Confidence Score AI</span>
        </div>

        {dynamicTableRows.map((r) => (
          <div
            key={r.id}
            className="trow"
            style={{ padding: '6px 4px', fontSize: 14 }}
            onClick={() => handleRowClick(r)}
          >
            <div className="cells">
              <span className="w150" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                {r.id}
              </span>
              <span className="w150">{r.nama}</span>
              <span className="w150">{r.jenis}</span>
              <span className="w150">{r.tgl}</span>
              <span className="w200">{r.score}</span>
            </div>
            <ChevronRight size={16} className="ico" />
          </div>
        ))}
      </div>
    </div>
  )
}
