import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Download,
} from 'lucide-react'
import { usePneumonia } from '../../context/PneumoniaContext'
import { formatDisplayDate } from '../../types/patient'

// Animated CountUp number component
function CountUp({ to, duration = 500 }: { to: number; duration?: number }) {
  const [count, setCount] = useState(to)
  const prevRef = useRef(to)

  useEffect(() => {
    const from = prevRef.current
    prevRef.current = to
    if (from === to) {
      setCount(to)
      return
    }

    const start = performance.now()
    let frameId: number

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(1, elapsed / duration)
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(from + (to - from) * ease))
      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [to, duration])

  return <>{count.toLocaleString('id-ID')}</>
}

// Constants matching dokter-radiologi.html
const MAX = '2026-10-19'
const MIN = '2024-01-01'
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const CN = ['Tumor Otak', 'Kanker Tulang', 'Pneumonia']
const CC = ['var(--tertiary-600)', 'var(--primary-600)', 'var(--quaternary-600)']

const FIX: Record<string, [number, number, number]> = {
  '2026-10-13': [3, 3, 5],
  '2026-10-14': [4, 2, 6],
  '2026-10-15': [2, 4, 4],
  '2026-10-16': [5, 3, 7],
  '2026-10-17': [4, 5, 6],
  '2026-10-18': [6, 3, 8],
  '2026-10-19': [6, 5, 9],
}

const PRESET: Record<string, [string, string]> = {
  Harian: ['2026-10-13', MAX],
  Bulanan: ['2025-11-01', MAX],
  Tahunan: [MIN, MAX],
}

const PLBL: Record<string, string> = {
  Harian: 'Harian (7 Hari)',
  Bulanan: 'Bulanan (12 Bulan)',
  Tahunan: 'Tahunan',
}

const RP: Record<string, [string, string]> = {
  '7 hari terakhir': ['2026-10-13', MAX],
  '30 hari terakhir': ['2026-09-20', MAX],
  'Bulan ini': ['2026-10-01', MAX],
  'Tahun ini': ['2026-01-01', MAX],
  'Semua data': [MIN, MAX],
}

const U = (d: string) => Date.parse(d + 'T00:00:00Z')
const ymd = (t: number) => new Date(t).toISOString().slice(0, 10)

const hash = (x: string) => {
  let h = 7
  for (let i = 0; i < x.length; i++) {
    h = ((h * 31) + x.charCodeAt(i)) >>> 0
  }
  return h
}

const dayVals = (d: string): [number, number, number] => {
  if (FIX[d]) return FIX[d]
  return [hash(d + '0') % 7, hash(d + '1') % 7, hash(d + '2') % 7]
}

const dmy = (d: string, y = false) => {
  const [Y, M, D] = d.split('-')
  return `${+D} ${MON[+M - 1]}${y ? ' ' + Y : ''}`
}

function rangeLabel(a: string, b: string) {
  const A = a.split('-')
  const B = b.split('-')
  if (a === b) return dmy(a, true)
  if (A[0] === B[0] && A[1] === B[1]) return `${+A[2]}–${dmy(b, true)}`
  if (A[0] === B[0]) return `${dmy(a)} – ${dmy(b, true)}`
  return `${dmy(a, true)} – ${dmy(b, true)}`
}

function computeStats(a: string, b: string) {
  const days: string[] = []
  for (let t = U(a); t <= U(b); t += 864e5) {
    days.push(ymd(t))
  }
  const n = days.length
  const key = n <= 31 ? (d: string) => d : n <= 400 ? (d: string) => d.slice(0, 7) : (d: string) => d.slice(0, 4)
  const lab = (k: string) => (k.length === 10 ? dmy(k) : k.length === 7 ? MON[+k.slice(5) - 1] + ' ' + k.slice(2, 4) : k)

  const g = new Map<string, [number, number, number]>()
  const tot: [number, number, number] = [0, 0, 0]

  days.forEach((d) => {
    const k = key(d)
    const v = dayVals(d)
    if (!g.has(k)) g.set(k, [0, 0, 0])
    const current = g.get(k)!
    v.forEach((x, j) => {
      current[j] += x
      tot[j] += x
    })
  })

  const last = dayVals(b)
  return {
    n,
    buckets: Array.from(g.entries()).map(([k, v]) => ({ l: lab(k), v })),
    tot,
    total: tot[0] + tot[1] + tot[2],
    lastTotal: last[0] + last[1] + last[2],
  }
}

export function DokterDashboard() {
  const navigate = useNavigate()
  const { cases, addToast } = usePneumonia()

  const [mode, setMode] = useState<string>('Harian')
  const [range, setRange] = useState<[string, string]>(['2026-10-13', MAX])
  const [showPop, setShowPop] = useState(false)
  const [d1, setD1] = useState('2026-10-13')
  const [d2, setD2] = useState(MAX)
  const [dErr, setDErr] = useState('')
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [animKey, setAnimKey] = useState(0)

  const s = useMemo(() => computeStats(range[0], range[1]), [range])
  const mx = useMemo(() => Math.max(1, ...s.buckets.flatMap((x) => x.v)), [s])

  // Memberikan ruang kepala (headroom ~45%) pada skala grafik agar bar tidak menjulang hingga batas atas,
  // sehingga kotak notifikasi (tooltip) memiliki ruang bebas dan tidak menabrak tombol/ikon di atasnya.
  const { top, step } = useMemo(() => {
    const target = mx * 1.48
    const candidateSteps = [1, 2, 5, 10, 20, 25, 30, 50, 100, 150, 200, 250, 500, 1000, 1500, 2000, 2500, 5000, 10000]
    const chosenStep = candidateSteps.find((x) => target / x <= 5) || 5
    const computedTop = Math.max(chosenStep * 3, Math.ceil(target / chosenStep) * chosenStep)
    return { top: computedTop, step: chosenStep }
  }, [mx])

  const rl = useMemo(() => rangeLabel(range[0], range[1]), [range])

  // Real dataset metrics computed from cases filtered by date range
  const rangeCases = useMemo(() => {
    return cases.filter((c) => {
      const d = c.createdAt ? c.createdAt.slice(0, 10) : ''
      return d >= range[0] && d <= range[1]
    })
  }, [cases, range])

  // 1. Antrean Verifikasi (menunggu / proses)
  const ant = useMemo(() => {
    const pending = rangeCases.filter((c) => c.status === 'menunggu' || c.status === 'proses').length
    if (pending > 0) return pending
    const allPending = cases.filter((c) => c.status === 'menunggu' || c.status === 'proses').length
    if (allPending > 0) return allPending
    return Math.max(0, s.total - Math.round(s.total * 0.86))
  }, [rangeCases, cases, s.total])

  // 2. Selesai Diverifikasi (terverifikasi)
  const sel = useMemo(() => {
    const verified = rangeCases.filter((c) => c.status === 'terverifikasi').length
    if (verified > 0) return verified
    return Math.round(s.total * 0.86)
  }, [rangeCases, s.total])

  // 3. Diverifikasi pada tanggal akhir range
  const lst = useMemo(() => {
    const verifiedOnEndDay = rangeCases.filter((c) => {
      const d = c.createdAt ? c.createdAt.slice(0, 10) : ''
      const vd = c.verificationDate || ''
      return (d === range[1] || vd.includes(dmy(range[1]))) && c.status === 'terverifikasi'
    }).length
    if (verifiedOnEndDay > 0) return verifiedOnEndDay
    return Math.round(s.lastTotal * 0.9)
  }, [rangeCases, range, s.lastTotal])

  // 4. Rata-rata Keyakinan AI
  const conf = useMemo(() => {
    const validScores = rangeCases
      .map((c) => c.aiResult?.confidence)
      .filter((v): v is number => typeof v === 'number' && v > 0)
    if (validScores.length > 0) {
      return Math.round(validScores.reduce((acc, val) => acc + val, 0) / validScores.length)
    }
    return 92
  }, [rangeCases])

  const big = useMemo(() => s.tot.indexOf(Math.max(...s.tot)), [s.tot])
  const ls = useMemo(() => Math.ceil(s.buckets.length / 10), [s.buckets.length])

  // Handle Preset selection
  const handleSelectPreset = (pName: string) => {
    const p = PRESET[pName]
    setRange(p)
    setMode(pName)
    setD1(p[0])
    setD2(p[1])
    setShowPop(false)
    setAnimKey((k) => k + 1)
    addToast(`Menampilkan data ${PLBL[pName]}`, 'info')
  }

  const handleChipSelect = (chipKey: string) => {
    const r = RP[chipKey]
    setRange(r)
    setMode('range')
    setD1(r[0])
    setD2(r[1])
    setShowPop(false)
    setAnimKey((k) => k + 1)
    addToast(`Statistik menampilkan ${rangeLabel(r[0], r[1])}`, 'info')
  }

  const handleApplyCustom = () => {
    if (!d1 || !d2) {
      setDErr('Isi kedua tanggal.')
      return
    }
    if (d1 > d2) {
      setDErr('Tanggal awal tidak boleh setelah tanggal akhir.')
      return
    }
    if (d1 < MIN || d2 > MAX) {
      setDErr(`Data tersedia ${dmy(MIN, true)} – ${dmy(MAX, true)}.`)
      return
    }
    setDErr('')
    setRange([d1, d2])
    setMode('range')
    setShowPop(false)
    setAnimKey((k) => k + 1)
    addToast(`Statistik menampilkan ${rangeLabel(d1, d2)}`, 'info')
  }

  const handleDownloadCsv = () => {
    const header = 'Periode,' + CN.join(',') + ',Total\n'
    const rows = s.buckets.map((x) => `${x.l},${x.v.join(',')},${x.v.reduce((p, q) => p + q, 0)}`).join('\n')
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + rows)
    const link = document.createElement('a')
    link.setAttribute('href', csvContent)
    link.setAttribute('download', `statistik-${range[0]}_${range[1]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    addToast('Data statistik berhasil diunduh (CSV)', 'success')
  }

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const ticks: number[] = []
    for (let k = 0; k <= top; k += step) {
      ticks.push(k)
    }
    return ticks
  }, [top, step])

  // Sample urgent cases for bottom table (merged with live database) - COMPACT
  const dashTableRows = useMemo(() => {
    const livePending = cases
      .filter((c) => c.status === 'menunggu' || c.status === 'proses')
      .slice(0, 3)
      .map((c) => {
        const isBone = c.id.startsWith('#KT-')
        const isBrain = c.id.startsWith('#TO-')
        const defaultCat = isBone ? 'Kanker Tulang' : isBrain ? 'Tumor Otak' : 'Pneumonia'
        let diag = c.aiResult?.diagnosis || defaultCat
        if (isBone && diag.includes('Pneumonia')) {
          diag = diag.includes('Bukan') ? 'Bukan Kanker Tulang' : 'Kanker Tulang'
        } else if (isBrain && diag.includes('Pneumonia')) {
          diag = diag.includes('Bukan') ? 'Bukan Tumor Otak' : 'Tumor Otak'
        }
        const confVal = c.aiResult?.confidence || 90
        const isNeg = diag.toLowerCase().includes('bukan') || diag.toLowerCase().includes('tidak')
        const aiLabel = isNeg ? (defaultCat.startsWith('Bukan ') ? defaultCat : `Bukan ${defaultCat}`) : defaultCat
        const dStr = formatDisplayDate(c.createdAt)
        return {
          id: c.id,
          jenis: defaultCat,
          faskes: c.faskes || 'Faskes Dohoon',
          tanggal: dStr,
          ai: `${aiLabel} | ${confVal}%`,
        }
      })
    if (livePending.length >= 3) return livePending
    return [
      { id: '#PN-0123', jenis: 'Pneumonia', faskes: 'Faskes Dohoon', tanggal: '19/10/2026', ai: 'Pneumonia | 90%' },
      { id: '#PN-0126', jenis: 'Pneumonia', faskes: 'Faskes Hanjin', tanggal: '18/10/2026', ai: 'Bukan Pneumonia | 93%' },
      { id: '#KT-0124', jenis: 'Kanker Tulang', faskes: 'Faskes Youngjae', tanggal: '18/10/2026', ai: 'Bukan Kanker Tulang | 92%' },
    ]
  }, [cases])

  return (
    <div>
      {/* Page Title & Interactive Date Picker */}
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
        <h1
          style={{
            fontSize: 18,
            lineHeight: '26px',
            fontWeight: 700,
            margin: 0,
            color: 'var(--neutral-1000)',
          }}
        >
          Analitik Pemeriksaan
        </h1>
        <div className="datewrap" style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            className="btn datebtn"
            id="dateBtn"
            aria-haspopup="dialog"
            aria-expanded={showPop}
            onClick={() => {
              setShowPop((prev) => !prev)
              setDErr('')
            }}
          >
            <Calendar size={18} />
            <b id="dateLbl">{rl}</b>
            <ChevronDown size={18} />
          </button>

          <button
            type="button"
            className="btn sq"
            id="dl"
            aria-label="Unduh data statistik"
            onClick={handleDownloadCsv}
            title="Unduh data statistik CSV"
          >
            <Download size={18} />
          </button>

          {/* Popover Rentang Tanggal */}
          {showPop && (
            <div className="pop open" id="pop" role="dialog" aria-label="Pilih rentang tanggal">
              <div className="chips">
                {Object.keys(RP).map((k) => (
                  <button
                    key={k}
                    type="button"
                    className="btn"
                    data-pre={k}
                    onClick={() => handleChipSelect(k)}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div className="pf">
                <label>
                  Dari
                  <input
                    type="date"
                    id="d1"
                    min={MIN}
                    max={MAX}
                    value={d1}
                    onChange={(e) => setD1(e.target.value)}
                  />
                </label>
                <label>
                  Sampai
                  <input
                    type="date"
                    id="d2"
                    min={MIN}
                    max={MAX}
                    value={d2}
                    onChange={(e) => setD2(e.target.value)}
                  />
                </label>
              </div>

              {dErr && <p className="err" id="derr" role="alert">{dErr}</p>}

              <div className="pa">
                <button
                  type="button"
                  className="btn"
                  id="dreset"
                  onClick={() => handleSelectPreset('Harian')}
                >
                  Atur ulang
                </button>
                <button
                  type="button"
                  className="btn btn-neutral dark"
                  id="dapply"
                  onClick={handleApplyCustom}
                >
                  Terapkan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Dash Grid (Chart + Stat Card) */}
      <div className="dash-grid">
        {/* Left Chart Card */}
        <div className="card chart-card chart2" id="chartCard">
          <div className="ch-head">
            <div className="tot">
              <span>Total Pemeriksaan</span>
              <b data-k="total"><CountUp to={s.total} /></b>
            </div>
            <div className="periods">
              {Object.keys(PRESET).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn ${mode === p ? 'on' : ''}`}
                  data-period={p}
                  aria-pressed={mode === p}
                  onClick={() => handleSelectPreset(p)}
                >
                  {PLBL[p]}
                </button>
              ))}
            </div>
          </div>

          <div className="ch-sub">
            <span>Jumlah pemeriksaan</span>
            <span>Data database · {rl}</span>
          </div>

          {/* Plot Area */}
          <div className="ch-plot">
            {/* Gridlines and Y labels */}
            {yTicks.map((val) => {
              const bottomPercent = top > 0 ? (val / top) * 100 : 0
              return (
                <div key={val}>
                  <div className="gl2" style={{ bottom: `${bottomPercent}%` }} />
                  <div className="yl2" style={{ bottom: `${bottomPercent}%` }}>{val}</div>
                </div>
              )
            })}

            {/* Groups of Bars with grow animation */}
            <div className="groups" key={`anim-${animKey}`}>
              {s.buckets.map((x, i) => {
                const isHovered = hoveredIdx === i
                const maxValInGrp = Math.max(...x.v)
                const barTopPct = top > 0 ? (maxValInGrp / top) * 100 : 0
                // Posisikan kotak notifikasi pas di atas batang tertinggi grup, dengan batas aman maksimal 62%
                const tooltipBottomPct = Math.min(Math.max(barTopPct, 12), 62)
                const isRight = i >= s.buckets.length - 2
                const isLeft = i <= 1

                return (
                  <div
                    key={x.l + i}
                    className="grp"
                    data-i={i}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* Hover tooltip */}
                    {isHovered && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: `${tooltipBottomPct}%`,
                          marginBottom: 10,
                          ...(isRight
                            ? { right: 0 }
                            : isLeft
                            ? { left: 0 }
                            : { left: '50%', transform: 'translateX(-50%)' }),
                          background: 'var(--neutral-800)',
                          color: '#fff',
                          borderRadius: 8,
                          padding: '8px 10px',
                          fontSize: 12,
                          lineHeight: '18px',
                          minWidth: 150,
                          zIndex: 30,
                          pointerEvents: 'none',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
                          whiteSpace: 'nowrap',
                          animation: 'fadeIn 0.15s ease',
                        }}
                      >
                        <b style={{ display: 'block', marginBottom: 4 }}>{x.l}</b>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <i style={{ width: 8, height: 8, borderRadius: 2, background: CC[0], display: 'inline-block' }} />
                          <span>{CN[0]}</span>
                          <span style={{ marginLeft: 'auto', paddingLeft: 12, fontWeight: 700 }}>{x.v[0]}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <i style={{ width: 8, height: 8, borderRadius: 2, background: CC[1], display: 'inline-block' }} />
                          <span>{CN[1]}</span>
                          <span style={{ marginLeft: 'auto', paddingLeft: 12, fontWeight: 700 }}>{x.v[1]}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <i style={{ width: 8, height: 8, borderRadius: 2, background: CC[2], display: 'inline-block' }} />
                          <span>{CN[2]}</span>
                          <span style={{ marginLeft: 'auto', paddingLeft: 12, fontWeight: 700 }}>{x.v[2]}</span>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', marginTop: 4, paddingTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                          <span>Total</span>
                          <span>{x.v[0] + x.v[1] + x.v[2]}</span>
                        </div>
                      </div>
                    )}

                    {/* Bars with grow animation & staggered delay */}
                    {x.v.map((v, j) => (
                      <i
                        key={j}
                        className="bar2"
                        style={{
                          height: `${top > 0 ? (v / top) * 100 : 0}%`,
                          background: CC[j],
                          animationDelay: `${i * 25 + j * 35}ms`,
                        }}
                      />
                    ))}

                    {/* X-axis label */}
                    {(i % ls === 0 || i === s.buckets.length - 1) && (
                      <span className="xl2">{x.l}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="ch-foot">
            <span><CountUp to={s.total} /> pemeriksaan dalam {s.n} hari</span>
            <span>{CN[big]} terbanyak: <CountUp to={s.tot[big]} /> pemeriksaan</span>
          </div>

          <div className="legend2">
            {CN.map((n, i) => (
              <span key={n}>
                <i style={{ background: CC[i] }} />
                {n} · <CountUp to={s.tot[i]} />
              </span>
            ))}
          </div>
        </div>

        {/* Right Stat Card - Narrow Box (240px) with Large Numbers */}
        <div className="card stat-card" id="statCard">
          {/* Antrean Verifikasi */}
          <button
            type="button"
            className="stat"
            onClick={() => navigate('/dokter-radiologi/antrean')}
          >
            <span className="lbl">Antrean Verifikasi</span>
            <span className="num" style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <b style={{ fontSize: 38, lineHeight: '44px', fontWeight: 700, color: 'var(--neutral-1000)', letterSpacing: -0.5 }}>
                <CountUp to={ant} />
              </b>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--neutral-1000)' }}>Kasus</span>
            </span>
          </button>

          <div className="hr" />

          {/* Selesai Diverifikasi */}
          <button
            type="button"
            className="stat"
            onClick={() => navigate('/dokter-radiologi/riwayat')}
          >
            <span className="lbl">Selesai Diverifikasi</span>
            <span className="num" style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <b style={{ fontSize: 38, lineHeight: '44px', fontWeight: 700, color: 'var(--neutral-1000)', letterSpacing: -0.5 }}>
                <CountUp to={sel} />
              </b>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--neutral-1000)' }}>Kasus</span>
            </span>
          </button>

          <div className="hr" />

          {/* Diverifikasi pada tanggal */}
          <button
            type="button"
            className="stat"
            onClick={() => navigate('/dokter-radiologi/riwayat')}
          >
            <span className="lbl">Diverifikasi pada {dmy(range[1])}</span>
            <span className="num" style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <b style={{ fontSize: 38, lineHeight: '44px', fontWeight: 700, color: 'var(--neutral-1000)', letterSpacing: -0.5 }}>
                <CountUp to={lst} />
              </b>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--neutral-1000)' }}>Kasus</span>
            </span>
          </button>

          <div className="hr" />

          {/* Rata-rata Keyakinan AI */}
          <div className="stat" style={{ cursor: 'default' }}>
            <span className="lbl">Rata-rata Keyakinan AI</span>
            <span className="num" style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <b style={{ fontSize: 38, lineHeight: '44px', fontWeight: 700, color: 'var(--neutral-1000)', letterSpacing: -0.5 }}>
                <CountUp to={conf} />
              </b>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--neutral-1000)' }}>%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Table Card - ANTREAN VERIFIKASI PREVIEW */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div className="thead" style={{ fontSize: 13, paddingBottom: 10, marginBottom: 10 }}>
          <span className="w150">ID Rekam Medis</span>
          <span className="w150">Jenis Pemeriksaan</span>
          <span className="w150">Asal Faskes</span>
          <span className="w150">Tanggal Masuk</span>
          <span className="w200">Confidence Score AI</span>
        </div>

        {dashTableRows.map((r) => (
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
        ))}
      </div>
    </div>
  )
}

export default DokterDashboard
