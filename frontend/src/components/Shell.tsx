import React, { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronUp,
  Home,
  LayoutPanelLeft,
  Package,
  Search,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Hospital,
} from 'lucide-react'
import { usePneumonia } from '../context/PneumoniaContext'

const crumbMap: Record<string, string[]> = {
  statistika: ['Detail Pemeriksaan', 'Pneumonia - Statistika'],
  buat: ['Detail Pemeriksaan', 'Pneumonia - Buat Pemeriksaan'],
  'buat/terisi': ['Detail Pemeriksaan', 'Pneumonia - Buat Pemeriksaan'],
  proses: ['Detail Pemeriksaan', 'Pneumonia - Dalam Proses'],
  terverifikasi: ['Detail Pemeriksaan', 'Pneumonia - Terverifikasi'],
  assignment: ['Detail Pemeriksaan', 'Pneumonia', 'Manual Assignment'],
}

function Crumbs() {
  const { pathname } = useLocation()
  const key = pathname.replace('/faskes-3t/', '')
  const items = crumbMap[key] ?? ['Detail Pemeriksaan', 'Pneumonia', '#PN-0123']
  return (
    <div className="crumbs">
      {items.map((c, i) => (
        <span key={c} style={{ display: 'contents' }}>
          {i > 0 && <span>/</span>}
          <span className={i === items.length - 1 ? 'cur' : ''}>{c}</span>
        </span>
      ))}
    </div>
  )
}

export default function Shell() {
  const navigate = useNavigate()
  const { toasts, removeToast, addToast, sidebarCollapsed, setSidebarCollapsed } = usePneumonia()

  const [topSearch, setTopSearch] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [subGroupOpen, setSubGroupOpen] = useState(true)

  const handleTopSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topSearch.trim()) return
    const q = topSearch.toLowerCase()
    if (q.includes('buat') || q.includes('tambah') || q.includes('baru')) {
      navigate('/faskes-3t/buat')
    } else if (q.includes('proses') || q.includes('antrean')) {
      navigate('/faskes-3t/proses')
    } else if (q.includes('verif') || q.includes('hasil') || q.includes('selesai')) {
      navigate('/faskes-3t/terverifikasi')
    } else {
      navigate('/faskes-3t/statistika')
      addToast(`Mencari data dengan kata kunci "${topSearch}"`, 'info')
    }
    setTopSearch('')
  }

  return (
    <div className={`shell ${sidebarCollapsed ? 'shell-collapsed' : ''}`}>
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="sb-head">
          <div className="logo">T</div>
          {!sidebarCollapsed && <span className="name">Teleradiologi AI</span>}
          <button
            type="button"
            className="btn btn-outline"
            aria-label="Toggle sidebar"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            title={sidebarCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
            style={{ marginLeft: sidebarCollapsed ? 'auto' : undefined }}
          >
            <LayoutPanelLeft size={18} />
          </button>
        </div>

        <nav className="sb-nav">
          <Link
            className="sb-item"
            to="/faskes-3t/statistika"
            title="Dashboard"
          >
            <Home size={18} />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </Link>

          <div className="sb-group">
            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSubGroupOpen((prev) => !prev)}
                className="label"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'inherit',
                  fontWeight: 500,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <span>Detail Pemeriksaan</span>
                <ChevronDown
                  size={14}
                  style={{
                    transform: subGroupOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
            )}

            {subGroupOpen && (
              <>
                <NavLink
                  className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
                  to="/faskes-3t/statistika"
                  title="Pneumonia"
                >
                  <span className="sq" style={{ background: 'var(--quaternary-600)' }} />
                  {!sidebarCollapsed && <span>Pneumonia</span>}
                </NavLink>

                <button
                  type="button"
                  className="sb-item"
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => addToast('Modul Kanker Tulang sedang dalam tahap integrasi model Roboflow.', 'info')}
                  title="Kanker Tulang"
                >
                  <span className="sq" style={{ background: 'var(--primary-600)' }} />
                  {!sidebarCollapsed && <span>Kanker Tulang</span>}
                </button>

                <button
                  type="button"
                  className="sb-item"
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => addToast('Modul Tumor Otak sedang dalam persiapan dataset radiologi.', 'info')}
                  title="Tumor Otak"
                >
                  <span className="sq" style={{ background: 'var(--tertiary-600)' }} />
                  {!sidebarCollapsed && <span>Tumor Otak</span>}
                </button>
              </>
            )}
          </div>

          <Link
            className="sb-item"
            style={{ marginTop: 12 }}
            to="/faskes-3t/terverifikasi"
            title="Riwayat Pemeriksaan"
          >
            <Package size={18} />
            {!sidebarCollapsed && <span>Riwayat</span>}
          </Link>
        </nav>

        {/* Sidebar Footer User Profile */}
        <div
          className="sb-foot"
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => setShowProfileMenu((prev) => !prev)}
          title="Profil Pengguna"
        >
          <div className="avatar">F</div>
          {!sidebarCollapsed && (
            <>
              <span className="name">Faskes 3T</span>
              <ChevronUp size={18} />
            </>
          )}

          {showProfileMenu && !sidebarCollapsed && (
            <div
              className="popover"
              style={{
                position: 'absolute',
                bottom: 60,
                left: 10,
                right: 10,
                background: '#fff',
                border: '1px solid var(--neutral-300)',
                borderRadius: 8,
                padding: 12,
                boxShadow: '0 -4px 16px rgba(0,0,0,0.1)',
                zIndex: 30,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Hospital size={16} color="var(--quaternary-600)" />
                <b style={{ fontSize: 13 }}>Puskesmas 3T Wilayah Timur</b>
              </div>
              <div style={{ fontSize: 12, color: 'var(--neutral-400)', marginBottom: 8 }}>
                ID Faskes: #FSK-9901 <br />
                Status Koneksi: Terhubung ke Server AI
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%', fontSize: 12 }}
                onClick={() => {
                  setShowProfileMenu(false)
                  addToast('Sesi faskes terverifikasi.', 'info')
                }}
              >
                Pengaturan Akun
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ minWidth: 0, overflowX: 'hidden' }}>
        <header className="topbar">
          <Crumbs />

          <form onSubmit={handleTopSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
            <div className="input-search-box search-btn" style={{ width: 305 }}>
              <Search size={18} color="var(--neutral-1000)" />
              <input
                type="text"
                placeholder="Search bar (cth: buat, proses, gracella)"
                value={topSearch}
                onChange={(e) => setTopSearch(e.target.value)}
              />
            </div>
          </form>
        </header>

        <main className="main">
          <Outlet />
        </main>
      </div>

      {/* Global Toast Notifications */}
      {toasts.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxWidth: 380,
          }}
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 8,
                background:
                  t.type === 'success'
                    ? '#27272d'
                    : t.type === 'warning'
                    ? '#5c420d'
                    : '#342f32',
                color: '#fff',
                fontSize: 13,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                animation: 'slideUp 0.2s ease',
              }}
            >
              {t.type === 'success' ? (
                <CheckCircle size={16} color="var(--tertiary-600)" />
              ) : t.type === 'warning' ? (
                <AlertCircle size={16} color="var(--secondary-300)" />
              ) : (
                <Info size={16} color="var(--primary-300)" />
              )}
              <span style={{ flex: 1 }}>{t.text}</span>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
