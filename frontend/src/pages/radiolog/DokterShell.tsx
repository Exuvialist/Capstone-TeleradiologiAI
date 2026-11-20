import React, { useState } from 'react'
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
  Home,
  Loader,
  Package,
  ChevronUp,
  Search,
  LogOut,
} from 'lucide-react'
import { usePneumonia } from '../../context/PneumoniaContext'

export function DokterShell({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToast, logout } = usePneumonia()

  const [topSearch, setTopSearch] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Dynamic breadcrumbs based on Figma specifications
  const getCrumbs = () => {
    const p = location.pathname
    if (p.includes('/dashboard')) {
      return (
        <div className="crumbs">
          <span className="cur">Dashboard</span>
        </div>
      )
    }
    if (p.includes('/verifikasi')) {
      return (
        <div className="crumbs">
          <NavLink to="/dokter-radiologi/antrean">Antrean Riwayat</NavLink>
          <span>/</span>
          <span className="cur">Pneumonia - #PN-0123</span>
        </div>
      )
    }
    if (p.includes('/antrean')) {
      return (
        <div className="crumbs">
          <span className="cur">Antrean Verifikasi</span>
        </div>
      )
    }
    if (p.includes('/riwayat')) {
      return (
        <div className="crumbs">
          <span className="cur">Riwayat Kasus Terverifikasi</span>
        </div>
      )
    }
    return (
      <div className="crumbs">
        <span className="cur">Dokter Radiologi</span>
      </div>
    )
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topSearch.trim()) return
    const q = topSearch.toLowerCase()
    if (q.includes('antre') || q.includes('verif') || q.includes('tunggu')) {
      navigate('/dokter-radiologi/antrean')
    } else if (q.includes('riwayat') || q.includes('selesai')) {
      navigate('/dokter-radiologi/riwayat')
    } else {
      addToast(`Mencari data dokter: "${topSearch}"`, 'info')
    }
    setTopSearch('')
  }

  return (
    <div className="shell">
      {/* Frozen Fixed Sidebar (280px) */}
      <aside className="sidebar">
        <div className="sb-head">
          <div className="logo">T</div>
          <span className="name">Teleradiologi AI</span>
        </div>

        <nav className="sb-nav">
          <NavLink
            className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
            to="/dokter-radiologi/dashboard"
            title="Dashboard"
          >
            <Home size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `sb-item ${isActive || location.pathname.includes('/verifikasi') ? 'active' : ''}`
            }
            to="/dokter-radiologi/antrean"
            title="Antrean Verifikasi"
          >
            <Loader size={18} />
            <span>Antrean Riwayat</span>
          </NavLink>

          <NavLink
            className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
            to="/dokter-radiologi/riwayat"
            title="Riwayat"
          >
            <Package size={18} />
            <span>Riwayat</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer User Profile */}
        <div
          className="sb-foot"
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => setShowProfileMenu((prev) => !prev)}
          title="Profil Dokter"
        >
          <div className="avatar" style={{ background: 'var(--primary-600)' }}>
            S
          </div>
          <span className="name">Dr. Shinyu</span>
          <ChevronUp size={18} />

          {showProfileMenu && (
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
              <div style={{ padding: '4px 8px', borderBottom: '1px solid var(--neutral-200)', marginBottom: 2 }}>
                <p style={{ fontSize: 13, fontWeight: 700 }}>Dr. Shinyu Sp.Rad</p>
                <p style={{ fontSize: 11, color: 'var(--neutral-400)' }}>Spesialis Radiologi Toraks & Onkologi</p>
              </div>

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
                  logout()
                  navigate('/login', { replace: true })
                }}
              >
                <LogOut size={16} color="var(--red-100)" />
                <span style={{ color: 'var(--red-100)', fontWeight: 500 }}>Keluar (Log Out)</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header className="topbar">
          {getCrumbs()}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <form onSubmit={handleSearchSubmit} className="search-btn" style={{ cursor: 'text' }}>
              <Search size={18} color="var(--neutral-400)" />
              <input
                type="text"
                placeholder="Search bar"
                value={topSearch}
                onChange={(e) => setTopSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent' }}
              />
            </form>
          </div>
        </header>

        {/* View Content */}
        <main className="main" style={{ flex: 1 }}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}


export default DokterShell
