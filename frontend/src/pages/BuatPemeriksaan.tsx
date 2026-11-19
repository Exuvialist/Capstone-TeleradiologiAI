import React, { useState, useRef } from 'react'
import { Download, Image as ImageIcon, Info, Trash2, UploadCloud, Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PneumoniaLayout from '../components/PneumoniaTabs'
import { PatientCard } from '../components/PatientData'
import { samplePatient } from '../types/patient'
import { usePneumonia } from '../context/PneumoniaContext'

export default function BuatPemeriksaan({ filled = false }: { filled?: boolean }) {
  const navigate = useNavigate()
  const { currentCase, setCurrentCase, saveCurrentAsDraft, startAnalysis, addToast } = usePneumonia()

  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize with filled data if route is /buat/terisi or prop filled is true
  React.useEffect(() => {
    if (filled) {
      setCurrentCase((prev) => ({
        ...prev,
        id: samplePatient.id,
        nama: samplePatient.nama,
        dd: samplePatient.dd,
        mm: samplePatient.mm,
        yyyy: samplePatient.yyyy,
        gender: samplePatient.gender,
        gejala: samplePatient.gejala || '',
        files: [
          { name: 'untitled-attachment01.jpeg', size: '128.KB', url: '/sample-xray.jpeg' },
          { name: 'untitled-attachment02.jpeg', size: '128.KB', url: '/sample-xray.jpeg' },
        ],
      }))
    }
  }, [filled, setCurrentCase])

  const handlePatientChange = (updated: any) => {
    setCurrentCase((prev) => ({
      ...prev,
      ...updated,
    }))
  }

  const handleFilesAdded = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    const newFiles: Array<{ name: string; size: string; url?: string }> = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const sizeKb = (file.size / 1024).toFixed(1)
      const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)}.MB` : `${sizeKb}.KB`
      const url = file.type.startsWith('image/') ? URL.createObjectURL(file) : '/sample-xray.jpeg'
      newFiles.push({ name: file.name, size: sizeStr, url })
    }

    setCurrentCase((prev) => ({
      ...prev,
      files: [...prev.files, ...newFiles],
    }))
    addToast(`${newFiles.length} file berhasil diunggah.`, 'success')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFilesAdded(e.dataTransfer.files)
  }

  const handleRemoveFile = (index: number) => {
    setCurrentCase((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
    addToast('File telah dihapus.', 'info')
  }

  const handleDownloadFile = (f: { name: string; url?: string }) => {
    const a = document.createElement('a')
    a.href = f.url || '/sample-xray.jpeg'
    a.download = f.name
    a.click()
  }

  const handleFillSample = () => {
    setCurrentCase((prev) => ({
      ...prev,
      id: samplePatient.id,
      nama: samplePatient.nama,
      dd: samplePatient.dd,
      mm: samplePatient.mm,
      yyyy: samplePatient.yyyy,
      gender: samplePatient.gender,
      gejala: samplePatient.gejala || '',
      files: [
        { name: 'untitled-attachment01.jpeg', size: '128.KB', url: '/sample-xray.jpeg' },
        { name: 'untitled-attachment02.jpeg', size: '128.KB', url: '/sample-xray.jpeg' },
      ],
    }))
    addToast('Data contoh pasien terisi otomatis.', 'info')
  }

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisStep(1)

    setTimeout(() => {
      setAnalysisStep(2)
    }, 700)

    setTimeout(() => {
      setAnalysisStep(3)
    }, 1400)

    setTimeout(async () => {
      await startAnalysis()
      setIsAnalyzing(false)
      addToast('Analisis AI selesai! Hasil deteksi siap ditinjau.', 'success')
      navigate('/faskes-3t/detail/hasil-ai')
    }, 2000)
  }

  const files = currentCase.files
  const hasFiles = files.length > 0

  return (
    <PneumoniaLayout>
      <div className="cols">
        {/* Kolom Kiri: Data Pasien */}
        <div>
          <div className="section-title">
            <span>Data Pasien</span>
            <button
              type="button"
              onClick={handleFillSample}
              className="btn btn-outline"
              style={{ fontSize: 11, padding: '2px 8px', height: 26, gap: 4 }}
              title="Isi cepat dengan data contoh"
            >
              <Sparkles size={12} /> Contoh Data
            </button>
          </div>
          <PatientCard
            p={{
              id: currentCase.id,
              nama: currentCase.nama,
              dd: currentCase.dd,
              mm: currentCase.mm,
              yyyy: currentCase.yyyy,
              gender: currentCase.gender,
              gejala: currentCase.gejala,
            }}
            onChange={handlePatientChange}
          />
        </div>

        {/* Kolom Kanan: Upload Citra */}
        <div>
          <div className="section-title">
            <span>Upload Citra</span> <Info size={16} />
          </div>
          <div
            className="panel"
            style={{
              padding: 8,
              minHeight: 212,
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFilesAdded(e.target.files)}
              multiple
              accept="image/*,.pdf,.docx,.xlsx,.txt"
              style={{ display: 'none' }}
            />

            {hasFiles ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {files.map((f, idx) => (
                    <div className="fileline" key={f.name + idx} style={{ marginBottom: 0 }}>
                      <div className="f">
                        <ImageIcon size={16} style={{ flexShrink: 0 }} />
                        <span
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 180,
                          }}
                          title={f.name}
                        >
                          {f.name}
                        </span>
                        <span className="sz">{f.size}</span>
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(f)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 2,
                            color: 'inherit',
                          }}
                          title="Unduh lampiran"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn btn-del"
                        aria-label="Hapus file"
                        onClick={() => handleRemoveFile(idx)}
                        title="Hapus file"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 'auto', alignSelf: 'flex-end', paddingTop: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Cari File Tambahan
                  </button>
                </div>
              </>
            ) : (
              <div
                className={`dropzone ${isDragging ? 'dropzone-active' : ''}`}
                style={{
                  flex: 1,
                  cursor: 'pointer',
                  borderColor: isDragging ? 'var(--primary-600)' : undefined,
                  backgroundColor: isDragging ? 'var(--primary-100)' : undefined,
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud size={24} color="var(--neutral-800)" />
                <b>Pilih file atau tarik &amp; lepas di sini</b>
                <span className="muted" style={{ fontSize: 11 }}>txt, docx, pdf, jpeg, xlsx - Max. 50MB</span>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ marginTop: 6 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  Cari File
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gejala Klinis */}
      <div className="field" style={{ marginTop: 16 }}>
        <label className="label-sm">Gejala Klinis</label>
        <textarea
          className={`input area ${currentCase.gejala ? 'filled textarea-filled' : ''}`}
          style={{ height: 114, width: '100%', boxSizing: 'border-box' }}
          placeholder="Ketikkan gejala klinis pasien di sini..."
          value={currentCase.gejala}
          onChange={(e) =>
            setCurrentCase((prev) => ({
              ...prev,
              gejala: e.target.value,
            }))
          }
        />
      </div>

      {/* Tombol Aksi */}
      <div className="footer-actions">
        <button
          type="button"
          className="btn btn-outline btn-lg"
          style={{ width: 136 }}
          onClick={saveCurrentAsDraft}
        >
          Simpan Draft
        </button>
        <button
          type="button"
          className="btn btn-neutral btn-lg"
          style={{ width: 136 }}
          onClick={handleStartAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={16} className="spin" /> Analisis...
            </>
          ) : (
            'Mulai Analisis'
          )}
        </button>
      </div>

      {/* Modal Loading Analisis AI */}
      {isAnalyzing && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'var(--primary-100)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--primary-600)',
                }}
              >
                <Sparkles size={24} />
              </div>
              <div>
                <b style={{ fontSize: 16 }}>Model AI Teleradiologi Sedang Menganalisis</b>
                <div className="muted" style={{ fontSize: 12 }}>
                  Memproses citra radiologi toraks &amp; mengevaluasi data klinis
                </div>
              </div>
            </div>

            <div className="ai-steps" style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '14px 0' }}>
              <div className={`ai-step ${analysisStep >= 1 ? 'active' : ''}`}>
                {analysisStep > 1 ? <CheckCircle2 size={16} color="var(--tertiary-600)" /> : <Loader2 size={16} className="spin" />}
                <span>Ekstraksi fitur dan pre-processing citra rontgen toraks</span>
              </div>
              <div className={`ai-step ${analysisStep >= 2 ? 'active' : ''}`}>
                {analysisStep > 2 ? <CheckCircle2 size={16} color="var(--tertiary-600)" /> : analysisStep === 2 ? <Loader2 size={16} className="spin" /> : <div className="step-dot" />}
                <span>Inference model deep learning (DenseNet121)</span>
              </div>
              <div className={`ai-step ${analysisStep >= 3 ? 'active' : ''}`}>
                {analysisStep >= 3 ? <CheckCircle2 size={16} color="var(--tertiary-600)" /> : <div className="step-dot" />}
                <span>Perhitungan confidence score &amp; lokalisasi lesi pneumonia</span>
              </div>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: analysisStep === 1 ? '35%' : analysisStep === 2 ? '70%' : '100%',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </PneumoniaLayout>
  )
}
