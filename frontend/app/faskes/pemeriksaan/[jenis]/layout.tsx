import { examTypes } from "@/data/mock";

// Pre-builds the three exam types (needed with Cache Components).
// The title + tabs get added here in Phase 4.
export function generateStaticParams() {
  return examTypes.map((exam) => ({ jenis: exam.slug }));
}

export default function JenisLayout({ children }: LayoutProps<"/faskes/pemeriksaan/[jenis]">) {
  return children;
}
