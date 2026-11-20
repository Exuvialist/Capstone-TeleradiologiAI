import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Shell from './components/Shell'
import Login from './pages/Login'
import { PneumoniaProvider, usePneumonia } from './context/PneumoniaContext'

// =========================================================
// FASKES 3T PAGES
// =========================================================
import {
  Dashboard as FaskesDashboard,
  Statistika,
  BuatPemeriksaan,
  Detail,
  Daftar,
  ManualAssignment,
  Riwayat as FaskesRiwayat,
} from './pages/faskes'

// =========================================================
// DOKTER RADIOLOGI PAGES
// =========================================================
import {
  DokterShell,
  RadiologDashboard,
  RadiologAntrean,
  RadiologVerifikasi,
  RadiologRiwayat,
} from './pages/radiolog'

function ProtectedFaskes({ children }: { children: React.ReactNode }) {
  const { currentUser } = usePneumonia()
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  if (currentUser.role === 'radiolog') {
    return <Navigate to="/dokter-radiologi/dashboard" replace />
  }
  return <>{children}</>
}

function ProtectedRadiolog({ children }: { children: React.ReactNode }) {
  const { currentUser } = usePneumonia()
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  if (currentUser.role === 'faskes') {
    return <Navigate to="/faskes-3t/dashboard" replace />
  }
  return <>{children}</>
}

function LoginRoute() {
  const { currentUser } = usePneumonia()
  if (currentUser) {
    if (currentUser.role === 'radiolog') {
      return <Navigate to="/dokter-radiologi/dashboard" replace />
    }
    return <Navigate to="/faskes-3t/dashboard" replace />
  }
  return <Login />
}

function RootRedirect() {
  const { currentUser } = usePneumonia()
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  if (currentUser.role === 'radiolog') {
    return <Navigate to="/dokter-radiologi/dashboard" replace />
  }
  return <Navigate to="/faskes-3t/dashboard" replace />
}

function AppRoutes() {
  const modules = ['pneumonia', 'kanker-tulang', 'tumor-otak']

  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={<LoginRoute />} />

      {/* ========================================================= */}
      {/* DOKTER RADIOLOGI ROUTES (Desktop 17, 20, 29, 30, 31)     */}
      {/* ========================================================= */}
      <Route
        path="/dokter-radiologi"
        element={
          <ProtectedRadiolog>
            <DokterShell />
          </ProtectedRadiolog>
        }
      >
        <Route path="dashboard" element={<RadiologDashboard />} />
        <Route path="antrean" element={<RadiologAntrean />} />
        <Route path="verifikasi/:id" element={<RadiologVerifikasi />} />
        <Route path="verifikasi" element={<RadiologVerifikasi />} />
        <Route path="riwayat" element={<RadiologRiwayat />} />
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* ========================================================= */}
      {/* FASKES 3T ROUTES                                          */}
      {/* ========================================================= */}
      <Route
        element={
          <ProtectedFaskes>
            <Shell />
          </ProtectedFaskes>
        }
      >
        <Route path="/faskes-3t/dashboard" element={<FaskesDashboard />} />
        <Route path="/faskes-3t/riwayat" element={<FaskesRiwayat />} />

        {/* Module-specific sub-routes */}
        {modules.map((m) => (
          <Route key={m}>
            <Route path={`/faskes-3t/${m}/statistika`} element={<Statistika />} />
            <Route path={`/faskes-3t/${m}/buat`} element={<BuatPemeriksaan />} />
            <Route path={`/faskes-3t/${m}/buat/terisi`} element={<BuatPemeriksaan filled />} />
            <Route path={`/faskes-3t/${m}/detail/hasil-ai`} element={<Detail variant="ai" />} />
            <Route path={`/faskes-3t/${m}/detail/menunggu`} element={<Detail variant="menunggu" />} />
            <Route path={`/faskes-3t/${m}/detail/radiolog`} element={<Detail variant="radiolog" />} />
            <Route path={`/faskes-3t/${m}/detail/hasil`} element={<Detail variant="hasil" />} />
            <Route path={`/faskes-3t/${m}/proses`} element={<Daftar variant="proses" />} />
            <Route path={`/faskes-3t/${m}/terverifikasi`} element={<Daftar variant="terverifikasi" />} />
            <Route path={`/faskes-3t/${m}/assignment`} element={<ManualAssignment />} />
          </Route>
        ))}

        {/* Legacy / Direct Pneumonia routes */}
        <Route path="/faskes-3t/statistika" element={<Statistika />} />
        <Route path="/faskes-3t/buat" element={<BuatPemeriksaan />} />
        <Route path="/faskes-3t/buat/terisi" element={<BuatPemeriksaan filled />} />
        <Route path="/faskes-3t/detail/hasil-ai" element={<Detail variant="ai" />} />
        <Route path="/faskes-3t/detail/menunggu" element={<Detail variant="menunggu" />} />
        <Route path="/faskes-3t/detail/radiolog" element={<Detail variant="radiolog" />} />
        <Route path="/faskes-3t/detail/hasil" element={<Detail variant="hasil" />} />
        <Route path="/faskes-3t/proses" element={<Daftar variant="proses" />} />
        <Route path="/faskes-3t/terverifikasi" element={<Daftar variant="terverifikasi" />} />
        <Route path="/faskes-3t/assignment" element={<ManualAssignment />} />
      </Route>

      {/* Fallback Root Redirect */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}

export default function App() {
  return (
    <PneumoniaProvider>
      <AppRoutes />
    </PneumoniaProvider>
  )
}
