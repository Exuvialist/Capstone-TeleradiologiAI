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
  startAnalysis: (customAiResult?: PatientRecord['aiResult']) => Promise<PatientRecord>
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

export const CORE_QUEUE_CASES: PatientRecord[] = [
  {
    id: '#PN-0123',
    nama: 'Gracella Uhuy',
    dd: '01',
    mm: 'Mei',
    yyyy: '2000',
    gender: 'P',
    gejala:
      'Pasien datang dengan keluhan sesak napas yang meningkat sejak [X] hari, disertai batuk berdahak kental dan demam naik-turun. Pada pemeriksaan fisik dada, ditemukan fremitus taktil meningkat pada lapang paru [kanan/kiri] serta suara ronkhi wet basah. SpO2: [X]%.',
    files: [{ name: 'scan-pn-0123.jpeg', size: '134.KB', url: '/sample-xray.jpeg' }],
    aiResult: {
      diagnosis: 'Pneumonia',
      confidence: 90,
      finding: 'Infiltrasi bercak opasitas pada lobus bawah paru kanan konsisten dengan gambaran pneumonia bakterial.',
    },
    status: 'menunggu',
    createdAt: '2026-10-19',
    faskes: 'Faskes Shinyu',
  },
  {
    id: '#KT-0124',
    nama: 'Nabila Putri',
    dd: '18',
    mm: 'Okt',
    yyyy: '2002',
    gender: 'P',
    gejala:
      'Pasien mengeluh nyeri tulang tumpul pada tungkai bawah kanan yang memberat di malam hari, teraba massa/pembengkakan lokal sejak 3 minggu terakhir.',
    files: [{ name: 'scan-kt-0124.jpeg', size: '134.KB', url: '/sample-xray.jpeg' }],
    aiResult: {
      diagnosis: 'Kanker Tulang',
      confidence: 87,
      finding: 'Lesi osteolitik metafisis distal femur disertai reaksi periosteal sunburst.',
    },
    status: 'menunggu',
    createdAt: '2026-10-19',
    faskes: 'Faskes Dohoon',
  },
  {
    id: '#TO-0125',
    nama: 'Raka Pratama',
    dd: '17',
    mm: 'Okt',
    yyyy: '1997',
    gender: 'L',
    gejala:
      'Nyeri kepala hebat kronis memberat di pagi hari, disertai muntah proyektil, penurunan tajam penglihatan, dan defisit neurologis fokal.',
    files: [{ name: 'scan-to-0125.jpeg', size: '134.KB', url: '/sample-xray.jpeg' }],
    aiResult: {
      diagnosis: 'Tumor Otak',
      confidence: 94,
      finding: 'Massa ekstra-aksial lobus frontoparietal berbatas tegas dengan perifocal edema.',
    },
    status: 'menunggu',
    createdAt: '2026-10-18',
    faskes: 'Faskes Youngjae',
  },
  {
    id: '#PN-0126',
    nama: 'Dewi Lestari',
    dd: '15',
    mm: 'Mei',
    yyyy: '1995',
    gender: 'P',
    gejala:
      'Pemeriksaan radiologi rutin skrining kesehatan toraks. Tidak ada sesak napas maupun demam, SpO2 normal 99%.',
    files: [{ name: 'scan-pn-0126.jpeg', size: '134.KB', url: '/sample-xray.jpeg' }],
    aiResult: {
      diagnosis: 'Bukan Pneumonia',
      confidence: 93,
      finding:
        'Corakan bronkovaskular dalam batas normal. Tidak tampak infiltrat, konsolidasi pneumonik, maupun efusi pleura. Cor dan pulmo normal (Bukan Pneumonia).',
    },
    status: 'menunggu',
    createdAt: '2026-10-18',
    faskes: 'Faskes Hanjin',
  },
  {
    id: '#TO-0127',
    nama: 'Dimas Anggara',
    dd: '22',
    mm: 'Jun',
    yyyy: '1992',
    gender: 'L',
    gejala:
      'Riwayat kejang fokal berulang pada lengan kanan, nyeri kepala frontal progresif, papiledema bilateral.',
    files: [{ name: 'scan-to-0127.jpeg', size: '134.KB', url: '/sample-xray.jpeg' }],
    aiResult: {
      diagnosis: 'Tumor Otak',
      confidence: 89,
      finding: 'Lesi massa intra-aksial regio parasagital dengan perifocal edema ringan.',
    },
    status: 'menunggu',
    createdAt: '2026-10-17',
    faskes: 'Faskes Jihoon',
  },
  {
    id: '#KT-0128',
    nama: 'Irfan Saputra',
    dd: '09',
    mm: 'Sep',
    yyyy: '2001',
    gender: 'L',
    gejala:
      'Pembengkakan progresif di area distal femur kiri disertai rasa ngilu berdenyut terutama saat istirahat malam.',
    files: [{ name: 'scan-kt-0128.jpeg', size: '134.KB', url: '/sample-xray.jpeg' }],
    aiResult: {
      diagnosis: 'Kanker Tulang',
      confidence: 95,
      finding: 'Lesi litik agresif dengan elevasi periosteum segitiga Codman.',
    },
    status: 'menunggu',
    createdAt: '2026-10-17',
    faskes: 'Faskes Kyungmin',
  },
  {
    id: '#PN-0129',
    nama: 'Budi Santoso',
    dd: '11',
    mm: 'Agu',
    yyyy: '1988',
    gender: 'L',
    gejala:
      'Medical check-up tahunan karyawan faskes, tidak memiliki riwayat sesak atau batuk kronis, respirasi 18x/menit reguler.',
    files: [{ name: 'scan-pn-0129.jpeg', size: '134.KB', url: '/sample-xray.jpeg' }],
    aiResult: {
      diagnosis: 'Bukan Pneumonia',
      confidence: 95,
      finding:
        'Jantung dan paru dalam batas normal, sinus kostofrenikus lancar tajam, tidak ada tanda pneumonia aktif.',
    },
    status: 'menunggu',
    createdAt: '2026-10-16',
    faskes: 'Faskes Shinyu',
  },
  {
    id: '#KT-0130',
    nama: 'Ratna Sari',
    dd: '25',
    mm: 'Nov',
    yyyy: '1999',
    gender: 'P',
    gejala:
      'Nyeri regio proksimal tibia pasca trauma ringan yang tidak kunjung sembuh, nyeri tekan lokal positif.',
    files: [{ name: 'scan-kt-0130.jpeg', size: '134.KB', url: '/sample-xray.jpeg' }],
    aiResult: {
      diagnosis: 'Kanker Tulang',
      confidence: 91,
      finding: 'Gambaran destruksi korteks dengan reaksi periosteal lamellar pada proksimal tibia kanan.',
    },
    status: 'menunggu',
    createdAt: '2026-10-16',
    faskes: 'Faskes Dohoon',
  },
  {
    id: '#TO-0131',
    nama: 'Farhan Anwar',
    dd: '03',
    mm: 'Feb',
    yyyy: '1994',
    gender: 'L',
    gejala:
      'Keluhan pandangan ganda (diplopia), gangguan keseimbangan saat berjalan, pusing berputar kronis.',
    files: [{ name: 'scan-to-0131.jpeg', size: '134.KB', url: '/sample-xray.jpeg' }],
    aiResult: {
      diagnosis: 'Tumor Otak',
      confidence: 93,
      finding: 'Massa fosa posterior cerebelopontine angle berbatas tegas.',
    },
    status: 'menunggu',
    createdAt: '2026-10-15',
    faskes: 'Faskes Youngjae',
  },
  {
    id: '#PN-0132',
    nama: 'Ahmad Hakim',
    dd: '14',
    mm: 'Jul',
    yyyy: '1985',
    gender: 'L',
    gejala:
      'Demam tinggi mendadak (39°C) menggigil disertai batuk produktif purulen dan nyeri dada pleuritik kanan.',
    files: [{ name: 'scan-pn-0132.jpeg', size: '134.KB', url: '/sample-xray.jpeg' }],
    aiResult: {
      diagnosis: 'Pneumonia',
      confidence: 96,
      finding: 'Opasitas konsolidasi homogen dengan air bronchogram pada lobus inferior pulmo dextra.',
    },
    status: 'menunggu',
    createdAt: '2026-10-15',
    faskes: 'Faskes Hanjin',
  },
  {
    id: '#KT-0120',
    nama: 'Nabila Putri',
    dd: '01',
    mm: 'Mei',
    yyyy: '2000',
    gender: 'P',
    gejala: 'Nyeri tulang tumpul memberat malam hari.',
    files: [{ name: 'scan-kt-0120.jpeg', size: '134.KB', url: '/sample-xray.jpeg' }],
    aiResult: {
      diagnosis: 'Kanker Tulang',
      confidence: 90,
      finding: 'Lesi osteolitik metafisis distal femur disertai reaksi periosteal (Kanker Tulang).',
    },
    status: 'menunggu',
    createdAt: '2026-10-19',
    faskes: 'Faskes Shinyu',
  },
  {
    id: '#PN-DRAFT-01',
    nama: 'Draft Pasien Rawat Jalan',
    dd: '12',
    mm: 'Agu',
    yyyy: '1998',
    gender: 'L',
    gejala: 'Keluhan batuk berdahak 4 hari, riwayat asma.',
    files: [{ name: 'draft-scan-01.jpeg', size: '110.KB', url: '/sample-xray.jpeg' }],
    aiResult: {
      diagnosis: 'Pneumonia',
      confidence: 90,
      finding: 'Corakan bronkovaskular meningkat pada kedua lapang paru.',
    },
    status: 'menunggu',
    createdAt: '2026-10-20',
    faskes: 'Faskes Shinyu',
  },
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

  // Ensure all core queue cases are present and accurate
  CORE_QUEUE_CASES.forEach((core) => {
    const idx = result.findIndex((r) => r.id.toLowerCase() === core.id.toLowerCase())
    if (idx >= 0) {
      result[idx] = core
    } else {
      result.unshift(core)
    }
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
      let list: PatientRecord[] = []
      if (saved) {
        const parsed = JSON.parse(saved) as PatientRecord[]
        if (Array.isArray(parsed) && parsed.length >= 20) {
          list = parsed
        }
      }
      if (list.length === 0) {
        list = initialCases
      }

      // Automatic data sanitization & synchronization
      const sanitized: PatientRecord[] = list.map((c): PatientRecord => {
        const coreMatch = CORE_QUEUE_CASES.find((cq) => cq.id.toLowerCase() === c.id.toLowerCase())
        if (coreMatch) {
          return {
            ...coreMatch,
            status: c.status || coreMatch.status,
            verificationResult: c.verificationResult || coreMatch.verificationResult,
            verificationNotes: c.verificationNotes || coreMatch.verificationNotes,
            verificationDate: c.verificationDate || coreMatch.verificationDate,
            radiologist: c.radiologist || coreMatch.radiologist,
          }
        }

        // For all other cases, enforce disease prefix integrity
        const isBone = c.id.startsWith('#KT-')
        const isBrain = c.id.startsWith('#TO-')
        let diag = c.aiResult?.diagnosis || (isBone ? 'Kanker Tulang' : isBrain ? 'Tumor Otak' : 'Pneumonia')
        let finding = c.aiResult?.finding || ''

        if (isBone && diag.includes('Pneumonia')) {
          diag = diag.includes('Bukan') ? 'Bukan Kanker Tulang' : 'Kanker Tulang'
          finding = 'Lesi osteolitik metafisis distal femur disertai reaksi periosteal (Kanker Tulang).'
        } else if (isBrain && diag.includes('Pneumonia')) {
          diag = diag.includes('Bukan') ? 'Bukan Tumor Otak' : 'Tumor Otak'
          finding = 'Massa ekstra-aksial lobus frontoparietal berbatas tegas dengan perifocal edema.'
        }

        return {
          ...c,
          aiResult: {
            diagnosis: diag,
            confidence: c.aiResult?.confidence || 90,
            finding: finding || c.aiResult?.finding || 'Evaluasi radiologis komprehensif.',
          },
        }
      })

      // Ensure all CORE_QUEUE_CASES exist in sanitized list
      CORE_QUEUE_CASES.forEach((coreCase) => {
        const exists = sanitized.some((c) => c.id.toLowerCase() === coreCase.id.toLowerCase())
        if (!exists) {
          sanitized.unshift(coreCase)
        }
      })

      localStorage.setItem('teleradiologi_cases', JSON.stringify(sanitized))
      return sanitized
    } catch {
      return initialCases
    }
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

  const startAnalysis = async (customAiResult?: PatientRecord['aiResult']): Promise<PatientRecord> => {
    const isBone =
      currentCase.id.startsWith('#KT-') ||
      Boolean(
        currentCase.gejala &&
          (currentCase.gejala.toLowerCase().includes('tulang') ||
            currentCase.gejala.toLowerCase().includes('osteolitik') ||
            currentCase.gejala.toLowerCase().includes('femur') ||
            currentCase.gejala.toLowerCase().includes('tibia'))
      )
    const isBrain =
      currentCase.id.startsWith('#TO-') ||
      Boolean(
        currentCase.gejala &&
          (currentCase.gejala.toLowerCase().includes('otak') ||
            currentCase.gejala.toLowerCase().includes('kepala') ||
            currentCase.gejala.toLowerCase().includes('kejang') ||
            currentCase.gejala.toLowerCase().includes('neurologis'))
      )
    const isNeg =
      currentCase.id === '#PN-0888' ||
      Boolean(
        currentCase.aiResult?.diagnosis?.toLowerCase().includes('bukan') ||
          currentCase.gejala?.toLowerCase().includes('skrining') ||
          currentCase.gejala?.toLowerCase().includes('normal')
      )

    let computedAi: { diagnosis: string; confidence: number; finding: string }
    if (customAiResult) {
      computedAi = customAiResult
    } else if (isBone) {
      computedAi = {
        diagnosis: isNeg ? 'Bukan Kanker Tulang' : 'Kanker Tulang',
        confidence: currentCase.aiResult?.confidence || 90,
        finding: isNeg
          ? 'Struktur korteks dan trabekula tulang intak. Tidak tampak lesi litik maupun reaksi periosteal (Bukan Kanker Tulang).'
          : 'Lesi osteolitik metafisis distal femur disertai reaksi periosteal (Kanker Tulang).',
      }
    } else if (isBrain) {
      computedAi = {
        diagnosis: isNeg ? 'Bukan Tumor Otak' : 'Tumor Otak',
        confidence: currentCase.aiResult?.confidence || 94,
        finding: isNeg
          ? 'Struktur parenkim serebri dan ventrikel dalam batas normal. Tidak tampak massa intra maupun ekstra aksial (Bukan Tumor Otak).'
          : 'Massa ekstra-aksial lobus frontoparietal berbatas tegas dengan perifocal edema.',
      }
    } else if (isNeg) {
      computedAi = {
        diagnosis: 'Bukan Pneumonia',
        confidence: currentCase.aiResult?.confidence || 93,
        finding:
          'Corakan bronkovaskular dalam batas normal. Tidak tampak infiltrat, konsolidasi pneumonik, maupun efusi pleura. Cor dan pulmo normal (Bukan Pneumonia).',
      }
    } else {
      computedAi = {
        diagnosis: 'Pneumonia',
        confidence: currentCase.aiResult?.confidence || 90,
        finding: 'Infiltrasi bercak opasitas pada lobus bawah paru kanan konsisten dengan gambaran pneumonia bakterial.',
      }
    }

    const defaultPrefix = isBone ? 'KT' : isBrain ? 'TO' : 'PN'
    const fallbackId = `#${defaultPrefix}-0${Math.floor(130 + Math.random() * 800)}`

    const prepared: PatientRecord = {
      ...currentCase,
      id: currentCase.id || fallbackId,
      nama: currentCase.nama || (isBone ? 'Nabila Putri' : isBrain ? 'Raka Pratama' : 'Gracella Uhuy'),
      dd: currentCase.dd || '01',
      mm: currentCase.mm || 'Mei',
      yyyy: currentCase.yyyy || '2000',
      gender: currentCase.gender || (isBone ? 'P' : isBrain ? 'L' : 'P'),
      gejala:
        currentCase.gejala ||
        (isBone
          ? 'Nyeri tulang tumpul memberat malam hari.'
          : isBrain
          ? 'Nyeri kepala hebat kronis memberat di pagi hari, muntah proyektil, defisit neurologis fokal.'
          : 'Pasien datang dengan keluhan sesak napas yang meningkat sejak [X] hari, disertai batuk berdahak kental dan demam naik-turun. Pada pemeriksaan fisik dada, ditemukan fremitus taktil meningkat pada lapang paru [kanan/kiri] serta suara ronkhi wet basah. SpO2: [X]%.'),
      files:
        currentCase.files.length > 0
          ? currentCase.files
          : [
              { name: 'untitled-attachment01.jpeg', size: '128.KB', url: '/sample-xray.jpeg' },
              { name: 'untitled-attachment02.jpeg', size: '128.KB', url: '/sample-xray.jpeg' },
            ],
      status: 'menunggu',
      aiResult: computedAi,
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
