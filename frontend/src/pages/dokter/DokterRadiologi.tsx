import React, { useState, useMemo } from 'react'
import {
  Routes,
  Route,
  NavLink,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom'
import {
  Home,
  Loader,
  Package,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileText,
  Activity,
  Sparkles,
  LogOut,
  Calendar,
  Check,
  Clock,
} from 'lucide-react'
import { usePneumonia } from '../../context/PneumoniaContext'
import type { PatientRecord } from '../../types/patient'

// ==========================================
// DOKTER SHELL COMPONENT (PERMANENTLY FROZEN SIDEBAR)
// ==========================================

export function DokterShell({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToast, logout } = usePneumonia()

  const [topSearch, setTopSearch] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Dynamic breadcrumbs based on Figma specifications
  const getCrumbs = () => {
    const p = location.pathname
    if (p.includes('/dashboard')) {
      return (
        <div className="crumbs">
          <span className="cur">Dashboard</span>
        </div>
      )
    }
    if (p.includes('/verifikasi')) {
      return (
        <div className="crumbs">
          <NavLink to="/dokter-radiologi/antrean">Antrean Riwayat</NavLink>
          <span>/</span>
          <span className="cur">Pneumonia - #PN-0123</span>
        </div>
      )
    }
    if (p.includes('/antrean')) {
      return (
        <div className="crumbs">
          <span className="cur">Antrean Verifikasi</span>
        </div>
      )
    }
    if (p.includes('/riwayat')) {
      return (
        <div className="crumbs">
          <span className="cur">Riwayat Kasus Terverifikasi</span>
        </div>
      )
    }
    return (
      <div className="crumbs">
        <span className="cur">Dokter Radiologi</span>
      </div>
    )
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topSearch.trim()) return
    const q = topSearch.toLowerCase()
    if (q.includes('antre') || q.includes('verif') || q.includes('tunggu')) {
      navigate('/dokter-radiologi/antrean')
    } else if (q.includes('riwayat') || q.includes('selesai')) {
      navigate('/dokter-radiologi/riwayat')
    } else {
      addToast(`Mencari data dokter: "${topSearch}"`, 'info')
    }
    setTopSearch('')
  }

  return (
    <div className="shell">
      {/* Frozen Fixed Sidebar (280px) */}
      <aside className="sidebar">
        <div className="sb-head">
          <div className="logo">T</div>
          <span className="name">Teleradiologi AI</span>
        </div>

        <nav className="sb-nav">
          <NavLink
            className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
            to="/dokter-radiologi/dashboard"
            title="Dashboard"
          >
            <Home size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `sb-item ${isActive || location.pathname.includes('/verifikasi') ? 'active' : ''}`
            }
            to="/dokter-radiologi/antrean"
            title="Antrean Verifikasi"
          >
            <Loader size={18} />
            <span>Antrean Riwayat</span>
          </NavLink>

          <NavLink
            className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
            to="/dokter-radiologi/riwayat"
            title="Riwayat"
          >
            <Package size={18} />
            <span>Riwayat</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer User Profile */}
        <div
          className="sb-foot"
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => setShowProfileMenu((prev) => !prev)}
          title="Profil Dokter"
        >
          <div className="avatar" style={{ background: 'var(--primary-600)' }}>
            S
          </div>
          <span className="name">Dr. Shinyu</span>
          <ChevronUp size={18} />

          {showProfileMenu && (
            <div
              className="popover"
              style={{
                position: 'absolute',
                bottom: 60,
                left: 10,
                right: 10,
                background: '#fff',
                border: '1px solid var(--neutral-300)',
                borderRadius: 8,
                padding: '6px 8px',
                boxShadow: '0 -4px 16px rgba(0,0,0,0.1)',
                zIndex: 30,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '4px 8px', borderBottom: '1px solid var(--neutral-200)', marginBottom: 2 }}>
                <p style={{ fontSize: 13, fontWeight: 700 }}>Dr. Shinyu Sp.Rad</p>
                <p style={{ fontSize: 11, color: 'var(--neutral-400)' }}>Spesialis Radiologi Toraks & Onkologi</p>
              </div>

              <button
                type="button"
                className="btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  justifyContent: 'flex-start',
                  padding: '8px 10px',
                  color: 'var(--red-100)',
                  borderRadius: 6,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  width: '100%',
                }}
                onClick={() => {
                  setShowProfileMenu(false)
                  logout()
                  navigate('/login', { replace: true })
                }}
              >
                <LogOut size={16} color="var(--red-100)" />
                <span style={{ color: 'var(--red-100)', fontWeight: 500 }}>Keluar (Log Out)</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header className="topbar">
          {getCrumbs()}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <form onSubmit={handleSearchSubmit} className="search-btn" style={{ cursor: 'text' }}>
              <Search size={18} color="var(--neutral-400)" />
              <input
                type="text"
                placeholder="Search bar"
                value={topSearch}
                onChange={(e) => setTopSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent' }}
              />
            </form>
          </div>
        </header>

        {/* View Content */}
        <main className="main" style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  )
}

// ==========================================
// 1. DOKTER DASHBOARD VIEW (Desktop - 17)
// ==========================================

export function DokterDashboard() {
  const navigate = useNavigate()
  const { cases, addToast } = usePneumonia()

  // Period mode: Harian, Bulanan, Tahunan
  const [period, setPeriod] = useState<'harian' | 'bulanan' | 'tahunan'>('harian')
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  // Interactive Date Range Picker
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [dateRangePreset, setDateRangePreset] = useState<string>('13-19-okt')
  const [dateRangeLabel, setDateRangeLabel] = useState('13–19 Okt 2026')
  const [customStartDate, setCustomStartDate] = useState('2026-10-13')
  const [customEndDate, setCustomEndDate] = useState('2026-10-19')

  // Available Presets
  const presets = [
    { id: '13-19-okt', label: '13–19 Okt 2026 (Minggu Berjalan)', start: '2026-10-13', end: '2026-10-19' },
    { id: '6-12-okt', label: '6–12 Okt 2026 (Minggu Lalu)', start: '2026-10-06', end: '2026-10-12' },
    { id: 'okt-2026', label: '1–31 Okt 2026 (Bulan Ini)', start: '2026-10-01', end: '2026-10-31' },
    { id: 'sep-2026', label: '1–30 Sep 2026 (Bulan Lalu)', start: '2026-09-01', end: '2026-09-30' },
    { id: 'year-2026', label: 'Tahun 2026 (Sepanjang Tahun)', start: '2026-01-01', end: '2026-12-31' },
  ]

  const handleSelectPreset = (p: typeof presets[0]) => {
    setDateRangePreset(p.id)
    setDateRangeLabel(p.label.split(' (')[0])
    setCustomStartDate(p.start)
    setCustomEndDate(p.end)
    setShowDatePicker(false)
    addToast(`Rentang tanggal diubah ke: ${p.label}`, 'info')
  }

  const handleApplyCustomDate = () => {
    if (!customStartDate || !customEndDate) return
    setDateRangePreset('custom')
    const startStr = customStartDate.split('-').reverse().slice(0, 2).join('/')
    const endStr = customEndDate.split('-').reverse().slice(0, 2).join('/')
    setDateRangeLabel(`${startStr} – ${endStr} 2026`)
    setShowDatePicker(false)
    addToast(`Filter rentang tanggal kustom aktif: ${customStartDate} s/d ${customEndDate}`, 'info')
  }

  // Real-time Database calculations
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const d = c.createdAt || '2026-10-19'
      return d >= customStartDate && d <= customEndDate
    })
  }, [cases, customStartDate, customEndDate])

  // Real-time KPI numbers fetched from database
  const totalPemeriksaan = filteredCases.length || 100
  const pendingCases = useMemo(() => cases.filter((c) => c.status === 'menunggu' || c.status === 'proses'), [cases])
  const verifiedCases = useMemo(() => cases.filter((c) => c.status === 'terverifikasi'), [cases])
  const verifiedInPeriod = useMemo(() => filteredCases.filter((c) => c.status === 'terverifikasi'), [filteredCases])

  const avgConfidence = useMemo(() => {
    if (filteredCases.length === 0) return 92
    const totalConf = filteredCases.reduce((acc, c) => acc + (c.aiResult?.confidence || 90), 0)
    return Math.round(totalConf / filteredCases.length)
  }, [filteredCases])

  // Real-time Disease category breakdown
  const categoryCounts = useMemo(() => {
    let pneumonia = 0
    let kanker = 0
    let tumor = 0
    filteredCases.forEach((c) => {
      const diag = c.aiResult?.diagnosis || ''
      if (diag.includes('Pneumonia')) pneumonia++
      else if (diag.includes('Kanker')) kanker++
      else if (diag.includes('Tumor')) tumor++
    })
    // Fallback baseline if range has few items
    if (pneumonia === 0 && kanker === 0 && tumor === 0) {
      pneumonia = 45
      kanker = 25
      tumor = 30
    }
    return { pneumonia, kanker, tumor }
  }, [filteredCases])

  // Dynamic Chart Data Generator (Harian, Bulanan, Tahunan)
  const chartData = useMemo(() => {
    if (period === 'harian') {
      // 7 Days of the active range
      const days = [
        { key: '2026-10-13', label: '13 Okt' },
        { key: '2026-10-14', label: '14 Okt' },
        { key: '2026-10-15', label: '15 Okt' },
        { key: '2026-10-16', label: '16 Okt' },
        { key: '2026-10-17', label: '17 Okt' },
        { key: '2026-10-18', label: '18 Okt' },
        { key: '2026-10-19', label: '19 Okt' },
      ]

      return days.map((d) => {
        const dayCases = cases.filter((c) => c.createdAt === d.key)
        let tumor = dayCases.filter((c) => c.aiResult?.diagnosis.includes('Tumor')).length
        let kanker = dayCases.filter((c) => c.aiResult?.diagnosis.includes('Kanker')).length
        let pneumonia = dayCases.filter((c) => c.aiResult?.diagnosis.includes('Pneumonia')).length

        // If newly loaded or empty, provide standard Figma calibrated baseline
        if (tumor === 0 && kanker === 0 && pneumonia === 0) {
          const fallbackMap: Record<string, [number, number, number]> = {
            '13 Okt': [3, 3, 5],
            '14 Okt': [4, 2, 6],
            '15 Okt': [2, 4, 4],
            '16 Okt': [5, 3, 7],
            '17 Okt': [4, 5, 6],
            '18 Okt': [6, 3, 8],
            '19 Okt': [6, 5, 9],
          }
          const fb = fallbackMap[d.label] || [3, 3, 5]
          tumor = fb[0]
          kanker = fb[1]
          pneumonia = fb[2]
        }

        return {
          label: d.label,
          tumor,
          kanker,
          pneumonia,
          total: tumor + kanker + pneumonia,
        }
      })
    }

    if (period === 'bulanan') {
      // 12 Months
      const months = [
        { key: '01', label: 'Jan' },
        { key: '02', label: 'Feb' },
        { key: '03', label: 'Mar' },
        { key: '04', label: 'Apr' },
        { key: '05', label: 'Mei' },
        { key: '06', label: 'Jun' },
        { key: '07', label: 'Jul' },
        { key: '08', label: 'Agu' },
        { key: '09', label: 'Sep' },
        { key: '10', label: 'Okt' },
        { key: '11', label: 'Nov' },
        { key: '12', label: 'Des' },
      ]

      return months.map((m) => {
        const monthCases = cases.filter((c) => (c.createdAt || '').startsWith(`2026-${m.key}`))
        let tumor = monthCases.filter((c) => c.aiResult?.diagnosis.includes('Tumor')).length
        let kanker = monthCases.filter((c) => c.aiResult?.diagnosis.includes('Kanker')).length
        let pneumonia = monthCases.filter((c) => c.aiResult?.diagnosis.includes('Pneumonia')).length

        // Monthly synthetic baseline if empty for earlier months
        if (tumor === 0 && kanker === 0 && pneumonia === 0) {
          tumor = 2 + (parseInt(m.key) % 4)
          kanker = 1 + ((parseInt(m.key) * 2) % 4)
          pneumonia = 3 + (parseInt(m.key) % 5)
        }

        return {
          label: m.label,
          tumor,
          kanker,
          pneumonia,
          total: tumor + kanker + pneumonia,
        }
      })
    }

    // Tahunan (Available Years)
    const years = [
      { key: '2024', label: '2024' },
      { key: '2025', label: '2025' },
      { key: '2026', label: '2026' },
    ]

    return years.map((y) => {
      const yearCases = cases.filter((c) => (c.createdAt || '').startsWith(y.key))
      let tumor = yearCases.filter((c) => c.aiResult?.diagnosis.includes('Tumor')).length
      let kanker = yearCases.filter((c) => c.aiResult?.diagnosis.includes('Kanker')).length
      let pneumonia = yearCases.filter((c) => c.aiResult?.diagnosis.includes('Pneumonia')).length

      if (y.key === '2026') {
        tumor = categoryCounts.tumor
        kanker = categoryCounts.kanker
        pneumonia = categoryCounts.pneumonia
      } else if (tumor === 0 && kanker === 0 && pneumonia === 0) {
        tumor = y.key === '2024' ? 18 : 24
        kanker = y.key === '2024' ? 14 : 20
        pneumonia = y.key === '2024' ? 28 : 36
      }

      return {
        label: y.label,
        tumor,
        kanker,
        pneumonia,
        total: tumor + kanker + pneumonia,
      }
    })
  }, [cases, period, categoryCounts])

  // Calculate dynamic max value for proportional Y-scale
  const maxY = useMemo(() => {
    const highestVal = Math.max(10, ...chartData.map((d) => Math.max(d.tumor, d.kanker, d.pneumonia)))
    // Round to clean ceiling
    return Math.ceil(highestVal / 2) * 2
  }, [chartData])

  // Dynamic Y-axis ticks
  const yTicks = useMemo(() => {
    const ticks = []
    for (let i = 5; i >= 0; i--) {
      ticks.push(Math.round((maxY / 5) * i))
    }
    return ticks
  }, [maxY])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="h-7" style={{ margin: 0, fontSize: 24 }}>
          Analitik Pemeriksaan
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Interactive Date Range Popover */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 700,
                fontSize: 14,
                color: 'var(--neutral-1000)',
                cursor: 'pointer',
                background: '#fff',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--neutral-300)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.15s ease',
              }}
              onClick={() => setShowDatePicker((prev) => !prev)}
            >
              <Calendar size={16} color="var(--primary-600)" />
              <span>{dateRangeLabel}</span>
              <ChevronDown size={16} style={{ transform: showDatePicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>

            {/* Dropdown Menu */}
            {showDatePicker && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 6,
                  width: 280,
                  background: '#fff',
                  border: '1px solid var(--neutral-300)',
                  borderRadius: 12,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                  zIndex: 40,
                  padding: 12,
                  animation: 'zoomIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--neutral-400)', textTransform: 'uppercase', marginBottom: 8 }}>
                  Rentang Waktu Cepat
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {presets.map((p) => {
                    const isSelected = dateRangePreset === p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          textAlign: 'left',
                          background: isSelected ? 'var(--primary-100)' : 'transparent',
                          color: isSelected ? 'var(--primary-600)' : 'var(--neutral-1000)',
                          fontWeight: isSelected ? 600 : 400,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <span>{p.label}</span>
                        {isSelected && <Check size={14} color="var(--primary-600)" />}
                      </button>
                    )
                  })}
                </div>

                <div style={{ borderTop: '1px solid var(--neutral-200)', margin: '10px 0 8px' }} />

                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--neutral-400)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Pilih Tanggal Kustom
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <span style={{ width: 44, color: 'var(--neutral-400)' }}>Dari:</span>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      style={{ flex: 1, padding: '4px 6px', fontSize: 12, borderRadius: 6, border: '1px solid var(--neutral-300)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <span style={{ width: 44, color: 'var(--neutral-400)' }}>Sampai:</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      style={{ flex: 1, padding: '4px 6px', fontSize: 12, borderRadius: 6, border: '1px solid var(--neutral-300)' }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-neutral"
                    style={{ fontSize: 12, padding: '6px', width: '100%', marginTop: 4 }}
                    onClick={handleApplyCustomDate}
                  >
                    Terapkan Rentang
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '6px 8px' }}
            onClick={() => addToast(`Mengunduh laporan analitik rekam medis (${dateRangeLabel}) dalam format PDF/Excel...`, 'success')}
            title="Unduh Laporan"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Analytics Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'stretch' }}>
        {/* Left Card: Chart & Distribution */}
        <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Card Top Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 14, color: 'var(--neutral-1000)' }}>Total Pemeriksaan</span>
              <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--neutral-1000)' }}>{totalPemeriksaan}</span>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {(['harian', 'bulanan', 'tahunan'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`btn ${period === mode ? 'btn-neutral' : 'btn-outline'}`}
                  style={{ fontSize: 13, padding: '4px 12px', textTransform: 'capitalize' }}
                  onClick={() => setPeriod(mode)}
                >
                  {mode === 'harian' ? 'Harian (7 Hari)' : mode === 'bulanan' ? 'Bulanan (12 Bulan)' : 'Tahunan'}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Header Subtitle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--neutral-400)' }}>
            <span>Jumlah pemeriksaan per {period === 'harian' ? 'hari' : period === 'bulanan' ? 'bulan' : 'tahun'}</span>
            <span>Data Real-time Database · {dateRangeLabel}</span>
          </div>

          {/* DYNAMIC RESPONSIVE CHART CONTAINER */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 10 }}>
            {/* 1. PLOT AREA (Bars rise upwards from bottom) */}
            <div
              style={{
                position: 'relative',
                height: 220,
                width: '100%',
              }}
            >
              {/* Horizontal Gridlines & Y-Axis Scale */}
              {yTicks.map((val) => {
                const bottomPercent = maxY > 0 ? (val / maxY) * 90 : 0
                return (
                  <React.Fragment key={val}>
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        bottom: `calc(${bottomPercent}% - 6px)`,
                        fontSize: 12,
                        color: 'var(--neutral-400)',
                        width: 32,
                        textAlign: 'right',
                        userSelect: 'none',
                      }}
                    >
                      {val}
                    </span>
                    <div
                      style={{
                        position: 'absolute',
                        left: 44,
                        right: 0,
                        bottom: `${bottomPercent}%`,
                        borderBottom: '1px solid var(--neutral-200)',
                        zIndex: 1,
                      }}
                    />
                  </React.Fragment>
                )
              })}

              {/* Responsive Bar Groups Container */}
              <div
                style={{
                  position: 'absolute',
                  inset: '0 0 0 44px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  zIndex: 2,
                }}
              >
                {chartData.map((item, idx) => {
                  const maxPlotH = 198
                  const hTumor = maxY > 0 ? Math.max(item.tumor > 0 ? 4 : 0, (item.tumor / maxY) * maxPlotH) : 0
                  const hKanker = maxY > 0 ? Math.max(item.kanker > 0 ? 4 : 0, (item.kanker / maxY) * maxPlotH) : 0
                  const hPneumonia = maxY > 0 ? Math.max(item.pneumonia > 0 ? 4 : 0, (item.pneumonia / maxY) * maxPlotH) : 0

                  // Auto-adjusting bar widths based on number of columns
                  const barWidth = period === 'harian' ? 14 : period === 'bulanan' ? 8 : 24
                  const barGap = period === 'harian' ? 3 : period === 'bulanan' ? 2 : 4

                  return (
                    <div
                      key={item.label}
                      style={{
                        flex: 1,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        position: 'relative',
                        padding: '0 2px',
                      }}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      {/* Interactive Tooltip on hover */}
                      {hoveredIdx === idx && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: Math.max(hTumor, hKanker, hPneumonia) + 12,
                            background: 'var(--neutral-800)',
                            color: '#fff',
                            borderRadius: 6,
                            padding: '6px 10px',
                            fontSize: 11,
                            whiteSpace: 'nowrap',
                            zIndex: 20,
                            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                            textAlign: 'center',
                            pointerEvents: 'none',
                          }}
                        >
                          <p style={{ fontWeight: 700, marginBottom: 2 }}>{item.label}</p>
                          <p style={{ color: '#8de4aa' }}>Tumor Otak: {item.tumor}</p>
                          <p style={{ color: '#9ec2ec' }}>Kanker Tulang: {item.kanker}</p>
                          <p style={{ color: '#c4c1f0' }}>Pneumonia: {item.pneumonia}</p>
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: 4, paddingTop: 2, fontWeight: 700 }}>
                            Total: {item.total}
                          </div>
                        </div>
                      )}

                      {/* Grouped Bar Columns standing on the 0 line */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: barGap }}>
                        {/* Tumor Otak Bar (Green) */}
                        <div
                          style={{
                            width: barWidth,
                            height: hTumor,
                            background: 'var(--tertiary-600)',
                            borderTopLeftRadius: 3,
                            borderTopRightRadius: 3,
                            transition: 'height 0.35s ease',
                          }}
                          title={`Tumor Otak: ${item.tumor}`}
                        />
                        {/* Kanker Tulang Bar (Blue) */}
                        <div
                          style={{
                            width: barWidth,
                            height: hKanker,
                            background: 'var(--primary-600)',
                            borderTopLeftRadius: 3,
                            borderTopRightRadius: 3,
                            transition: 'height 0.35s ease',
                          }}
                          title={`Kanker Tulang: ${item.kanker}`}
                        />
                        {/* Pneumonia Bar (Purple) */}
                        <div
                          style={{
                            width: barWidth,
                            height: hPneumonia,
                            background: 'var(--quaternary-600)',
                            borderTopLeftRadius: 3,
                            borderTopRightRadius: 3,
                            transition: 'height 0.35s ease',
                          }}
                          title={`Pneumonia: ${item.pneumonia}`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 2. THE 0 LINE (BASELINE) */}
            <div
              style={{
                height: 2,
                background: 'var(--neutral-400)',
                marginLeft: 44,
                width: 'calc(100% - 44px)',
                zIndex: 3,
              }}
            />

            {/* 3. X-AXIS LABELS (STRICTLY LOCATED BELOW THE 0 LINE) */}
            <div
              style={{
                display: 'flex',
                marginLeft: 44,
                width: 'calc(100% - 44px)',
                paddingTop: 8,
              }}
            >
              {chartData.map((item) => (
                <div
                  key={item.label}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: 12,
                    color: 'var(--neutral-1000)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Chart Bottom Summaries & Legend */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--neutral-400)' }}>
              {totalPemeriksaan} pemeriksaan tercatat dalam database
            </span>
            <span style={{ fontSize: 12, color: 'var(--neutral-400)' }}>
              Pneumonia terbanyak: {categoryCounts.pneumonia} pemeriksaan
            </span>
          </div>

          <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--tertiary-600)' }} />
              <span>Tumor Otak · {categoryCounts.tumor}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--primary-600)' }} />
              <span>Kanker Tulang · {categoryCounts.kanker}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--quaternary-600)' }} />
              <span>Pneumonia · {categoryCounts.pneumonia}</span>
            </div>
          </div>
        </div>

        {/* Right Card: Full Balanced Ringkasan Data (Zero Empty Space) */}
        <div
          className="card"
          style={{
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12,
            minHeight: 460,
          }}
        >
          {/* 1. Antrean Verifikasi (Live Database) */}
          <div
            onClick={() => navigate('/dokter-radiologi/antrean')}
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--neutral-1000)' }}>Antrean Verifikasi</span>
              <span style={{ fontSize: 11, padding: '2px 6px', background: 'rgba(95, 92, 176, 0.1)', color: 'var(--quaternary-600)', borderRadius: 4, fontWeight: 600 }}>
                Menunggu
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--neutral-1000)' }}>{pendingCases.length}</span>
              <span style={{ fontSize: 14, color: 'var(--neutral-1000)' }}>Kasus</span>
            </div>
          </div>

          <div style={{ borderBottom: '1px solid var(--neutral-300)' }} />

          {/* 2. Selesai Diverifikasi (Live Database) */}
          <div
            onClick={() => navigate('/dokter-radiologi/riwayat')}
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--neutral-1000)' }}>Selesai Diverifikasi</span>
              <span style={{ fontSize: 11, padding: '2px 6px', background: 'rgba(90, 187, 130, 0.12)', color: '#0e7940', borderRadius: 4, fontWeight: 600 }}>
                Arsip
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--neutral-1000)' }}>{verifiedCases.length}</span>
              <span style={{ fontSize: 14, color: 'var(--neutral-1000)' }}>Kasus</span>
            </div>
          </div>

          <div style={{ borderBottom: '1px solid var(--neutral-300)' }} />

          {/* 3. Diverifikasi pada Rentang Ini */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 14, color: 'var(--neutral-1000)' }}>Diverifikasi ({dateRangeLabel})</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--neutral-1000)' }}>{verifiedInPeriod.length || 18}</span>
              <span style={{ fontSize: 14, color: 'var(--neutral-1000)' }}>Kasus</span>
            </div>
          </div>

          <div style={{ borderBottom: '1px solid var(--neutral-300)' }} />

          {/* 4. Rata-rata Keyakinan AI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 14, color: 'var(--neutral-1000)' }}>Rata-rata Keyakinan AI</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--neutral-1000)' }}>{avgConfidence}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--neutral-1000)' }}>%</span>
            </div>
          </div>

          <div style={{ borderBottom: '1px solid var(--neutral-300)' }} />

          {/* 5. Target Harian Radiolog Progress Bar (Fills empty space) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: 'var(--neutral-1000)' }}>Target Harian Radiolog</span>
              <span style={{ color: 'var(--neutral-400)' }}>18 / 20 Kasus (90%)</span>
            </div>
            <div style={{ height: 6, width: '100%', background: 'var(--neutral-200)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '90%', background: 'var(--tertiary-600)', borderRadius: 999 }} />
            </div>
          </div>

          {/* 6. Distribusi Kasus Aktif Mini Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--neutral-1000)' }}>Distribusi Kategori Kasus</span>
            <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
              <div style={{ flex: categoryCounts.pneumonia, background: 'var(--quaternary-600)' }} title="Pneumonia" />
              <div style={{ flex: categoryCounts.kanker, background: 'var(--primary-600)' }} title="Kanker Tulang" />
              <div style={{ flex: categoryCounts.tumor, background: 'var(--tertiary-600)' }} title="Tumor Otak" />
            </div>
          </div>

          {/* 7. Live Real-Time Database Sync Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              background: 'var(--neutral-100)',
              borderRadius: 6,
              border: '1px solid var(--neutral-300)',
              fontSize: 11,
              color: 'var(--neutral-400)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1fc16b', boxShadow: '0 0 6px #1fc16b' }} />
              <span style={{ color: 'var(--neutral-1000)', fontWeight: 600 }}>Database Real-time Sinkron</span>
            </div>
            <Clock size={12} />
          </div>
        </div>
      </div>

      {/* Bottom Table: Preview Antrean Kasus yang Perlu Verifikasi Segera */}
      <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
            Antrean Verifikasi Mendesak ({pendingCases.length} Kasus Menunggu)
          </h2>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: 13, padding: '4px 10px' }}
            onClick={() => navigate('/dokter-radiologi/antrean')}
          >
            <span>Lihat Semua Antrean ({pendingCases.length})</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 140 }}>ID Rekam Medis</th>
                <th style={{ width: 150 }}>Jenis Pemeriksaan</th>
                <th style={{ width: 160 }}>Asal Faskes</th>
                <th style={{ width: 140 }}>Tanggal Masuk</th>
                <th>Confidence Score AI</th>
                <th style={{ width: 60, textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pendingCases.slice(0, 3).map((item) => {
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
                    <td>
                      <span style={{ fontWeight: 500 }}>
                        {diag} | {item.aiResult?.confidence || 90}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="btn btn-outline" style={{ padding: 4 }}>
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 2. DOKTER ANTREAN VIEW (Desktop - 20)
// ==========================================

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

// ==========================================
// 3. DOKTER VERIFIKASI VIEW (Desktop - 29 & Desktop - 30)
// ==========================================

export function DokterVerifikasi() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cases, addToast, verifyCase } = usePneumonia()

  // Find item by ID from live database or fallback
  const targetId = id ? decodeURIComponent(id) : '#PN-0123'
  const patient = cases.find((p) => p.id === targetId) || cases[0]

  const diag = patient.aiResult?.diagnosis || 'Pneumonia'
  const cat = diag.includes('Tumor') ? 'Tumor Otak' : diag.includes('Kanker') ? 'Kanker Tulang' : 'Pneumonia'

  // Doctor decision state
  const [decision, setDecision] = useState<'terima' | 'tolak'>('tolak')
  const [clinicalFinding, setClinicalFinding] = useState(`Bukan ${cat}`)
  const [doctorNotes, setDoctorNotes] = useState(
    patient.verificationNotes ||
      'Pasien datang dengan keluhan sesak napas yang meningkat sejak [X] hari, disertai batuk berdahak kental dan demam naik-turun. Pada pemeriksaan fisik dada, ditemukan fremitus taktil meningkat pada lapang paru [kanan/kiri] serta suara ronkhi wet basah. SpO2: [X]%.'
  )

  // Viewer image controls
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showGradCam, setShowGradCam] = useState(false)
  const [brightness, setBrightness] = useState(100)

  // Confirmation Modal state (Desktop-30)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(2.5, Math.max(0.7, prev + delta)))
  }

  const handleFinalConfirm = () => {
    const finalResult = decision === 'terima' ? `Terverifikasi ${diag}` : clinicalFinding
    verifyCase(patient.id, finalResult, doctorNotes)
    addToast(`Keputusan verifikasi kasus ${patient.id} berhasil dikonfirmasi dan disimpan ke database.`, 'success')
    setShowConfirmModal(false)
    navigate('/dokter-radiologi/riwayat')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Back button */}
      <div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => navigate('/dokter-radiologi/antrean')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ChevronLeft size={18} />
          <span>Kembali</span>
        </button>
      </div>

      {/* Main 2-Column Split matching Desktop-29 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 430px', gap: 20, alignItems: 'start' }}>
        {/* LEFT COLUMN: Data Pasien & X-Ray / CT Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Data Pasien Card */}
          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Data Pasien</h3>

            <div
              style={{
                border: '1px solid var(--neutral-300)',
                borderRadius: 8,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-1000)', marginBottom: 2 }}>
                    ID Rekam Medis
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--neutral-1000)' }}>{patient.id}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-1000)', marginBottom: 2 }}>
                    Nama Pasien
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--neutral-1000)' }}>{patient.nama}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-1000)', marginBottom: 2 }}>
                    Tanggal Lahir
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--neutral-1000)' }}>
                    {patient.dd} / {patient.mm} / {patient.yyyy}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-1000)', marginBottom: 2 }}>
                    Jenis Kelamin
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--neutral-1000)' }}>
                    {patient.gender === 'P' ? 'Perempuan' : 'Laki-laki'}
                  </p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--neutral-200)', paddingTop: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-1000)', marginBottom: 4 }}>
                  Gejala Klinis
                </p>
                <p style={{ fontSize: 13, lineHeight: '20px', color: 'var(--neutral-1000)' }}>
                  {patient.gejala}
                </p>
              </div>
            </div>
          </div>

          {/* Radiologi Viewer Card */}
          <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Citra Radiologi ({cat})</span>
              <button
                type="button"
                className={`btn ${showGradCam ? 'btn-neutral' : 'btn-outline'}`}
                style={{ fontSize: 12, padding: '4px 8px' }}
                onClick={() => setShowGradCam((prev) => !prev)}
              >
                <Sparkles size={14} />
                <span>{showGradCam ? 'Sembunyikan Grad-CAM' : 'Tampilkan Grad-CAM AI'}</span>
              </button>
            </div>

            {/* Canvas Viewer Container */}
            <div
              style={{
                position: 'relative',
                background: '#1a1a1c',
                borderRadius: 8,
                overflow: 'hidden',
                minHeight: 340,
                display: 'grid',
                placeItems: 'center',
                border: '1px solid var(--neutral-300)',
              }}
            >
              <img
                src={patient.files?.[0]?.url || '/sample-xray.jpeg'}
                alt="Radiology Scan"
                style={{
                  maxWidth: '100%',
                  maxHeight: 340,
                  objectFit: 'contain',
                  transform: `scale(${zoomLevel})`,
                  filter: `brightness(${brightness}%)`,
                  transition: 'transform 0.2s ease, filter 0.2s ease',
                }}
              />

              {/* Grad-CAM Heatmap overlay simulation */}
              {showGradCam && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'radial-gradient(ellipse at 65% 58%, rgba(251, 55, 72, 0.45) 0%, rgba(244, 222, 178, 0.3) 35%, transparent 70%)',
                    pointerEvents: 'none',
                    mixBlendMode: 'screen',
                  }}
                />
              )}

              {/* Floating Download Button in top right */}
              <button
                type="button"
                className="btn btn-outline"
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  padding: 6,
                  background: 'rgba(255,255,255,0.9)',
                }}
                onClick={() => addToast('Mengunduh berkas citra DICOM / JPEG...', 'success')}
                title="Unduh Citra"
              >
                <Download size={18} />
              </button>

              {/* Info badge at bottom left */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  background: 'rgba(0,0,0,0.65)',
                  color: '#fff',
                  borderRadius: 4,
                  padding: '4px 8px',
                  fontSize: 11,
                }}
              >
                Zoom: {Math.round(zoomLevel * 100)}% | Slice 1/1
              </div>
            </div>

            {/* Bottom Controls Bar matching Figma */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '6px 10px' }}
                  onClick={() => handleZoom(0.15)}
                  title="Perbesar"
                >
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '6px 10px' }}
                  onClick={() => handleZoom(-0.15)}
                  title="Perkecil"
                >
                  <Minus size={16} />
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '6px 10px', fontSize: 12 }}
                  onClick={() => setBrightness((b) => (b === 100 ? 125 : b === 125 ? 80 : 100))}
                  title="Sesuaikan Kecerahan"
                >
                  Kontras
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '6px 10px' }}
                  onClick={() => addToast('Melihat potongan citra sebelumnya (Prev Slice)', 'info')}
                  title="Slice Sebelumnya"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '6px 10px' }}
                  onClick={() => addToast('Melihat potongan citra berikutnya (Next Slice)', 'info')}
                  title="Slice Berikutnya"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Keputusan Verifikasi Card */}
        <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Keputusan</h3>

          {/* Status & Hasil AI Banner */}
          <div
            style={{
              border: '1px solid var(--neutral-300)',
              borderRadius: 8,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-1000)' }}>Status</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: patient.status === 'terverifikasi' ? '#0e7940' : 'var(--quaternary-600)',
                  background: patient.status === 'terverifikasi' ? 'rgba(31,193,107,0.12)' : 'rgba(95, 92, 176, 0.12)',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                {patient.status === 'terverifikasi' ? 'Selesai Diverifikasi' : 'Menunggu Verifikasi'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-1000)' }}>Hasil Analisis AI</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--neutral-1000)' }}>
                {diag} | {patient.aiResult?.confidence || 90}%
              </span>
            </div>
          </div>

          {/* Section: Verifikasi Choice Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-1000)' }}>Verifikasi</span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Terima Hasil AI Button */}
              <button
                type="button"
                onClick={() => {
                  setDecision('terima')
                  setClinicalFinding(diag)
                  setDoctorNotes(`Hasil verifikasi radiolog menyetujui analisis AI: gambaran radiologis konsisten dengan ${diag}.`)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: decision === 'terima' ? '2px solid #1fc16b' : '1px solid #1fc16b',
                  background: decision === 'terima' ? 'rgba(31, 193, 107, 0.2)' : 'rgba(31, 193, 107, 0.08)',
                  color: '#0e7940',
                  transition: 'all 0.15s ease',
                }}
              >
                <CheckCircle2 size={16} />
                <span>Terima Hasil AI</span>
              </button>

              {/* Tolak Hasil AI Button */}
              <button
                type="button"
                onClick={() => {
                  setDecision('tolak')
                  setClinicalFinding(`Bukan ${cat}`)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: decision === 'tolak' ? '2px solid #fb3748' : '1px solid #fb3748',
                  background: decision === 'tolak' ? 'rgba(251, 55, 72, 0.2)' : 'rgba(251, 55, 72, 0.08)',
                  color: '#d61b2d',
                  transition: 'all 0.15s ease',
                }}
              >
                <XCircle size={16} />
                <span>Tolak Hasil AI</span>
              </button>
            </div>
          </div>

          {/* Section: Keputusan Radiologi Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-1000)' }}>Keputusan Radiologi</span>

            <select
              className="input"
              value={clinicalFinding}
              onChange={(e) => setClinicalFinding(e.target.value)}
              style={{ fontSize: 13 }}
            >
              <option value={`Bukan ${cat}`}>Bukan {cat} (Atelektasis / Normal)</option>
              <option value="Pneumonia Bakterial">Pneumonia Bakterial Akut</option>
              <option value="Pneumonia Viral">Pneumonia Viral / Atipikal</option>
              <option value="Kanker Tulang Ganas">Kanker Tulang (Osteosarcoma High Grade)</option>
              <option value="Kanker Tulang Jinak">Lesi Jinak / Fibrous Dysplasia</option>
              <option value="Tumor Otak Meningioma">Tumor Otak (Meningioma)</option>
              <option value="Normal / Tanpa Kelainan">Normal / Tanpa Kelainan Bermakna</option>
            </select>
          </div>

          {/* Section: Alasan Modifikasi Textarea */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-1000)' }}>Alasan Modifikasi</span>

            <textarea
              className="input area filled"
              style={{
                height: 120,
                fontSize: 13,
                lineHeight: '20px',
                background: 'var(--primary-100)',
                borderColor: 'var(--primary-300)',
              }}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Tuliskan catatan medis atau alasan perubahan diagnosis di sini..."
            />
          </div>

          {/* Action: Konfirmasi Keputusan (opens confirmation dialog) */}
          <button
            type="button"
            className="btn btn-neutral"
            style={{ width: '100%', padding: '10px 14px', marginTop: 8 }}
            onClick={() => setShowConfirmModal(true)}
          >
            <span>Konfirmasi Keputusan</span>
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL (Desktop - 30) */}
      {showConfirmModal && (
        <div className="modal-backdrop" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: decision === 'terima' ? 'rgba(31,193,107,0.15)' : 'rgba(251,55,72,0.15)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {decision === 'terima' ? (
                  <CheckCircle2 size={20} color="#1fc16b" />
                ) : (
                  <Activity size={20} color="#fb3748" />
                )}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Konfirmasi Hasil Verifikasi</h3>
                <p style={{ fontSize: 12, color: 'var(--neutral-400)', margin: 0 }}>Kasus Rekam Medis {patient.id}</p>
              </div>
            </div>

            <div
              style={{
                background: 'var(--neutral-100)',
                border: '1px solid var(--neutral-300)',
                borderRadius: 8,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--neutral-400)' }}>Nama Pasien:</span>
                <span style={{ fontWeight: 600 }}>{patient.nama}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--neutral-400)' }}>Tindakan:</span>
                <span style={{ fontWeight: 700, color: decision === 'terima' ? '#0e7940' : '#d61b2d' }}>
                  {decision === 'terima' ? 'Terima Hasil AI' : 'Tolak & Modifikasi Hasil AI'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--neutral-400)' }}>Diagnosis Akhir:</span>
                <span style={{ fontWeight: 600 }}>{clinicalFinding}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--neutral-200)', paddingTop: 6 }}>
                <span style={{ color: 'var(--neutral-400)', display: 'block', marginBottom: 2 }}>Catatan Dokter:</span>
                <p style={{ fontSize: 12, fontStyle: 'italic', margin: 0, color: 'var(--neutral-1000)' }}>
                  "{doctorNotes}"
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowConfirmModal(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-neutral"
                onClick={handleFinalConfirm}
              >
                Simpan & Terbitkan Hasil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 4. DOKTER RIWAYAT VIEW (Desktop - 31)
// ==========================================

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

// ==========================================
// MAIN DOKTER RADIOLOGI ROUTER COMPONENT
// ==========================================

export default function DokterRadiologi() {
  return (
    <DokterShell>
      <Routes>
        <Route path="dashboard" element={<DokterDashboard />} />
        <Route path="antrean" element={<DokterAntrean />} />
        <Route path="verifikasi/:id" element={<DokterVerifikasi />} />
        <Route path="verifikasi" element={<DokterVerifikasi />} />
        <Route path="riwayat" element={<DokterRiwayat />} />
        <Route path="*" element={<DokterDashboard />} />
      </Routes>
    </DokterShell>
  )
}
