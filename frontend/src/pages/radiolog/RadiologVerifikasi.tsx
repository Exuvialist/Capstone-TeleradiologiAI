import React, { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  CheckCircle2,
  XCircle,
  Activity,
  FileText,
  Clock,
  Check,
} from 'lucide-react'
import { usePneumonia } from '../../context/PneumoniaContext'
import type { PatientRecord } from '../../types/patient'

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



export default DokterVerifikasi
