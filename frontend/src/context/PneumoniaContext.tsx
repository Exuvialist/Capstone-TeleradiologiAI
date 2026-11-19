import React, { createContext, useContext, useState, useEffect } from 'react'
import type { PatientRecord, Doctor } from '../types/patient'
import { initialPatient } from '../types/patient'

export type { PatientRecord, Doctor }

export interface ToastMessage {
  id: string
  text: string
  type?: 'success' | 'info' | 'warning'
}

export interface PneumoniaContextType {
  cases: PatientRecord[]
  currentCase: PatientRecord
  setCurrentCase: React.Dispatch<React.SetStateAction<PatientRecord>>
  updateCurrentField: <K extends keyof PatientRecord>(field: K, value: PatientRecord[K]) => void
  doctors: Doctor[]
  drafts: PatientRecord[]
  saveCurrentAsDraft: () => void
  loadDraft: (draftId: string) => void
  deleteDraft: (draftId: string) => void
  startAnalysis: () => Promise<PatientRecord>
  assignDoctorToCase: (caseId: string, doctorName: string) => void
  autoAssignDoctor: (caseId: string) => string
  verifyCase: (
    caseId: string,
    result: 'Bukan Pneumonia' | 'Pneumonia Terkonfirmasi' | 'Perlu Pemeriksaan Ulang',
    notes: string
  ) => void
  toasts: ToastMessage[]
  addToast: (text: string, type?: 'success' | 'info' | 'warning') => void
  removeToast: (id: string) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  resetNewCaseForm: () => void
}

const defaultDoctors: Doctor[] = [
  { id: 'd1', nama: 'Dr. Tama', pengalaman: '2 Tahun', jumlahKasus: 10, spesialisasi: 'Radiologi Toraks' },
  { id: 'd2', nama: 'Dr. Bernard Bear', pengalaman: '7 Tahun', jumlahKasus: 4, spesialisasi: 'Teleradiologi Paru' },
  { id: 'd3', nama: 'Dr. Sarah Jenkins', pengalaman: '5 Tahun', jumlahKasus: 6, spesialisasi: 'Radiologi Pediatrik' },
  { id: 'd4', nama: 'Dr. Maya Indah', pengalaman: '3 Tahun', jumlahKasus: 8, spesialisasi: 'Radiologi Diagnostik' },
  { id: 'd5', nama: 'Dr. Hendra Wijaya', pengalaman: '9 Tahun', jumlahKasus: 2, spesialisasi: 'Radiologi Kardiotoraks' },
  { id: 'd6', nama: 'Dr. Dewi Sartika', pengalaman: '4 Tahun', jumlahKasus: 7, spesialisasi: 'Radiologi Komprehensif' },
  { id: 'd7', nama: 'Dr. Rizky Pratama', pengalaman: '6 Tahun', jumlahKasus: 5, spesialisasi: 'AI-Assisted Imaging' },
  { id: 'd8', nama: 'Dr. Agus Salim', pengalaman: '11 Tahun', jumlahKasus: 3, spesialisasi: 'Radiologi Klinis' },
  { id: 'd9', nama: 'Dr. Lina Marlina', pengalaman: '3 Tahun', jumlahKasus: 9, spesialisasi: 'Kedokteran Nuklir & Toraks' },
]

const initialCases: PatientRecord[] = [
  initialPatient,
  {
    id: '#PN-0124',
    nama: 'Ahmad Dani',
    dd: '14',
    mm: 'Agt',
    yyyy: '1982',
    gender: 'L',
    gejala: 'Batuk berdahak kecoklatan, demam tinggi 38.5C selama 4 hari.',
    files: [{ name: 'xray-ahmad-01.jpeg', size: '142.KB', url: '/sample-xray.jpeg' }],
    aiResult: { diagnosis: 'Pneumonia', confidence: 94, finding: 'Konsolidasi lobaris paru kiri.' },
    radiologist: 'Dr. Tama',
    status: 'proses',
    createdAt: '2026-10-18',
  },
  {
    id: '#PN-0125',
    nama: 'Siti Nurhaliza',
    dd: '22',
    mm: 'Nov',
    yyyy: '1995',
    gender: 'P',
    gejala: 'Sesak napas ringan setelah aktivitas, batuk kering 2 minggu.',
    files: [{ name: 'xray-siti-01.jpeg', size: '118.KB', url: '/sample-xray.jpeg' }],
    aiResult: { diagnosis: 'Bukan Pneumonia', confidence: 88, finding: 'Cor dan pulmo dalam batas normal.' },
    radiologist: 'Dr. Bernard Bear',
    verificationDate: '19/10/2026',
    verificationResult: 'Bukan Pneumonia',
    verificationNotes: 'Tidak tampak infiltrate aktif pada kedua lapang paru.',
    status: 'terverifikasi',
    createdAt: '2026-10-19',
  },
  {
    id: '#PN-0126',
    nama: 'Budi Santoso',
    dd: '09',
    mm: 'Jan',
    yyyy: '1975',
    gender: 'L',
    gejala: 'Sesak progresif, nyeri dada saat bernapas dalam, leukositosis.',
    files: [{ name: 'xray-budi-01.jpeg', size: '135.KB', url: '/sample-xray.jpeg' }],
    aiResult: { diagnosis: 'Pneumonia', confidence: 91, finding: 'Infiltrat intersisial bilateral.' },
    radiologist: 'Dr. Tama',
    status: 'proses',
    createdAt: '2026-10-19',
  },
  {
    id: '#PN-0127',
    nama: 'Ratna Sari',
    dd: '05',
    mm: 'Mar',
    yyyy: '2001',
    gender: 'P',
    gejala: 'Demam, meriang, batuk berdahak 3 hari.',
    files: [{ name: 'xray-ratna-01.jpeg', size: '120.KB', url: '/sample-xray.jpeg' }],
    aiResult: { diagnosis: 'Bukan Pneumonia', confidence: 86, finding: 'Bercak fibrosis lama inaktif.' },
    radiologist: 'Dr. Sarah Jenkins',
    verificationDate: '19/10/2026',
    verificationResult: 'Bukan Pneumonia',
    verificationNotes: 'Infiltrat aktif disangkal.',
    status: 'terverifikasi',
    createdAt: '2026-10-19',
  },
]

const emptyCase: PatientRecord = {
  id: '#PN-0128',
  nama: '',
  dd: '',
  mm: '',
  yyyy: '',
  gender: null,
  gejala: '',
  files: [],
  status: 'draft',
  createdAt: new Date().toISOString(),
}

const PneumoniaContext = createContext<PneumoniaContextType | undefined>(undefined)

export const PneumoniaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<PatientRecord[]>(() => {
    const saved = localStorage.getItem('teleradiologi_cases')
    return saved ? (JSON.parse(saved) as PatientRecord[]) : initialCases
  })

  const [currentCase, setCurrentCase] = useState<PatientRecord>(() => {
    const saved = localStorage.getItem('teleradiologi_current_draft')
    return saved ? (JSON.parse(saved) as PatientRecord) : emptyCase
  })

  const [drafts, setDrafts] = useState<PatientRecord[]>(() => {
    const saved = localStorage.getItem('teleradiologi_drafts')
    return saved
      ? (JSON.parse(saved) as PatientRecord[])
      : [
          {
            ...emptyCase,
            id: '#PN-DRAFT-01',
            nama: 'Draft Pasien Rawat Jalan',
            gejala: 'Keluhan batuk berdahak 4 hari, riwayat asma.',
            dd: '12',
            mm: '08',
            yyyy: '1998',
            gender: 'L',
            files: [{ name: 'draft-scan-01.jpeg', size: '110.KB', url: '/sample-xray.jpeg' }],
          },
        ]
  })

  const [doctors] = useState<Doctor[]>(defaultDoctors)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    localStorage.setItem('teleradiologi_cases', JSON.stringify(cases))
  }, [cases])

  useEffect(() => {
    localStorage.setItem('teleradiologi_drafts', JSON.stringify(drafts))
  }, [drafts])

  const addToast = (text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev: ToastMessage[]) => [...prev, { id, text, type }])
    setTimeout(() => {
      setToasts((prev: ToastMessage[]) => prev.filter((t) => t.id !== id))
    }, 3500)
  }

  const removeToast = (id: string) => {
    setToasts((prev: ToastMessage[]) => prev.filter((t) => t.id !== id))
  }

  const updateCurrentField = <K extends keyof PatientRecord>(field: K, value: PatientRecord[K]) => {
    setCurrentCase((prev: PatientRecord) => {
      const updated = { ...prev, [field]: value }
      localStorage.setItem('teleradiologi_current_draft', JSON.stringify(updated))
      return updated
    })
  }

  const resetNewCaseForm = () => {
    const nextId = `#PN-0${Math.floor(129 + Math.random() * 800)}`
    const fresh: PatientRecord = { ...emptyCase, id: nextId, createdAt: new Date().toISOString() }
    setCurrentCase(fresh)
    localStorage.removeItem('teleradiologi_current_draft')
  }

  const saveCurrentAsDraft = () => {
    setDrafts((prev: PatientRecord[]) => {
      const existingIdx = prev.findIndex((d) => d.id === currentCase.id)
      if (existingIdx >= 0) {
        const copy = [...prev]
        copy[existingIdx] = { ...currentCase, status: 'draft' }
        return copy
      }
      return [...prev, { ...currentCase, status: 'draft' }]
    })
    addToast(`Draft pemeriksaan (${currentCase.id || 'Pasien Baru'}) berhasil disimpan!`, 'success')
  }

  const loadDraft = (draftId: string) => {
    const found = drafts.find((d) => d.id === draftId)
    if (found) {
      setCurrentCase({ ...found })
      addToast(`Draft ${found.id} berhasil dimuat ke formulir.`, 'info')
    }
  }

  const deleteDraft = (draftId: string) => {
    setDrafts((prev: PatientRecord[]) => prev.filter((d) => d.id !== draftId))
    addToast('Draft berhasil dihapus.', 'info')
  }

  const startAnalysis = async (): Promise<PatientRecord> => {
    const prepared: PatientRecord = {
      ...currentCase,
      id: currentCase.id || `#PN-0${Math.floor(130 + Math.random() * 800)}`,
      nama: currentCase.nama || 'Gracella Uhuy',
      dd: currentCase.dd || '01',
      mm: currentCase.mm || 'Mei',
      yyyy: currentCase.yyyy || '2000',
      gender: currentCase.gender || 'P',
      gejala:
        currentCase.gejala ||
        'Pasien datang dengan keluhan sesak napas yang meningkat sejak [X] hari, disertai batuk berdahak kental dan demam naik-turun. Pada pemeriksaan fisik dada, ditemukan fremitus taktil meningkat pada lapang paru [kanan/kiri] serta suara ronkhi wet basah. SpO2: [X]%.',
      files:
        currentCase.files.length > 0
          ? currentCase.files
          : [
              { name: 'untitled-attachment01.jpeg', size: '128.KB', url: '/sample-xray.jpeg' },
              { name: 'untitled-attachment02.jpeg', size: '128.KB', url: '/sample-xray.jpeg' },
            ],
      status: 'menunggu',
      aiResult: {
        diagnosis: 'Pneumonia',
        confidence: 90,
        finding:
          'Infiltrasi bercak opasitas pada lobus bawah paru kanan konsisten dengan gambaran pneumonia bakterial.',
      },
    }

    setCurrentCase(prepared)
    setCases((prev: PatientRecord[]) => {
      const idx = prev.findIndex((c) => c.id === prepared.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = prepared
        return copy
      }
      return [prepared, ...prev]
    })

    return prepared
  }

  const assignDoctorToCase = (caseId: string, doctorName: string) => {
    setCases((prev: PatientRecord[]) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            radiologist: doctorName,
            status: 'proses',
          }
        }
        return c
      })
    )

    if (currentCase.id === caseId) {
      setCurrentCase((prev: PatientRecord) => ({
        ...prev,
        radiologist: doctorName,
        status: 'proses',
      }))
    }

    addToast(`Pemeriksaan ${caseId} berhasil ditugaskan ke ${doctorName}.`, 'success')
  }

  const autoAssignDoctor = (caseId: string): string => {
    const sorted = [...doctors].sort((a, b) => a.jumlahKasus - b.jumlahKasus)
    const assigned = sorted[0]?.nama || 'Dr. Bernard Bear'
    assignDoctorToCase(caseId, assigned)
    return assigned
  }

  const verifyCase = (
    caseId: string,
    result: 'Bukan Pneumonia' | 'Pneumonia Terkonfirmasi' | 'Perlu Pemeriksaan Ulang',
    notes: string
  ) => {
    const today = new Date()
    const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`

    setCases((prev: PatientRecord[]) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            verificationResult: result,
            verificationNotes: notes,
            verificationDate: dateStr,
            status: 'terverifikasi',
          }
        }
        return c
      })
    )

    if (currentCase.id === caseId) {
      setCurrentCase((prev: PatientRecord) => ({
        ...prev,
        verificationResult: result,
        verificationNotes: notes,
        verificationDate: dateStr,
        status: 'terverifikasi',
      }))
    }

    addToast(`Kasus ${caseId} berhasil diverifikasi oleh Radiolog: ${result}.`, 'success')
  }

  return (
    <PneumoniaContext.Provider
      value={{
        cases,
        currentCase,
        setCurrentCase,
        updateCurrentField,
        doctors,
        drafts,
        saveCurrentAsDraft,
        loadDraft,
        deleteDraft,
        startAnalysis,
        assignDoctorToCase,
        autoAssignDoctor,
        verifyCase,
        toasts,
        addToast,
        removeToast,
        sidebarCollapsed,
        setSidebarCollapsed,
        resetNewCaseForm,
      }}
    >
      {children}
    </PneumoniaContext.Provider>
  )
}

export function usePneumonia(): PneumoniaContextType {
  const ctx = useContext(PneumoniaContext)
  if (!ctx) {
    throw new Error('usePneumonia must be used within a PneumoniaProvider')
  }
  return ctx
}
