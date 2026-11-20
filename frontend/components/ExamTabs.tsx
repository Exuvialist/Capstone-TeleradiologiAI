import { Airplay, CheckSquare, Clipboard, Loader } from "react-feather";
import Button from "@/components/Button";
import type { ExamType } from "@/data/mock";

// Figma Desktop-2 124:10896: exam title, tabs, "Drafts Pemeriksaan" and the divider.
const tabs = [
  { slug: "statistika", label: "Statistika", icon: Airplay },
  { slug: "buat", label: "Buat Pemeriksaan", icon: Clipboard },
  { slug: "dalam-proses", label: "Dalam Proses", icon: Loader },
  { slug: "terverifikasi", label: "Terverifikasi", icon: CheckSquare },
];

export default function ExamTabs({ exam, active }: { exam: ExamType; active: string }) {
  return (
    <div className="mb-[11px]">
      <h1 className="flex h-[27px] items-center gap-2.5 text-b1 font-bold">
        <span className={`size-5 rounded-sm ${exam.color}`} />
        {exam.label}
      </h1>
      {/* One row; on narrow screens it scrolls sideways (swipe) */}
      <div className="mt-2.5 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex shrink-0 gap-2">
          {tabs.map(({ slug, label, icon: Icon }) => (
            <Button key={slug} variant={slug === active ? "neutral" : "outline"} href={`/faskes/pemeriksaan/${exam.slug}/${slug}`}>
              <Icon />
              {label}
            </Button>
          ))}
        </div>
        {/* Does nothing for now */}
        <Button variant="outline" className="shrink-0">
          Drafts Pemeriksaan
        </Button>
      </div>
      <hr className="mt-5 border-neutral-300" />
    </div>
  );
}
