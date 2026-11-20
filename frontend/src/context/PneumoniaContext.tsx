import React, { createContext, useContext, useState, useEffect } from 'react'
import type { PatientRecord, Doctor } from '../types/patient'
import { initialPatient } from '../types/patient'

export type { PatientRecord, Doctor }

export type UserRole = 'faskes' | 'radiolog'

export interface AuthUser {
  role: UserRole
  name: string
  username: string
}

export interface LoginResult {
  success: boolean
  role?: UserRole
  error?: string
}

export interface ToastMessage {
  id: string
  text: string
  type?: 'success' | 'info' | 'warning'
}

export interface PneumoniaContextType {
  currentUser: AuthUser | null
  login: (password: string, username?: string) => LoginResult
  logout: () => void
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
    result: string,
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

export function generateComprehensiveCases(): PatientRecord[] {
  const result: PatientRecord[] = []
  let counter = 100

  // 1. Core 100 Cases for 13-19 Okt 2026 matching Figma design specs
  const dailyPlan = [
    { date: '2026-10-13', vDate: '13/10/2026', tumor: 3, kanker: 3, pneumonia: 5, pending: 0 },
    { date: '2026-10-14', vDate: '14/10/2026', tumor: 4, kanker: 2, pneumonia: 6, pending: 0 },
    { date: '2026-10-15', vDate: '15/10/2026', tumor: 2, kanker: 4, pneumonia: 4, pending: 0 },
    { date: '2026-10-16', vDate: '16/10/2026', tumor: 5, kanker: 3, pneumonia: 7, pending: 3 },
    { date: '2026-10-17', vDate: '17/10/2026', tumor: 4, kanker: 5, pneumonia: 6, pending: 4 },
    { date: '2026-10-18', vDate: '18/10/2026', tumor: 6, kanker: 3, pneumonia: 8, pending: 5 },
    { date: '2026-10-19', vDate: '19/10/2026', tumor: 6, kanker: 5, pneumonia: 9, pending: 2 },
  ]

  const firstNames = ['Gracella', 'Ahmad', 'Siti', 'Budi', 'Ratna', 'Nabila', 'Raka', 'Dimas', 'Farhan', 'Dewi', 'Eka', 'Hendra', 'Gita', 'Irfan', 'Joko', 'Kurnia', 'Laras', 'Mega', 'Nugroho', 'Oki', 'Putri', 'Qori', 'Rizky', 'Surya', 'Tri', 'Utami', 'Vina', 'Wawan', 'Yanto', 'Zahra']
  const lastNames = ['Uhuy', 'Dani', 'Nurhaliza', 'Santoso', 'Sari', 'Putri', 'Pratama', 'Anggara', 'Malik', 'Lestari', 'Saputra', 'Kurnia', 'Gutawa', 'Hakim', 'Anwar', 'Wijaya', 'Kusuma', 'Pertiwi', 'Hidayat', 'Wibowo']
  const faskesList = ['Faskes Shinyu', 'Faskes Dohoon', 'Faskes Youngjae', 'Faskes Alor', 'Faskes Rote', 'Faskes Sumba']

  dailyPlan.forEach((day) => {
    const categories: Array<'Tumor Otak' | 'Kanker Tulang' | 'Pneumonia'> = []
    for (let i = 0; i < day.tumor; i++) categories.push('Tumor Otak')
    for (let i = 0; i < day.kanker; i++) categories.push('Kanker Tulang')
    for (let i = 0; i < day.pneumonia; i++) categories.push('Pneumonia')

    let dayPendingLeft = day.pending

    categories.forEach((cat, idx) => {
      counter++
      const prefix = cat === 'Tumor Otak' ? 'TO' : cat === 'Kanker Tulang' ? 'KT' : 'PN'
      const id = counter === 101 ? '#PN-0123' : `#${prefix}-0${counter}`
      const fn = counter === 101 ? 'Gracella' : firstNames[(counter + idx) % firstNames.length]
      const ln = counter === 101 ? 'Uhuy' : lastNames[(counter + idx * 3) % lastNames.length]
      const faskes = counter === 101 ? 'Faskes Shinyu' : faskesList[(counter + idx) % faskesList.length]

      const isPending = dayPendingLeft > 0
      if (isPending) {
        dayPendingLeft--
      }

      // 92% average confidence
      const conf = 88 + ((counter * 7 + idx * 3) % 9)

      let finding = ''
      let verResult = ''
      let finalDiag: string = cat
      if (cat === 'Pneumonia') {
        const isNegAi = id === '#PN-0126' || id === '#PN-0129' || counter % 7 === 0
        if (isNegAi) {
          finalDiag = 'Bukan Pneumonia'
          finding = 'Corakan bronkovaskular dalam batas normal. Tidak tampak infiltrat, konsolidasi pneumonik, maupun efusi pleura. Cor dan pulmo normal (Bukan Pneumonia).'
          verResult = isPending ? '' : 'Tidak terdeteksi'
        } else {
          finding = 'Infiltrasi bercak opasitas konsisten dengan pneumonia lobaris.'
          verResult = isPending ? '' : (counter % 3 === 0 ? 'Tidak terdeteksi' : 'Terdeteksi')
        }
      } else if (cat === 'Kanker Tulang') {
        finding = 'Lesi osteolitik metafisis disertai reaksi periosteal sunburst.'
        verResult = isPending ? '' : (counter % 4 === 0 ? 'Tidak terdeteksi' : 'Terdeteksi')
      } else {
        finding = 'Massa ekstra-aksial lobus frontoparietal berbatas tegas.'
        verResult = isPending ? '' : 'Terdeteksi'
      }

      result.push({
        id,
        nama: `${fn} ${ln}`,
        dd: String(1 + (counter % 28)).padStart(2, '0'),
        mm: 'Mei',
        yyyy: String(1975 + (counter % 30)),
        gender: counter % 2 === 0 ? 'L' : 'P',
        gejala:
          finalDiag === 'Bukan Pneumonia'
            ? 'Pemeriksaan radiologi rutin skrining kesehatan toraks. Tidak ada sesak napas maupun demam, SpO2 normal 99%.'
            : cat === 'Pneumonia'
            ? 'Pasien datang dengan keluhan sesak napas yang meningkat sejak [X] hari, batuk berdahak kental, dan demam naik-turun. SpO2: 92%.'
            : cat === 'Kanker Tulang'
            ? 'Nyeri tumpul pada tungkai bawah kanan, teraba massa/pembengkakan lokal sejak 3 minggu.'
            : 'Nyeri kepala hebat kronis memberat di pagi hari, muntah proyektil, defisit neurologis fokal.',
        files: [{ name: `scan-${prefix.toLowerCase()}-${counter}.jpeg`, size: '134.KB', url: '/sample-xray.jpeg' }],
        aiResult: {
          diagnosis: finalDiag,
          confidence: conf,
          finding,
        },
        radiologist: isPending ? undefined : 'Dr. Shinyu',
        verificationDate: isPending ? undefined : day.vDate,
        verificationResult: isPending ? undefined : verResult,
        verificationNotes: isPending ? undefined : `Evaluasi klinis radiolog terverifikasi: gambaran konsisten dengan status ${verResult}.`,
        status: isPending ? 'menunggu' : 'terverifikasi',
        createdAt: day.date,
        faskes,
      })
    })
  })

  // 2. Historical cases for other months in 2026 and past years (2025, 2024)
  const historicalDates = [
    '2026-01-15', '2026-02-10', '2026-03-22', '2026-04-18', '2026-05-12', '2026-06-25',
    '2026-07-14', '2026-08-08', '2026-09-19', '2026-11-05', '2026-12-12',
    '2025-04-10', '2025-08-20', '2025-11-15',
    '2024-03-12', '2024-07-19', '2024-10-25'
  ]

  historicalDates.forEach((hDate, hIdx) => {
    counter++
    const cats: Array<'Tumor Otak' | 'Kanker Tulang' | 'Pneumonia'> = ['Pneumonia', 'Tumor Otak', 'Kanker Tulang']
    const cat = cats[hIdx % 3]
    const prefix = cat === 'Tumor Otak' ? 'TO' : cat === 'Kanker Tulang' ? 'KT' : 'PN'
    const fn = firstNames[hIdx % firstNames.length]
    const ln = lastNames[hIdx % lastNames.length]

    result.push({
      id: `#${prefix}-HIST-${counter}`,
      nama: `${fn} ${ln}`,
      dd: '10',
      mm: 'Jan',
      yyyy: '1985',
      gender: hIdx % 2 === 0 ? 'L' : 'P',
      gejala: 'Pemeriksaan radiologi berkala tahunan.',
      files: [{ name: `hist-${counter}.jpeg`, size: '128.KB', url: '/sample-xray.jpeg' }],
      aiResult: {
        diagnosis: cat,
        confidence: 90 + (hIdx % 6),
        finding: 'Evaluasi citra klinis rekam medis.',
      },
      radiologist: 'Dr. Shinyu',
      verificationDate: hDate.split('-').reverse().join('/'),
      verificationResult: 'Terdeteksi',
      verificationNotes: 'Arsip kasus terverifikasi.',
      status: 'terverifikasi',
      createdAt: hDate,
    })
  })

  return result
}

const initialCases: PatientRecord[] = generateComprehensiveCases()

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
    try {
      const saved = localStorage.getItem('teleradiologi_cases')
      if (saved) {
        const parsed = JSON.parse(saved) as PatientRecord[]
        if (Array.isArray(parsed) && parsed.length >= 50) {
          const hasBukan = parsed.some((c) => c.aiResult?.diagnosis === 'Bukan Pneumonia')
          if (!hasBukan) {
            const updated = parsed.map((c) => {
              if (c.id === '#PN-0126') {
                return {
                  ...c,
                  status: 'menunggu' as const,
                  gejala: 'Pemeriksaan radiologi rutin skrining kesehatan toraks. Tidak ada sesak napas maupun demam, SpO2 normal 99%.',
                  aiResult: {
                    diagnosis: 'Bukan Pneumonia',
                    confidence: 93,
                    finding: 'Corakan bronkovaskular dalam batas normal. Tidak tampak infiltrat, konsolidasi pneumonik, maupun efusi pleura. Cor dan pulmo normal (Bukan Pneumonia).',
                  },
                }
              }
              if (c.id === '#PN-0129') {
                return {
                  ...c,
                  status: 'terverifikasi' as const,
                  verificationResult: 'Tidak terdeteksi',
                  aiResult: {
                    diagnosis: 'Bukan Pneumonia',
                    confidence: 95,
                    finding: 'Jantung dan paru dalam batas normal. Sinus kostofrenikus lancar tajam, tidak ada tanda pneumonia aktif.',
                  },
                }
              }
              return c
            })
            localStorage.setItem('teleradiologi_cases', JSON.stringify(updated))
            return updated
          }
          return parsed
        }
      }
    } catch {
      // fallback
    }
    return initialCases
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

  // User authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('teleradiologi_auth_user')
      return saved ? (JSON.parse(saved) as AuthUser) : null
    } catch {
      return null
    }
  })

  const login = (password: string, username = ''): LoginResult => {
    const p = password.trim().toLowerCase()
    if (p.includes('faskes')) {
      const user: AuthUser = {
        role: 'faskes',
        name: 'Faskes 3T',
        username: username.trim() || 'faskes_user',
      }
      setCurrentUser(user)
      localStorage.setItem('teleradiologi_auth_user', JSON.stringify(user))
      addToast('Berhasil masuk sebagai Tim Faskes 3T.', 'success')
      return { success: true, role: 'faskes' }
    }
    if (p.includes('radiolog') || p.includes('dokter') || p.includes('shinyu')) {
      const user: AuthUser = {
        role: 'radiolog',
        name: 'Dr. Shinyu Sp.Rad',
        username: username.trim() || 'dr.shinyu',
      }
      setCurrentUser(user)
      localStorage.setItem('teleradiologi_auth_user', JSON.stringify(user))
      addToast('Berhasil masuk sebagai Dokter Radiologi (Dr. Shinyu).', 'success')
      return { success: true, role: 'radiolog' }
    }
    return {
      success: false,
      error: 'Kata sandi tidak dikenali. Gunakan sandi "faskes123" untuk Portal Faskes atau "radiolog123" untuk Portal Dokter Radiologi.',
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('teleradiologi_auth_user')
    addToast('Anda telah keluar dari sistem.', 'info')
  }

  useEffect(() => {
    localStorage.setItem('teleradiologi_cases', JSON.stringify(cases))
  }, [cases])

  useEffect(() => {
    localStorage.setItem('teleradiologi_drafts', JSON.stringify(drafts))
  }, [drafts])

  const addToast = (text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    // Always keep only 1 active toast at any time
    setToasts([{ id, text, type }])
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

    setCurrentCase((prev: PatientRecord) => ({
      ...(prev.nama ? prev : initialPatient),
      id: caseId,
      radiologist: doctorName,
      status: 'proses',
    }))

    addToast(`Pasien dengan nomor ${caseId} berhasil diassign ke ${doctorName}`, 'success')
  }

  const autoAssignDoctor = (caseId: string): string => {
    const sorted = [...doctors].sort((a, b) => a.jumlahKasus - b.jumlahKasus)
    const assigned = sorted[0]?.nama || 'Dr. Bernard Bear'
    assignDoctorToCase(caseId, assigned)
    return assigned
  }

  const verifyCase = (
    caseId: string,
    result: string,
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
        currentUser,
        login,
        logout,
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
