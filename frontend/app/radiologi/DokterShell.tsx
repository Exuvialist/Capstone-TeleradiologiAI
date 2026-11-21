"use client";

import { useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronUp, Home, Loader, LogOut, Package, Search } from "lucide-react";
import { logout } from "@/app/login/actions";
import { useToast } from "@/components/ToastProvider";
import { exams } from "@/data/mock";
import { examLabel } from "./format";

// Sidebar + topbar for the Dokter Radiologi pages (ported from Grace's DokterShell).

const nav = [
  { href: "/radiologi/dashboard", label: "Dashboard", icon: Home },
  { href: "/radiologi/antrean", label: "Antrean Verifikasi", icon: Loader },
  { href: "/radiologi/riwayat", label: "Riwayat", icon: Package },
];

// The "name" cookie is set at login (app/login/actions.ts) and isn't httpOnly, so the browser can read it.
const DEFAULT_NAME = "Dr. Shinyu";
function readNameCookie() {
  const match = document.cookie.match(/(?:^|; )name=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : DEFAULT_NAME;
}
const noSubscribe = () => () => {};

function Crumbs({ pathname }: { pathname: string }) {
  const detail = pathname.match(/^\/radiologi\/antrean\/([^/]+)/);
  if (detail) {
    const id = decodeURIComponent(detail[1]);
    const exam = exams.find((e) => e.id === id);
    return (
      <div className="crumbs">
        <Link href="/radiologi/antrean">Antrean Verifikasi</Link>
        <span>/</span>
        <span className="cur">{exam ? `${examLabel(exam.type)} - #${exam.id}` : `#${id}`}</span>
      </div>
    );
  }
  const current = pathname.startsWith("/radiologi/dashboard")
    ? "Dashboard"
    : pathname.startsWith("/radiologi/antrean")
      ? "Antrean Verifikasi"
      : pathname.startsWith("/radiologi/riwayat")
        ? "Riwayat Kasus Terverifikasi"
        : "Dokter Radiologi";
  return (
    <div className="crumbs">
      <span className="cur">{current}</span>
    </div>
  );
}

export default function DokterShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { addToast } = useToast();
  const name = useSyncExternalStore(noSubscribe, readNameCookie, () => DEFAULT_NAME);
  const initial = (name.replace(/^dr\.?\s*/i, "")[0] ?? "D").toUpperCase();

  const [topSearch, setTopSearch] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = topSearch.trim().toLowerCase();
    if (!q) return;
    if (q.includes("antre") || q.includes("verif") || q.includes("tunggu")) router.push("/radiologi/antrean");
    else if (q.includes("riwayat") || q.includes("selesai")) router.push("/radiologi/riwayat");
    else addToast(`Mencari data dokter: "${topSearch}"`, "info");
    setTopSearch("");
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sb-head">
          <div className="logo">T</div>
          <span className="name">Teleradiologi AI</span>
        </div>

        <nav className="sb-nav">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} className={`sb-item ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="sb-foot"
            style={{ width: "100%", border: "none", borderTop: "1px solid var(--neutral-300)", background: "none", cursor: "pointer" }}
            onClick={() => setShowProfileMenu((prev) => !prev)}
            aria-expanded={showProfileMenu}
            title="Profil Dokter"
          >
            <span className="avatar" style={{ background: "var(--primary-600)" }}>
              {initial}
            </span>
            <span className="name" style={{ textAlign: "left" }}>{name}</span>
            <ChevronUp size={18} />
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: "absolute",
                bottom: 60,
                left: 10,
                right: 10,
                background: "#fff",
                border: "1px solid var(--neutral-300)",
                borderRadius: 8,
                padding: "6px 8px",
                boxShadow: "0 -4px 16px rgba(0,0,0,0.1)",
                zIndex: 30,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ padding: "4px 8px", borderBottom: "1px solid var(--neutral-200)", marginBottom: 2 }}>
                <p style={{ fontSize: 13, fontWeight: 700 }}>{name}</p>
                <p style={{ fontSize: 11, color: "var(--neutral-400)" }}>Spesialis Radiologi</p>
              </div>
              <button
                type="button"
                className="btn"
                style={{ justifyContent: "flex-start", fontSize: 13, padding: "8px 10px", color: "var(--red-100)", width: "100%" }}
                onClick={async () => {
                  setShowProfileMenu(false);
                  await logout(); // server action: clears the cookies, then redirects to /login
                }}
              >
                <LogOut size={16} />
                <span style={{ fontWeight: 500 }}>Keluar (Log Out)</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header className="topbar">
          <Crumbs pathname={pathname} />
          <form onSubmit={handleSearchSubmit} className="search-btn" style={{ cursor: "text" }} role="search">
            <Search size={18} color="var(--neutral-400)" />
            <input
              type="text"
              placeholder="Search bar"
              aria-label="Cari"
              value={topSearch}
              onChange={(e) => setTopSearch(e.target.value)}
              style={{ border: "none", outline: "none", width: "100%", background: "transparent" }}
            />
          </form>
        </header>

        <main className="main" style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
