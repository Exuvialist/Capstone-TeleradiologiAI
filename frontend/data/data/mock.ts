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
  type: string; // examTypes slug
  aiPositive: boolean; // AI says the disease is present
  aiScore: number; // AI confidence in %
  radiologist: string;
  submittedAt: string; // YYYY-MM-DD
  verifiedAt: string | null; // null = not verified yet ("Dalam Antrean")
  verdictPositive: boolean | null; // radiologist's result, null until verified
};

const names = ["Gracella Uhuy", "Nabila Putri", "Raka Pratama", "Siti Aminah", "Budi Santoso", "Dewi Lestari", "Andi Wijaya", "Rina Marlina", "Agus Setiawan", "Putri Ayu", "Joko Susilo", "Maya Sari", "Fajar Nugroho"];
const radiologists = ["Dr. Tama", "Dr. Nadia", "Dr. Arif", "Dr. Bernard Bear", "Dr. Shinyu"];
const day = (d: number) => `2026-10-${String(d).padStart(2, "0")}`;

// 25 exams per type: the first 12 are still in the queue, the other 13 are verified.
export const exams: Exam[] = examTypes.flatMap((type, t) =>
  Array.from({ length: 25 }, (_, i) => {
    const n = t * 25 + i;
    const verified = i >= 12;
    return {
      id: `${type.prefix}-${String(123 + i).padStart(4, "0")}`,
      medicalRecordNo: `RM-${10123 + n}`,
      patientName: names[n % names.length],
      type: type.slug,
      aiPositive: n % 3 !== 1,
      aiScore: 85 + ((n * 5) % 14),
      radiologist: radiologists[n % radiologists.length],
      submittedAt: day(19 - (i % 15)),
      verifiedAt: verified ? day(20 - (i % 15)) : null,
      verdictPositive: verified ? n % 4 !== 0 : null,
    };
  }),
);
