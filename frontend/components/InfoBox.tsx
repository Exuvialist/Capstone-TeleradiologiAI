import type { ReactNode } from "react";

// Read-only summary box (Status, Hasil Analisis AI, …) from Desktop-6/-11/-14/-15.
export function InfoBox({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1 rounded-md border border-neutral-300 bg-neutral-200/30 p-2">{children}</div>;
}

export function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-b4 font-bold">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}
