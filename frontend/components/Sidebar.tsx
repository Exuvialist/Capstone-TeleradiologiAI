"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Home, Layout, Loader, LogIn, Package } from "react-feather";
import { logout } from "@/app/login/actions";
import Button from "@/components/Button";
import { examTypes } from "@/data/mock";

// Figma: sidebar 249:1048 (Faskes 3T, footer menu open) and 228:784 (Dokter Radiologi).
// The footer menu only has Log Out; the role switch from Desktop-32 was removed once login existed.
const roles = {
  faskes: {
    name: "Faskes 3T",
    initial: "F",
    links: [
      { href: "/faskes/dashboard", label: "Dashboard", icon: Home },
      { href: "/faskes/riwayat", label: "Riwayat", icon: Package },
    ],
  },
  radiologi: {
    name: "Dr. Shinyu",
    initial: "S",
    links: [
      { href: "/radiologi/dashboard", label: "Dashboard", icon: Home },
      { href: "/radiologi/antrean", label: "Antrean Verifikasi", icon: Loader },
      { href: "/radiologi/riwayat", label: "Riwayat", icon: Package },
    ],
  },
};

const tile = "flex shrink-0 items-center justify-center rounded-md bg-neutral-800 font-bold text-neutral-100";
const menuItem = "flex w-full cursor-pointer items-center gap-2.5 rounded-md p-2 hover:bg-primary-200 [&_svg]:size-5";

// Below 1024px the sidebar is a drawer, opened by the layout button in the top bar (SidebarButton).
const DrawerContext = createContext<{ open: boolean; setOpen: (open: boolean) => void }>({ open: false, setOpen: () => {} });

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <DrawerContext value={{ open, setOpen }}>{children}</DrawerContext>;
}

export function SidebarButton() {
  const { setOpen } = useContext(DrawerContext);
  return (
    <Button variant="outline" aria-label="Buka sidebar" onClick={() => setOpen(true)} className="lg:hidden">
      <Layout />
    </Button>
  );
}

export default function Sidebar({ role }: { role: keyof typeof roles }) {
  const pathname = usePathname();
  const { open, setOpen } = useContext(DrawerContext);
  const [rail, setRail] = useState(false);
  const collapsed = rail && !open; // the drawer is always full width
  const [groupOpen, setGroupOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { name, initial, links } = roles[role];

  const navLink = ({ href, label, icon: Icon }: (typeof links)[number]) => (
    <Button
      key={href}
      variant="white"
      href={href}
      selected={pathname.startsWith(href)}
      aria-label={collapsed ? label : undefined}
      className={collapsed ? "" : "w-full"}
    >
      <Icon />
      {!collapsed && label}
    </Button>
  );

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-neutral-1000/30 lg:hidden" onClick={() => setOpen(false)} />}
      {/* Drawer below 1024px (closes when a link is clicked), fixed column from 1024px */}
      <aside
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
        className={`fixed inset-y-0 left-0 z-30 flex h-screen shrink-0 flex-col border-r border-neutral-300 bg-neutral-100 transition-transform lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${open ? "" : "-translate-x-full"} ${collapsed ? "w-[60px]" : "w-[300px]"}`}
      >
        {/* pr-[11px] + 1px border = Figma's 12px */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-neutral-300 pt-px pr-[11px] pl-3 ${collapsed ? "justify-center" : "justify-between"}`}
        >
          {!collapsed && (
            <div className="flex items-center gap-1.5 font-bold">
              <span className={`${tile} size-9`}>T</span>
              Teleradiologi AI
            </div>
          )}
          <Button
            variant="outline"
            aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
            onClick={() => (open ? setOpen(false) : setRail(!rail))}
          >
            <Layout />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto pt-3.5 pr-[11px] pl-3">
          {navLink(links[0])}

          {role === "faskes" && (
            <div className={`flex flex-col gap-1 ${collapsed ? "" : "pl-2"}`}>
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => setGroupOpen(!groupOpen)}
                  aria-expanded={groupOpen}
                  className="flex cursor-pointer items-center gap-1.5 text-b4 font-bold"
                >
                  Detail Pemeriksaan
                  <ChevronDown className={`size-[18px] ${groupOpen ? "" : "-rotate-90"}`} />
                </button>
              )}
              {(groupOpen || collapsed) &&
                examTypes.map((exam) => (
                  <Button
                    key={exam.slug}
                    variant="white"
                    href={`/faskes/pemeriksaan/${exam.slug}/statistika`}
                    selected={pathname.startsWith(`/faskes/pemeriksaan/${exam.slug}`)}
                    aria-label={collapsed ? exam.label : undefined}
                    className={collapsed ? "" : "w-full gap-1.5! px-[9px]"}
                  >
                    <span className={`size-5 shrink-0 rounded-sm ${exam.color}`} />
                    {!collapsed && exam.label}
                  </Button>
                ))}
            </div>
          )}

          {links.slice(1).map(navLink)}
        </nav>

        <div className="relative flex h-14 shrink-0 items-center border-t border-neutral-300 px-2 pb-0.5">
          {menuOpen && (
            <div className="absolute bottom-[calc(100%-1px)] left-2 z-10 flex w-[276px] flex-col gap-1 rounded-sm border border-primary-200 bg-primary-100 p-1">
              <form action={logout}>
                <button type="submit" className={`${menuItem} text-red-200`}>
                  <LogIn />
                  Log Out
                </button>
              </form>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={collapsed ? name : undefined}
            className={`flex cursor-pointer items-center gap-1.5 rounded-sm border p-[3px] ${menuOpen ? "border-primary-200 bg-primary-100" : "border-transparent"}`}
          >
            <span className={`${tile} size-8`}>{initial}</span>
            {!collapsed && (
              <>
                {name}
                <ChevronUp className="size-5" />
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
