import type { ReactNode } from "react";

// Login and Daftar pages. No Figma frame: a centered card made from the design system (sidebar logo, fields, Neutral button).
export default function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="flex w-full max-w-[400px] flex-col gap-5 rounded-lg border border-neutral-300 p-5">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="flex size-9 items-center justify-center rounded-md bg-neutral-800 text-neutral-100">T</span>
          Teleradiologi AI
        </div>
        <h1 className="text-b1 font-bold">{title}</h1>
        {children}
      </div>
    </main>
  );
}
