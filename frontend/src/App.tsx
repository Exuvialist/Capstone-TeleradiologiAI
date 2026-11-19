import { Navigate, Route, Routes } from 'react-router-dom'
import Shell from './components/Shell'
import Statistika from './pages/Statistika'
import BuatPemeriksaan from './pages/BuatPemeriksaan'
import Detail from './pages/Detail'
import Daftar from './pages/Daftar'
import ManualAssignment from './pages/ManualAssignment'
import { PneumoniaProvider } from './context/PneumoniaContext'

export default function App() {
  return (
    <PneumoniaProvider>
      <Routes>
        <Route element={<Shell />}>
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
        <Route path="*" element={<Navigate to="/faskes-3t/statistika" replace />} />
      </Routes>
    </PneumoniaProvider>
  )
}
