// Dummy data. Your backend friend replaces this with API calls later.

export const examTypes = [
  { slug: "pneumonia", label: "Pneumonia", prefix: "PN", color: "bg-quaternary-600" },
  { slug: "kanker-tulang", label: "Kanker Tulang", prefix: "KT", color: "bg-primary-600" },
  { slug: "tumor-otak", label: "Tumor Otak", prefix: "TO", color: "bg-tertiary-600" },
];

export type ExamType = (typeof examTypes)[number];

export type Exam = {
  id: string; // exam ID created by the backend, e.g. "PN-0123" (URL + breadcrumb)
  medicalRecordNo: string; // the patient's own number typed by the faskes ("ID Rekam Medis")
  patientName: string;
  faskes: string; // "Asal Faskes": the faskes account that sent it (the backend takes it from the login)
  type: string; // examTypes slug
  aiPositive: boolean; // AI says the disease is present
  aiScore: number; // AI confidence in %
  radiologist: string | null; // null = no named radiologist yet
  autoAssigned: boolean; // shared out automatically by the backend (Desktop-6)
  submittedAt: string; // YYYY-MM-DD
  verifiedAt: string | null; // null = not verified yet ("Dalam Antrean")
  verdictPositive: boolean | null; // radiologist's result, null until verified
  note: string | null; // radiologist's "Catatan", once verified
  birthDate: string; // YYYY-MM-DD
  gender: "Laki-Laki" | "Perempuan";
  symptoms: string; // "Gejala Klinis"
  images: string[]; // "Hasil Deteksi" images
};

// Doctors for Manual Assignment (Desktop-11)
export const radiologists = [
  { name: "Dr. Tama", experience: 2, pending: 10 },
  { name: "Dr. Nadia", experience: 5, pending: 4 },
  { name: "Dr. Arif", experience: 8, pending: 7 },
  { name: "Dr. Bernard Bear", experience: 3, pending: 2 },
  { name: "Dr. Shinyu", experience: 6, pending: 12 },
  { name: "Dr. Larasati", experience: 1, pending: 0 },
  { name: "Dr. Hendra", experience: 10, pending: 9 },
  { name: "Dr. Kirana", experience: 4, pending: 5 },
  { name: "Dr. Yusuf", experience: 7, pending: 3 },
];

const names = ["Gracella Uhuy", "Nabila Putri", "Raka Pratama", "Siti Aminah", "Budi Santoso", "Dewi Lestari", "Andi Wijaya", "Rina Marlina", "Agus Setiawan", "Putri Ayu", "Joko Susilo", "Maya Sari", "Fajar Nugroho"];
const symptoms =
  "Pasien datang dengan keluhan sesak napas yang meningkat sejak [X] hari, disertai batuk berdahak kental dan demam naik-turun. Pada pemeriksaan fisik dada, ditemukan fremitus taktil meningkat pada lapang paru [kanan/kiri] serta suara ronkhi wet basah. SpO2: [X]%.";
const note = "Pasien datang dengan keluhan sesak napas yang meningkat sejak [X] hari, disertai batuk berdahak kental dan demam naik-turun.";
const day = (d: number) => `2026-10-${String(d).padStart(2, "0")}`;

// 25 exams per type. Queued: 0–2 AI result only (Desktop-4), 3–5 auto-assigned (Desktop-6),
// 6–11 assigned to a radiologist (Desktop-15). 12–24 verified (Desktop-14).
export const exams: Exam[] = examTypes.flatMap((type, t) =>
  Array.from({ length: 25 }, (_, i) => {
    const n = t * 25 + i;
    const verified = i >= 12;
    const daysBefore19 = ((n * 37) % 101) % 15; // 0–14, uneven so the chart bars differ
    return {
      id: `${type.prefix}-${String(123 + i).padStart(4, "0")}`,
      medicalRecordNo: `RM-${10123 + n}`,
      patientName: names[n % names.length],
      faskes: "Faskes 3T", // the only faskes account for now
      type: type.slug,
      aiPositive: n % 3 !== 1,
      aiScore: 85 + ((n * 5) % 14),
      radiologist: i < 6 ? null : radiologists[n % 5].name,
      autoAssigned: i >= 3 && i < 6,
      submittedAt: day(19 - daysBefore19),
      verifiedAt: verified ? day(20 - daysBefore19) : null,
      verdictPositive: verified ? n % 4 !== 0 : null,
      note: verified ? note : null,
      birthDate: `${1960 + (n % 45)}-${String((n % 12) + 1).padStart(2, "0")}-${String((n % 28) + 1).padStart(2, "0")}`,
      gender: n % 2 ? "Laki-Laki" : "Perempuan",
      symptoms,
      images: ["/sample/xray.jpg"], // put a sample image at frontend/public/sample/xray.jpg
    } satisfies Exam;
  }),
);

// The logged-in radiologist (no login yet) and their cases: the ones assigned to them plus the automatic assignments (Desktop-6).
export const radiologist = "Dr. Shinyu";
export const radiologistExams = exams.filter((e) => e.radiologist === radiologist || e.autoAssigned);
