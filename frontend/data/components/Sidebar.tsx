"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronUp, Home, Layout, Loader, LogIn, Package, User } from "react-feather";
import Button from "@/components/Button";
import { examTypes } from "@/data/mock";

// Figma: sidebar 249:1048 (Faskes 3T, footer menu open) and 228:784 (Dokter Radiologi)
const roles = {
  faskes: {
    name: "Faskes 3T",
    initial: "F",
    links: [
      { href: "/faskes/dashboard", label: "Dashboard", icon: Home },
      { href: "/faskes/riwayat", label: "Riwayat", icon: Package },
    ],
    switchTo: { href: "/radiologi/dashboard", label: "Akun Dokter Radiologi" },
  },
  radiologi: {
    name: "Dr. Shinyu",
    initial: "S",
    links: [
      { href: "/radiologi/dashboard", label: "Dashboard", icon: Home },
      { href: "/radiologi/antrean", label: "Antrean Verifikasi", icon: Loader },
      { href: "/radiologi/riwayat", label: "Riwayat", icon: Package },
    ],
    switchTo: { href: "/faskes/dashboard", label: "Akun Faskes 3T" },
  },
};

const tile = "flex shrink-0 items-center justify-center rounded-md bg-neutral-800 font-bold text-neutral-100";
const menuItem = "flex w-full cursor-pointer items-center gap-2.5 rounded-md p-2 hover:bg-primary-200 [&_svg]:size-5";

export default function Sidebar({ role }: { role: keyof typeof roles }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [groupOpen, setGroupOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { name, initial, links, switchTo } = roles[role];

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
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-neutral-300 bg-neutral-100 ${collapsed ? "w-[60px]" : "w-[300px]"}`}
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
          onClick={() => setCollapsed(!collapsed)}
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
            <Link href={switchTo.href} className={menuItem}>
              <User />
              {switchTo.label}
            </Link>
            {/* Log Out does nothing for now */}
            <button type="button" className={`${menuItem} text-red-200`}>
              <LogIn />
              Log Out
            </button>
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
  );
}
