import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  Download,
  Minus,
  Plus,
  RotateCcw,
  CheckCircle,
  XCircle,
  FileText,
  UserCheck,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PatientCard } from '../components/PatientData'
import { samplePatient } from '../types/patient'
import { usePneumonia } from '../context/PneumoniaContext'

type Variant = 'ai' | 'menunggu' | 'radiolog' | 'hasil'

function Summary({ rows }: { rows: [string, string][] }) {
  return (
    <div className="summary">
      {rows.map(([k, v]) => (
        <div className="r" key={k}>
          <b>{k}</b>
          <span>{v}</span>
        </div>
      ))}
    </div>
  )
}

function ResultPanel({
  variant,
  patientData,
  onVerifyClick,
}: {
  variant: Variant
  patientData: any
  onVerifyClick: () => void
}) {
  const [zoom, setZoom] = useState(1)
  const [showOverlay, setShowOverlay] = useState(variant === 'ai' || variant === 'radiolog')

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75))
  const handleResetZoom = () => setZoom(1)
  const handleToggleOverlay = () => setShowOverlay((prev) => !prev)

  const handleDownloadImage = () => {
    const a = document.createElement('a')
    a.href = patientData?.files?.[0]?.url || '/sample-xray.jpeg'
    a.download = `rontgen-${patientData?.id || 'PN0123'}.jpeg`
    a.click()
  }

  const doctorName = patientData?.radiologist || 'Dr. Bernard Bear'
  const aiScore = patientData?.aiResult?.confidence || 90
  const aiDiagnosis = patientData?.aiResult?.diagnosis || 'Pneumonia'

  return (
    <div className="panel">
      {variant === 'ai' && (
        <>
          <div className="label-sm" style={{ marginBottom: 6 }}>
            Hasil Analisis AI
          </div>
          <div className="banner-ai">
            <b className="n">{aiDiagnosis}</b>
            <span style={{ fontSize: 12 }}>
              Confidence Score: <b>{aiScore}%</b>
            </span>
          </div>
        </>
      )}

      {variant === 'menunggu' && (
        <Summary
          rows={[
            ['Status', 'Menunggu Verifikasi'],
            ['Hasil Analisis AI', `${aiDiagnosis} | ${aiScore}%`],
          ]}
        />
      )}

      {variant === 'radiolog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Summary
            rows={[
              ['Status', 'Menunggu Verifikasi'],
              ['Nama Radiologi', doctorName],
              ['Hasil Analisis AI', `${aiDiagnosis} | ${aiScore}%`],
            ]}
          />
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: 12, padding: '4px 8px', alignSelf: 'flex-end', marginTop: 2 }}
            onClick={onVerifyClick}
          >
            <UserCheck size={14} /> Tindak Lanjuti Verifikasi Radiolog
          </button>
        </div>
      )}

      {variant === 'hasil' && (
        <div className="summary" style={{ background: '#f5f5f5' }}>
          <div className="r">
            <b>Nama Radiologi</b>
            <span>{patientData?.radiologist || 'Dr. Bernard Bear'}</span>
          </div>
          <div className="r">
            <b>Tanggal diverifikasi</b>
            <span>{patientData?.verificationDate || '10/10/2026'}</span>
          </div>
          <div className="r">
            <b>Hasil Verifikasi</b>
            <span style={{ textAlign: 'right' }}>
              <b style={{ fontSize: 13 }}>{patientData?.verificationResult || 'Bukan Pneumonia'}</b>
              <br />
              <span style={{ fontSize: 11, color: 'var(--neutral-400)' }}>(Hasil Deteksi AI ditolak)</span>
            </span>
          </div>
          <div>
            <b>Catatan</b>
            <div style={{ marginTop: 4, lineHeight: 1.4 }}>
              {patientData?.verificationNotes ||
                'Pasien datang dengan keluhan sesak napas yang meningkat sejak [X] hari, disertai batuk berdahak kental dan demam naik-turun.'}
            </div>
          </div>
        </div>
      )}

      <div
        className="label-sm"
        style={{ margin: '10px 0 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span>Hasil Deteksi</span>
        <span style={{ fontSize: 11, color: 'var(--neutral-400)' }}>
          Mode: {showOverlay ? 'AI Heatmap Overlay' : 'Citra Polos'} ({Math.round(zoom * 100)}%)
        </span>
      </div>

      {/* Canvas Viewport */}
      <div
        className="canvas"
        style={{
          minHeight: variant === 'hasil' ? 212 : 213,
          height: 230,
          overflow: 'hidden',
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          backgroundColor: '#1a1a1f',
        }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
            position: 'relative',
            display: 'inline-block',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          <img
            src={patientData?.files?.[0]?.url || '/sample-xray.jpeg'}
            alt="Thorax X-Ray"
            style={{
              maxHeight: 220,
              maxWidth: '100%',
              display: 'block',
              objectFit: 'contain',
              borderRadius: 6,
            }}
          />

          {/* AI Bounding Box & Heatmap Highlight */}
          {showOverlay && (
            <div
              style={{
                position: 'absolute',
                top: '32%',
                left: '46%',
                width: '38%',
                height: '42%',
                border: '2px solid #fb3748',
                borderRadius: 4,
                backgroundColor: 'rgba(251, 55, 72, 0.22)',
                boxShadow: '0 0 12px rgba(251, 55, 72, 0.45)',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -22,
                  left: -2,
                  background: '#fb3748',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '3px 3px 0 0',
                  whiteSpace: 'nowrap',
                }}
              >
                Infiltrat Paru Kanan (90%)
              </div>
            </div>
          )}
        </div>

        {/* Download Button */}
        <button
          type="button"
          className="btn btn-outline dl"
          aria-label="Unduh Citra"
          onClick={handleDownloadImage}
          title="Unduh Citra Radiologi"
          style={{ background: 'rgba(255, 255, 255, 0.9)', zIndex: 10 }}
        >
          <Download size={16} />
        </button>
      </div>

      {/* Tool buttons */}
      <div className="tools">
        <div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleZoomIn}
            title="Perbesar (Zoom In)"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleZoomOut}
            title="Perkecil (Zoom Out)"
          >
            <Minus size={16} />
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleResetZoom}
            title="Reset Zoom"
          >
            <RotateCcw size={14} />
          </button>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleToggleOverlay}
            title="Ganti Tampilan Normal / AI Overlay"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleToggleOverlay}
            title="Ganti Tampilan Normal / AI Overlay"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Detail({ variant }: { variant: Variant }) {
  const nav = useNavigate()
  const { currentCase, autoAssignDoctor, verifyCase, addToast } = usePneumonia()

  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [verifyResult, setVerifyResult] = useState<'Bukan Pneumonia' | 'Pneumonia Terkonfirmasi'>('Bukan Pneumonia')
  const [verifyNotes, setVerifyNotes] = useState(
    'Pasien datang dengan keluhan sesak napas yang meningkat sejak [X] hari, disertai batuk berdahak kental dan demam naik-turun. Opasitas lebih mengarah pada atelektasis ringan.'
  )

  // Use currentCase if valid, otherwise fallback to samplePatient
  const activePatient = currentCase?.nama ? currentCase : samplePatient

  const handleAutoAssign = () => {
    const assignedDoc = autoAssignDoctor(activePatient.id)
    addToast(`Penugasan otomatis berhasil! Pasien diserahkan kepada ${assignedDoc}.`, 'success')
    nav('/faskes-3t/detail/radiolog')
  }

  const handleManualAssign = () => {
    nav('/faskes-3t/assignment')
  }

  const handleConfirmVerification = () => {
    verifyCase(activePatient.id, verifyResult, verifyNotes)
    setVerifyModalOpen(false)
    nav('/faskes-3t/detail/hasil')
  }

  return (
    <>
      <div className="back-row">
        <button type="button" className="btn btn-outline btn-lg" onClick={() => nav(-1)}>
          <ChevronLeft size={16} /> Kembali
        </button>
      </div>

      <div className="panel" style={{ padding: 10 }}>
        <div className="cols">
          {/* Kolom Kiri: Data Pasien */}
          <div>
            <div className="section-title">Data Pasien</div>
            <PatientCard p={activePatient as any} readOnly />
            <div className="field" style={{ marginTop: 10 }}>
              <label className="label-sm">Gejala Klinis</label>
              <div
                className="input area filled textarea-filled"
                style={{ height: variant === 'hasil' ? 176 : 100, overflowY: 'auto' }}
              >
                {activePatient.gejala || samplePatient.gejala}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Hasil */}
          <div>
            <div className="section-title">{variant === 'hasil' ? 'Hasil Radiologi' : 'Hasil'}</div>
            <ResultPanel
              variant={variant}
              patientData={activePatient}
              onVerifyClick={() => setVerifyModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      {variant === 'ai' || variant === 'menunggu' ? (
        <div className="footer-actions">
          <button type="button" className="btn btn-outline btn-lg" onClick={handleManualAssign}>
            Manual Assignment
          </button>
          <button type="button" className="btn btn-neutral btn-lg" onClick={handleAutoAssign}>
            Automatic Assignment
          </button>
        </div>
      ) : variant === 'hasil' ? (
        <div className="footer-actions">
          <button
            type="button"
            className="btn btn-outline btn-lg"
            onClick={() => {
              window.print()
            }}
          >
            <FileText size={16} /> Cetak Laporan PDF
          </button>
          <Link to="/faskes-3t/statistika" className="btn btn-neutral btn-lg">
            Kembali ke Dashboard
          </Link>
        </div>
      ) : null}

      {/* Modal Simulasi Verifikasi Radiolog */}
      {verifyModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <b style={{ fontSize: 16 }}>Verifikasi Hasil oleh Dokter Radiolog</b>
            <div className="muted" style={{ fontSize: 12, marginTop: 4, marginBottom: 14 }}>
              Periksa kecocokan deteksi AI dengan gambaran klinis dan radiografi pasien.
            </div>

            <div className="field">
              <label className="label-sm">Keputusan Radiolog</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  className={`btn ${verifyResult === 'Bukan Pneumonia' ? 'btn-neutral' : 'btn-outline'}`}
                  onClick={() => setVerifyResult('Bukan Pneumonia')}
                  style={{ flex: 1 }}
                >
                  <XCircle size={16} /> Tolak Hasil AI (Bukan Pneumonia)
                </button>
                <button
                  type="button"
                  className={`btn ${verifyResult === 'Pneumonia Terkonfirmasi' ? 'btn-neutral' : 'btn-outline'}`}
                  onClick={() => setVerifyResult('Pneumonia Terkonfirmasi')}
                  style={{ flex: 1 }}
                >
                  <CheckCircle size={16} /> Konfirmasi Pneumonia
                </button>
              </div>
            </div>

            <div className="field" style={{ marginTop: 12 }}>
              <label className="label-sm">Catatan Radiolog</label>
              <textarea
                className="input area filled"
                style={{ height: 90, width: '100%', boxSizing: 'border-box' }}
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setVerifyModalOpen(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-neutral"
                onClick={handleConfirmVerification}
              >
                Simpan &amp; Verifikasi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
