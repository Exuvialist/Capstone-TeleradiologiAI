import { Fragment, type ReactNode } from "react";
import SearchField from "@/components/SearchField";

// Top bar (Figma 228:780) + the centered 1100px content area.
// max-w-[1140px] with px-5 = 1100px of content, matching the 1440px frames.
export default function PageShell({ crumbs, children }: { crumbs: string[]; children?: ReactNode }) {
  return (
    <>
      <header className="h-16 border-b border-neutral-300">
        <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between pt-px pr-3.5 pl-5">
          <nav aria-label="Breadcrumb" className="flex gap-2 text-b4">
            {crumbs.map((crumb, i) => (
              <Fragment key={i}>
                {i > 0 && <span>/</span>}
                <span>{crumb}</span>
              </Fragment>
            ))}
          </nav>
          {/* Search does nothing yet */}
          <SearchField aria-label="Cari" />
        </div>
      </header>
      <main className="mx-auto max-w-[1140px] p-5">{children}</main>
    </>
  );
}
