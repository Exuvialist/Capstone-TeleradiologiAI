export type Patient = {
  id: string
  nama: string
  dd: string
  mm: string
  yyyy: string
  gender: 'L' | 'P' | null
  gejala?: string
}

export interface PatientRecord {
  id: string
  nama: string
  dd: string
  mm: string
  yyyy: string
  gender: 'L' | 'P' | null
  gejala: string
  files: Array<{ name: string; size: string; url?: string }>
  aiResult?: {
    diagnosis: string
    confidence: number
    finding: string
  }
  radiologist?: string
  verificationDate?: string
  verificationResult?: 'Bukan Pneumonia' | 'Pneumonia Terkonfirmasi' | 'Perlu Pemeriksaan Ulang'
  verificationNotes?: string
  status: 'draft' | 'menunggu' | 'proses' | 'terverifikasi'
  createdAt: string
}

export interface Doctor {
  id: string
  nama: string
  pengalaman: string
  jumlahKasus: number
  spesialisasi: string
}

export const samplePatient: Patient = {
  id: '#PN-0123',
  nama: 'Gracella Uhuy',
  dd: '01',
  mm: 'Mei',
  yyyy: '2000',
  gender: 'P',
  gejala:
    'Pasien datang dengan keluhan sesak napas yang meningkat sejak [X] hari, disertai batuk berdahak kental dan demam naik-turun. Pada pemeriksaan fisik dada, ditemukan fremitus taktil meningkat pada lapang paru [kanan/kiri] serta suara ronkhi wet basah. SpO2: [X]%.',
}

export const initialPatient: PatientRecord = {
  id: '#PN-0123',
  nama: 'Gracella Uhuy',
  dd: '01',
  mm: 'Mei',
  yyyy: '2000',
  gender: 'P',
  gejala:
    'Pasien datang dengan keluhan sesak napas yang meningkat sejak [X] hari, disertai batuk berdahak kental dan demam naik-turun. Pada pemeriksaan fisik dada, ditemukan fremitus taktil meningkat pada lapang paru [kanan/kiri] serta suara ronkhi wet basah. SpO2: [X]%.',
  files: [
    { name: 'untitled-attachment01.jpeg', size: '128.KB', url: '/sample-xray.jpeg' },
    { name: 'untitled-attachment02.jpeg', size: '128.KB', url: '/sample-xray.jpeg' },
  ],
  aiResult: {
    diagnosis: 'Pneumonia',
    confidence: 90,
    finding: 'Infiltrasi bercak opasitas pada lobus bawah paru kanan konsisten dengan gambaran pneumonia bakterial.',
  },
  radiologist: 'Dr. Bernard Bear',
  verificationDate: '10/10/2026',
  verificationResult: 'Bukan Pneumonia',
  verificationNotes:
    'Pasien datang dengan keluhan sesak napas yang meningkat sejak [X] hari, disertai batuk berdahak kental dan demam naik-turun. Opasitas lebih mengarah pada atelektasis ringan.',
  status: 'terverifikasi',
  createdAt: '2026-10-10',
}
