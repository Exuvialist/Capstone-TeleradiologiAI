import { Fragment, type ReactNode } from "react";
import SearchField from "@/components/SearchField";
import { SidebarButton } from "@/components/Sidebar";

// Top bar (Figma 228:780) + the centered 1100px content area.
// max-w-[1140px] with px-5 = 1100px of content, matching the 1440px frames.
// <main> is a container: pages switch layouts by its width (@4xl: etc.), so the sidebar's width counts.
export default function PageShell({ crumbs, children }: { crumbs: string[]; children?: ReactNode }) {
  return (
    <>
      <header className="h-16 border-b border-neutral-300 print:hidden">
        <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between gap-3 pt-px pr-3.5 pl-5">
          {/* Below 1024px: button that opens the sidebar drawer */}
          <SidebarButton />
          <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 flex-wrap gap-x-2 text-b4">
            {crumbs.map((crumb, i) => (
              <Fragment key={i}>
                {i > 0 && <span>/</span>}
                <span>{crumb}</span>
              </Fragment>
            ))}
          </nav>
          {/* Search does nothing yet. Hidden below 768px to leave room for the breadcrumb */}
          <div className="hidden md:block">
            <SearchField aria-label="Cari" />
          </div>
        </div>
      </header>
      <main className="@container mx-auto max-w-[1140px] p-5 print:p-0">{children}</main>
    </>
  );
}
