import React, { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
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
  User,
  LogOut,
} from 'lucide-react'
import { usePneumonia } from '../context/PneumoniaContext'
import { getModuleInfo } from './PneumoniaTabs'

function Crumbs() {
  const { pathname } = useLocation()

  if (pathname.includes('/dashboard') || pathname.includes('/riwayat')) {
    return (
      <div className="crumbs">
        <span className="cur">Dashboard</span>
      </div>
    )
  }

  const moduleInfo = getModuleInfo(pathname)
  const moduleName = moduleInfo.title

  let items: string[] = ['Detail Pemeriksaan', `${moduleName} - Statistika`]

  if (pathname.includes('/buat')) {
    items = ['Detail Pemeriksaan', `${moduleName} - Buat Pemeriksaan`]
  } else if (pathname.includes('/proses')) {
    items = ['Detail Pemeriksaan', `${moduleName} - Dalam Proses`]
  } else if (pathname.includes('/terverifikasi')) {
    items = ['Detail Pemeriksaan', `${moduleName} - Terverifikasi`]
  } else if (pathname.includes('/assignment')) {
    items = ['Detail Pemeriksaan', moduleName, 'Manual Assignment']
  } else if (pathname.includes('/detail')) {
    const defaultId =
      moduleInfo.type === 'kanker-tulang'
        ? '#KT-0124'
        : moduleInfo.type === 'tumor-otak'
        ? '#TO-0125'
        : '#PN-0123'
    items = ['Detail Pemeriksaan', moduleName, defaultId]
  }

  return (
    <div className="crumbs">
      {items.map((c, i) => (
        <span key={c + i} style={{ display: 'contents' }}>
          {i > 0 && <span>/</span>}
          <span className={i === items.length - 1 ? 'cur' : ''}>{c}</span>
        </span>
      ))}
    </div>
  )
}

export default function Shell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toasts, removeToast, addToast, sidebarCollapsed, setSidebarCollapsed } = usePneumonia()

  const [topSearch, setTopSearch] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [subGroupOpen, setSubGroupOpen] = useState(true)

  const handleTopSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topSearch.trim()) return
    const q = topSearch.toLowerCase()
    const moduleInfo = getModuleInfo(location.pathname)
    const base = moduleInfo.basePath
    if (q.includes('buat') || q.includes('tambah') || q.includes('baru')) {
      navigate(`${base}/buat`)
    } else if (q.includes('proses') || q.includes('antrean')) {
      navigate(`${base}/proses`)
    } else if (q.includes('verif') || q.includes('hasil') || q.includes('selesai')) {
      navigate(`${base}/terverifikasi`)
    } else {
      navigate(`${base}/statistika`)
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
          <NavLink
            className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
            to="/faskes-3t/dashboard"
            title="Dashboard"
          >
            <Home size={18} />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </NavLink>

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
                  className={({ isActive }) =>
                    `sb-item ${
                      isActive ||
                      location.pathname.includes('/pneumonia') ||
                      (!location.pathname.includes('kanker-tulang') &&
                        !location.pathname.includes('tumor-otak') &&
                        !location.pathname.includes('dashboard') &&
                        !location.pathname.includes('riwayat'))
                        ? 'active'
                        : ''
                    }`
                  }
                  to="/faskes-3t/pneumonia/statistika"
                  title="Pneumonia"
                >
                  <span className="sq" style={{ background: 'var(--quaternary-600)' }} />
                  {!sidebarCollapsed && <span>Pneumonia</span>}
                </NavLink>

                <NavLink
                  className={({ isActive }) =>
                    `sb-item ${isActive || location.pathname.includes('kanker-tulang') ? 'active' : ''}`
                  }
                  to="/faskes-3t/kanker-tulang/statistika"
                  title="Kanker Tulang"
                >
                  <span className="sq" style={{ background: 'var(--primary-600)' }} />
                  {!sidebarCollapsed && <span>Kanker Tulang</span>}
                </NavLink>

                <NavLink
                  className={({ isActive }) =>
                    `sb-item ${isActive || location.pathname.includes('tumor-otak') ? 'active' : ''}`
                  }
                  to="/faskes-3t/tumor-otak/statistika"
                  title="Tumor Otak"
                >
                  <span className="sq" style={{ background: 'var(--tertiary-600)' }} />
                  {!sidebarCollapsed && <span>Tumor Otak</span>}
                </NavLink>
              </>
            )}
          </div>

          <NavLink
            className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
            style={{ marginTop: 12 }}
            to="/faskes-3t/riwayat"
            title="Riwayat Pemeriksaan"
          >
            <Package size={18} />
            {!sidebarCollapsed && <span>Riwayat</span>}
          </NavLink>
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
                padding: '6px 8px',
                boxShadow: '0 -4px 16px rgba(0,0,0,0.1)',
                zIndex: 30,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  justifyContent: 'flex-start',
                  padding: '8px 10px',
                  color: 'var(--neutral-1000)',
                  borderRadius: 6,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  width: '100%',
                }}
                onClick={() => {
                  setShowProfileMenu(false)
                  addToast('Profil Akun Dokter Radiologi aktif.', 'info')
                }}
              >
                <User size={16} />
                <span>Akun Dokter Radiologi</span>
              </button>

              <div style={{ borderTop: '1px solid var(--neutral-200)', margin: '2px 0' }} />

              <button
                type="button"
                className="btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  justifyContent: 'flex-start',
                  padding: '8px 10px',
                  color: 'var(--red-100)',
                  borderRadius: 6,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  width: '100%',
                }}
                onClick={() => {
                  setShowProfileMenu(false)
                  addToast('Anda telah keluar dari sesi akun.', 'warning')
                }}
              >
                <LogOut size={16} color="var(--red-100)" />
                <span style={{ color: 'var(--red-100)', fontWeight: 500 }}>Log Out</span>
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
            top: 20,
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
                boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                animation: 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
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
