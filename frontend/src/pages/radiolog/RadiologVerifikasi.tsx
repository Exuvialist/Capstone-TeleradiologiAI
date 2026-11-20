import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft,
  Plus,
  Minus,
  Download,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { usePneumonia } from '../../context/PneumoniaContext'

const DEFAULT_SYMPTOM =
  'Pasien datang dengan keluhan sesak napas yang meningkat sejak [X] hari, disertai batuk berdahak kental dan demam naik-turun. Pada pemeriksaan fisik dada, ditemukan fremitus taktil meningkat pada lapang paru [kanan/kiri] serta suara ronkhi wet basah. SpO2: [X]%.'

export function DokterVerifikasi() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { cases, verifyCase, addToast } = usePneumonia()

  // Find case by id
  const cleanId = (id || '').replace(/^#/, '').toLowerCase()
  const targetId = id ? (id.startsWith('#') ? id : `#${id}`) : '#PN-0123'
  const record = useMemo(() => {
    const found = cases.find((c) => c.id.replace(/^#/, '').toLowerCase() === cleanId)
    if (found) {
      // Ensure prefix-to-disease integrity
      const isBone = found.id.startsWith('#KT-')
      const isBrain = found.id.startsWith('#TO-')
      let diag = found.aiResult?.diagnosis || (isBone ? 'Kanker Tulang' : isBrain ? 'Tumor Otak' : 'Pneumonia')
      let finding = found.aiResult?.finding || ''

      if (isBone && diag.includes('Pneumonia')) {
        diag = diag.includes('Bukan') ? 'Bukan Kanker Tulang' : 'Kanker Tulang'
        finding = 'Lesi osteolitik metafisis distal femur disertai reaksi periosteal (Kanker Tulang).'
      } else if (isBrain && diag.includes('Pneumonia')) {
        diag = diag.includes('Bukan') ? 'Bukan Tumor Otak' : 'Tumor Otak'
        finding = 'Massa ekstra-aksial lobus frontoparietal berbatas tegas dengan perifocal edema.'
      }

      return {
        ...found,
        aiResult: {
          diagnosis: diag,
          confidence: found.aiResult?.confidence || 90,
          finding: finding || found.aiResult?.finding || 'Evaluasi radiologis komprehensif.',
        },
      }
    }

    // Fallback if not directly found in cases
    const isBone = targetId.startsWith('#KT-')
    const isBrain = targetId.startsWith('#TO-')
    if (isBone) {
      return {
        id: targetId,
        nama: targetId.includes('0120') || targetId.includes('0124') ? 'Nabila Putri' : 'Pasien Kanker Tulang',
        dd: '01',
        mm: 'Mei',
        yyyy: '2000',
        gender: 'P' as const,
        gejala: 'Nyeri tulang tumpul memberat malam hari.',
        files: [{ name: 'scan-kt.jpeg', size: '134.KB', url: '/sample-xray.jpeg' }],
        aiResult: {
          diagnosis: 'Kanker Tulang',
          confidence: 90,
          finding: 'Lesi osteolitik metafisis distal femur disertai reaksi periosteal (Kanker Tulang).',
        },
        status: 'menunggu' as const,
        createdAt: '2026-10-19',
        faskes: 'Faskes Shinyu',
      }
    }
    if (isBrain) {
      return {
        id: targetId,
        nama: 'Raka Pratama',
        dd: '17',
        mm: 'Okt',
        yyyy: '1997',
        gender: 'L' as const,
        gejala: 'Nyeri kepala hebat kronis memberat di pagi hari, disertai muntah proyektil, defisit neurologis fokal.',
        files: [{ name: 'scan-to.jpeg', size: '134.KB', url: '/sample-xray.jpeg' }],
        aiResult: {
          diagnosis: 'Tumor Otak',
          confidence: 94,
          finding: 'Massa ekstra-aksial lobus frontoparietal berbatas tegas dengan perifocal edema.',
        },
        status: 'menunggu' as const,
        createdAt: '2026-10-18',
        faskes: 'Faskes Youngjae',
      }
    }
    return {
      id: targetId,
      nama: 'Gracella Uhuy',
      dd: '01',
      mm: 'Mei',
      yyyy: '2000',
      gender: 'P' as const,
      gejala: DEFAULT_SYMPTOM,
      files: [{ name: 'scan-pn.jpeg', size: '134.KB', url: '/sample-xray.jpeg' }],
      aiResult: {
        diagnosis: targetId === '#PN-0126' || targetId === '#PN-0129' ? 'Bukan Pneumonia' : 'Pneumonia',
        confidence: 90,
        finding: 'Infiltrasi bercak opasitas konsisten dengan pneumonia lobaris.',
      },
      status: 'menunggu' as const,
      createdAt: '2026-10-19',
      faskes: 'Faskes Shinyu',
    }
  }, [cases, cleanId, targetId])

  const isBone = record.id.startsWith('#KT-')
  const isBrain = record.id.startsWith('#TO-')
  const defaultDiag = isBone ? 'Kanker Tulang' : isBrain ? 'Tumor Otak' : 'Pneumonia'
  let jenis = record.aiResult?.diagnosis || defaultDiag
  if (isBone && jenis.includes('Pneumonia')) {
    jenis = jenis.includes('Bukan') ? 'Bukan Kanker Tulang' : 'Kanker Tulang'
  } else if (isBrain && jenis.includes('Pneumonia')) {
    jenis = jenis.includes('Bukan') ? 'Bukan Tumor Otak' : 'Tumor Otak'
  }
  const conf = record.aiResult?.confidence || 90

  // Decision State
  const [choice, setChoice] = useState<'terima' | 'tolak' | null>(null)
  const [keputusanRad, setKeputusanRad] = useState('')
  const [alasanMod, setAlasanMod] = useState('')
  const [zoomLevel, setZoomLevel] = useState(100)
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  // Handle choice toggle
  const handleSelectChoice = (c: 'terima' | 'tolak') => {
    setChoice(c)
    if (c === 'terima') {
      setKeputusanRad(jenis)
      setAlasanMod('')
    } else {
      const opp = jenis.startsWith('Bukan ') ? jenis.replace('Bukan ', '') : `Bukan ${jenis}`
      setKeputusanRad(opp)
      setAlasanMod(record.gejala || DEFAULT_SYMPTOM)
    }
  }

  // Handle confirm decision
  const handleConfirm = () => {
    if (!keputusanRad.trim()) {
      addToast('Lengkapi keputusan radiologi terlebih dahulu', 'warning')
      return
    }
    if (choice === 'tolak' && !alasanMod.trim()) {
      addToast('Lengkapi alasan modifikasi terlebih dahulu', 'warning')
      return
    }

    const finalResult = choice === 'terima' ? 'Terdeteksi' : 'Tidak terdeteksi'
    verifyCase(record.id, finalResult, alasanMod || `Hasil AI diterima: ${keputusanRad}`)
    addToast('Keputusan berhasil dikonfirmasi', 'success')
    navigate('/dokter-radiologi/antrean')
  }

  return (
    <div>
      {/* Back Button matching html */}
      <button
        type="button"
        className="btn"
        style={{ marginBottom: 18 }}
        onClick={() => navigate('/dokter-radiologi/antrean')}
      >
        <ChevronLeft size={18} />
        <span>Kembali</span>
      </button>

      {/* Main Detail Grid matching html */}
      <div className="card detail">
        {/* Left Column: Data Pasien & Viewer */}
        <div className="left">
          <div>
            <div className="b" style={{ fontSize: 16 }}>Data Pasien</div>
            <div className="sub">
              <div className="grid2" style={{ marginBottom: 12 }}>
                <div>
                  <div className="t12" style={{ fontWeight: 700, color: 'var(--neutral-400)', marginBottom: 2 }}>ID Rekam Medis</div>
                  <div style={{ fontWeight: 600 }}>{record.id}</div>
                </div>
                <div>
                  <div className="t12" style={{ fontWeight: 700, color: 'var(--neutral-400)', marginBottom: 2 }}>Nama Pasien</div>
                  <div style={{ fontWeight: 600 }}>{record.nama || 'Gracella Uhuy'}</div>
                </div>
                <div>
                  <div className="t12" style={{ fontWeight: 700, color: 'var(--neutral-400)', marginBottom: 2 }}>Tanggal Lahir</div>
                  <div>{record.dd || '01'} / {record.mm || 'Mei'} / {record.yyyy || '2000'}</div>
                </div>
                <div>
                  <div className="t12" style={{ fontWeight: 700, color: 'var(--neutral-400)', marginBottom: 2 }}>Jenis Kelamin</div>
                  <div>{record.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                </div>
              </div>

              <div className="t12 b" style={{ marginBottom: 4, fontWeight: 700 }}>Gejala Klinis</div>
              <div style={{ color: 'var(--neutral-800)', lineHeight: '20px' }}>
                {record.gejala || DEFAULT_SYMPTOM}
              </div>
            </div>
          </div>

          {/* Viewer Card */}
          <div className="card">
            <div className="viewer">
              <img
                src={record.files?.[activeImageIdx]?.url || '/sample-xray.jpeg'}
                alt="Radiologi Scan"
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  transform: `scale(${zoomLevel / 100})`,
                  transition: 'transform 0.2s ease',
                }}
              />
              <button
                type="button"
                className="btn sq"
                aria-label="Unduh citra"
                onClick={() => addToast('Mengunduh citra radiologi DICOM/JPEG...', 'success')}
                title="Unduh Citra"
              >
                <Download size={16} />
              </button>
            </div>

            <div className="row-between">
              <div>
                <button
                  type="button"
                  className="btn sq"
                  aria-label="Perbesar"
                  onClick={() => setZoomLevel((z) => Math.min(200, z + 20))}
                  title="Perbesar (+)"
                >
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  className="btn sq"
                  aria-label="Perkecil"
                  onClick={() => setZoomLevel((z) => Math.max(60, z - 20))}
                  title="Perkecil (-)"
                >
                  <Minus size={16} />
                </button>
              </div>

              <div>
                <button
                  type="button"
                  className="btn sq"
                  aria-label="Citra sebelumnya"
                  onClick={() => setActiveImageIdx((i) => Math.max(0, i - 1))}
                  disabled={activeImageIdx <= 0}
                  title="Citra Sebelumnya"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  className="btn sq"
                  aria-label="Citra berikutnya"
                  onClick={() => setActiveImageIdx((i) => i + 1)}
                  disabled={activeImageIdx >= (record.files?.length || 1) - 1}
                  title="Citra Berikutnya"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Keputusan & Decision Form */}
        <div className="right">
          <div style={{ width: '100%' }}>
            <div className="b" style={{ fontSize: 16 }}>Keputusan</div>
            <div className="dec">
              {/* Info Box */}
              <div className="info">
                <div>
                  <span className="t12 b">Status</span>
                  <span style={{ color: 'var(--quaternary-600)', fontWeight: 600 }}>Menunggu Verifikasi</span>
                </div>
                <div>
                  <span className="t12 b">Hasil Analisis AI</span>
                  <span style={{ fontWeight: 600 }}>{jenis} | {conf}%</span>
                </div>
              </div>

              {/* Verifikasi Toggle Buttons */}
              <div className="field">
                <label style={{ fontSize: 12, fontWeight: 700 }}>Verifikasi</label>
                <div className="verif">
                  <button
                    type="button"
                    className={`accept ${choice === 'terima' ? 'sel-on' : ''}`}
                    onClick={() => handleSelectChoice('terima')}
                  >
                    Terima Hasil AI
                  </button>
                  <button
                    type="button"
                    className={`reject ${choice === 'tolak' ? 'sel-on' : ''}`}
                    onClick={() => handleSelectChoice('tolak')}
                  >
                    Tolak Hasil AI
                  </button>
                </div>
              </div>

              {/* Keputusan Radiologi Input */}
              <div className="field">
                <label htmlFor="kr" style={{ fontSize: 12, fontWeight: 700 }}>Keputusan Radiologi</label>
                <input
                  id="kr"
                  className={`input ${keputusanRad ? 'filled' : ''}`}
                  placeholder="Keputusan Radiologi"
                  value={keputusanRad}
                  onChange={(e) => setKeputusanRad(e.target.value)}
                />
              </div>

              {/* Alasan Modifikasi Textarea */}
              <div className="field grow">
                <label htmlFor="am" style={{ fontSize: 12, fontWeight: 700 }}>Alasan Modifikasi</label>
                <textarea
                  id="am"
                  className={`input ${alasanMod ? 'filled' : ''}`}
                  placeholder="Alasan Modifikasi"
                  value={alasanMod}
                  onChange={(e) => setAlasanMod(e.target.value)}
                  style={{ minHeight: 90 }}
                />
              </div>
            </div>
          </div>

          {/* Konfirmasi Button (appears when choice selected) */}
          {choice && (
            <button
              type="button"
              className="btn btn-neutral dark"
              id="confirm"
              style={{ width: 188 }}
              onClick={handleConfirm}
            >
              Konfirmasi Keputusan
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DokterVerifikasi
