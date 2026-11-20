import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Download,
  Calendar,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePneumonia, type PatientRecord } from '../../context/PneumoniaContext'

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

export default function Dashboard() {
  const navigate = useNavigate()
  const { setCurrentCase, addToast } = usePneumonia()

  const [period, setPeriod] = useState<Period>('Harian')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [hoveredInfo, setHoveredInfo] = useState<{ label: string; text: string } | null>(null)

  const currentConfig = dashboardDataset[period]

  const handleDownloadReport = () => {
    let csv = 'ID Rekam Medis,Nama Pasien,Confidence Score AI,Dokter Radiologi,Tanggal Verifikasi,Hasil Verifikasi\n'
    tableRows.forEach((r) => {
      csv += `${r.id},"${r.nama}","${r.score}","${r.radiolog}",${r.tgl},"${r.hasil}"\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `analitik-pemeriksaan-${period.toLowerCase()}.csv`
    link.click()
    addToast(`Laporan analitik pemeriksaan (${period}) berhasil diunduh.`, 'success')
  }

  const tableRows = [
    {
      id: '#PN-0123',
      nama: 'Gracella Uhuy',
      score: 'Pneumonia | 90%',
      radiolog: 'Dr. Tama',
      tgl: '19/10/2026',
      hasil: 'Tidak terdeteksi',
      color: 'var(--quaternary-600)',
    },
    {
      id: '#KT-0124',
      nama: 'Nabila Putri',
      score: 'Kanker Tulang | 94%',
      radiolog: 'Dr. Nadia',
      tgl: '18/10/2026',
      hasil: 'Terdeteksi',
      color: 'var(--primary-600)',
    },
    {
      id: '#TO-0125',
      nama: 'Raka Pratama',
      score: 'Tumor Otak | 92%',
      radiolog: 'Dr. Arif',
      tgl: '17/10/2026',
      hasil: 'Terdeteksi',
      color: 'var(--tertiary-600)',
    },
  ]

  const handleRowClick = (r: (typeof tableRows)[0]) => {
    const isBone = r.id.startsWith('#KT-')
    const isBrain = r.id.startsWith('#TO-')
    const mod = isBone ? 'kanker-tulang' : isBrain ? 'tumor-otak' : 'pneumonia'
    const diseaseName = isBone ? 'Kanker Tulang' : isBrain ? 'Tumor Otak' : 'Pneumonia'

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
    navigate(`/faskes-3t/${mod}/detail/hasil`)
  }

  return (
    <div>
      {/* Header Analitik Pemeriksaan */}
      <div className="section-title" style={{ fontSize: 16, marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Analitik Pemeriksaan</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
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
                {currentConfig.totalPemeriksaan}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              {(['Harian', 'Bulanan', 'Tahunan'] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn ${period === p ? 'btn-neutral' : 'btn-outline'}`}
                  style={{ fontSize: 12, padding: '4px 10px', height: 28 }}
                  onClick={() => setPeriod(p)}
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

              {/* Grouped Bars Container: sits directly on the 0-line */}
              <div
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
                        style={{
                          width: currentConfig.barWidth,
                          height: `${Math.min(100, Math.max(2, greenH))}%`,
                          backgroundColor: 'var(--tertiary-600)',
                          borderRadius: '2px 2px 0 0',
                          cursor: 'pointer',
                          transition: 'height 0.3s ease, opacity 0.15s ease',
                          opacity: hoveredInfo && hoveredInfo.label !== `${idx}-to` ? 0.5 : 1,
                        }}
                        onMouseEnter={() =>
                          setHoveredInfo({ label: `${idx}-to`, text: `${d.label} - Tumor Otak: ${d.tumorOtak}` })
                        }
                        onMouseLeave={() => setHoveredInfo(null)}
                      />

                      {/* Bar 2: Kanker Tulang (Blue) */}
                      <div
                        style={{
                          width: currentConfig.barWidth,
                          height: `${Math.min(100, Math.max(2, blueH))}%`,
                          backgroundColor: 'var(--primary-600)',
                          borderRadius: '2px 2px 0 0',
                          cursor: 'pointer',
                          transition: 'height 0.3s ease, opacity 0.15s ease',
                          opacity: hoveredInfo && hoveredInfo.label !== `${idx}-kt` ? 0.5 : 1,
                        }}
                        onMouseEnter={() =>
                          setHoveredInfo({ label: `${idx}-kt`, text: `${d.label} - Kanker Tulang: ${d.kankerTulang}` })
                        }
                        onMouseLeave={() => setHoveredInfo(null)}
                      />

                      {/* Bar 3: Pneumonia (Purple) */}
                      <div
                        style={{
                          width: currentConfig.barWidth,
                          height: `${Math.min(100, Math.max(2, purpleH))}%`,
                          backgroundColor: 'var(--quaternary-600)',
                          borderRadius: '2px 2px 0 0',
                          cursor: 'pointer',
                          transition: 'height 0.3s ease, opacity 0.15s ease',
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
              <span>Tumor Otak - {currentConfig.legend.tumorOtak}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="sq" style={{ width: 10, height: 10, background: 'var(--primary-600)' }} />
              <span>Kanker Tulang - {currentConfig.legend.kankerTulang}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="sq" style={{ width: 10, height: 10, background: 'var(--quaternary-600)' }} />
              <span>Pneumonia - {currentConfig.legend.pneumonia}</span>
            </div>
          </div>
        </div>

        {/* Side Stat Panel Kanan (Tulisan vertikal di tengah / aligned center, bukan bottom) */}
        <div
          className="panel side-stat"
          style={{
            padding: '8px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#fff',
          }}
        >
          {/* Blok 1: Dokter Aktif */}
          <div className="blk" style={{ padding: '10px 0', borderBottom: '1px solid var(--neutral-300)' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--neutral-800)' }}>Dokter Aktif</div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>{currentConfig.stats.dokterAktif}</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--neutral-1000)', lineHeight: 1 }}>
                Dokter
              </span>
            </div>
          </div>

          {/* Blok 2: Selesai Diverifikasi */}
          <div className="blk" style={{ padding: '10px 0', borderBottom: '1px solid var(--neutral-300)' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--neutral-800)' }}>Selesai Diverifikasi</div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>{currentConfig.stats.selesaiVerifikasi.split(' ')[0]}</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--neutral-1000)', lineHeight: 1 }}>
                Kasus
              </span>
            </div>
          </div>

          {/* Blok 3: Menunggu Verifikasi */}
          <div className="blk" style={{ padding: '10px 0', borderBottom: '1px solid var(--neutral-300)' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--neutral-800)' }}>Menunggu Verifikasi</div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>{currentConfig.stats.menungguVerifikasi.split(' ')[0]}</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--neutral-1000)', lineHeight: 1 }}>
                Kasus
              </span>
            </div>
          </div>

          {/* Blok 4: Rata-rata Keyakinan AI */}
          <div className="blk" style={{ padding: '10px 0', borderBottom: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--neutral-800)' }}>Rata-rata Keyakinan AI</div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>{currentConfig.stats.rataRataKeyakinan}</span>
              <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--neutral-1000)', lineHeight: 1 }}>
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Bawah: Kasus Terkini Lintas Modul */}
      <div
        className="panel"
        style={{
          padding: 0,
          marginTop: 16,
          borderRadius: 12,
          border: '1px solid var(--neutral-300)',
          overflowX: 'auto',
          background: '#fff',
        }}
      >
        <table>
          <thead>
            <tr>
              <th style={{ color: 'inherit', fontWeight: 700, paddingLeft: 20 }}>ID Rekam Medis</th>
              <th style={{ color: 'inherit', fontWeight: 700 }}>Nama Pasien</th>
              <th style={{ color: 'inherit', fontWeight: 700 }}>Confidence Score AI</th>
              <th style={{ color: 'inherit', fontWeight: 700 }}>Dokter Radiologi</th>
              <th style={{ color: 'inherit', fontWeight: 700 }}>Tanggal Verifikasi</th>
              <th style={{ color: 'inherit', fontWeight: 700 }}>Hasil Verifikasi</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {tableRows.map((r, i) => (
              <tr
                key={i}
                style={{
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onClick={() => handleRowClick(r)}
                className="table-row-hover"
              >
                {/* ID with vertical stripe indicator as seen in Figma Desktop-12 */}
                <td style={{ paddingLeft: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 3,
                        height: 16,
                        backgroundColor: r.color,
                        borderRadius: 2,
                        flexShrink: 0,
                      }}
                    />
                    <span>{r.id}</span>
                  </div>
                </td>
                <td>{r.nama}</td>
                <td>{r.score}</td>
                <td>{r.radiolog}</td>
                <td>{r.tgl}</td>
                <td>{r.hasil}</td>
                <td style={{ textAlign: 'right', paddingRight: 20 }}>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      color: 'var(--neutral-1000)',
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
    </div>
  )
}
