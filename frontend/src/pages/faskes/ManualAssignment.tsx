import { useState } from 'react'
import { ChevronLeft, Filter, Search, UserCheck } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePneumonia, type Doctor } from '../../context/PneumoniaContext'
import { getModuleInfo } from '../../components/PneumoniaTabs'

function DoctorCard({
  doc,
  onAssign,
}: {
  doc: Doctor
  onAssign: () => void
}) {
  return (
    <div className="doc">
      <div className="name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{doc.nama}</span>
        <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--neutral-400)' }}>
          {doc.spesialisasi}
        </span>
      </div>
      <div className="kvr">
        <span>Pengalaman Radiologi</span>
        <b>{doc.pengalaman}</b>
      </div>
      <div className="kvr">
        <span>Jumlah Perlu Diverifikasi</span>
        <b>{doc.jumlahKasus} Kasus</b>
      </div>
      <div className="btnrow">
        <button
          type="button"
          className="btn btn-neutral"
          style={{ fontSize: 12, padding: '6px 14px' }}
          onClick={onAssign}
        >
          <UserCheck size={14} /> Assignment
        </button>
      </div>
    </div>
  )
}

export default function ManualAssignment() {
  const nav = useNavigate()
  const location = useLocation()
  const currentModule = getModuleInfo(location.pathname)
  const isBone = currentModule.type === 'kanker-tulang'
  const isBrain = currentModule.type === 'tumor-otak'

  const { currentCase, doctors, assignDoctorToCase, addToast } = usePneumonia()

  const [searchTerm, setSearchTerm] = useState('')
  const [sortByWorkload, setSortByWorkload] = useState(false)

  const defaultId = isBone ? '#KT-0124' : isBrain ? '#TO-0125' : '#PN-0123'
  const defaultNama = isBone ? 'Nabila Putri' : isBrain ? 'Raka Pratama' : 'Gracella Uhuy'
  const defaultScore = isBone ? 94 : isBrain ? 92 : 90
  const defaultDiag = isBone ? 'Kanker Tulang (Osteosarcoma)' : isBrain ? 'Tumor Otak (Meningioma)' : 'Pneumonia'

  const patientId = currentCase.id || defaultId
  const patientNama = currentCase.nama || defaultNama
  const aiScore = currentCase.aiResult?.confidence || defaultScore
  const aiDiagnosis = currentCase.aiResult?.diagnosis || defaultDiag

  const filteredDoctors = doctors
    .filter((d) =>
      d.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.spesialisasi.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortByWorkload) {
        return a.jumlahKasus - b.jumlahKasus
      }
      return 0
    })

  const handleAssignDoctor = (doctorName: string) => {
    assignDoctorToCase(patientId, doctorName)
    nav(`${currentModule.basePath}/detail/radiolog`)
  }

  const handleBackToPatientData = () => {
    nav(`${currentModule.basePath}/detail/radiolog`)
  }

  return (
    <>
      <div className="back-row">
        <button type="button" className="btn btn-outline btn-lg" onClick={handleBackToPatientData}>
          <ChevronLeft size={16} /> Kembali
        </button>
        <b style={{ fontSize: 16 }}>Manual Assignment</b>
      </div>

      <div className="panel" style={{ padding: 8 }}>
        <div className="assign-top">
          <div className="field">
            <label className="label-sm">ID Rekam Medis</label>
            <div className="input filled">{patientId}</div>
          </div>
          <div className="field">
            <label className="label-sm">Nama Pasien</label>
            <div className="input filled">{patientNama}</div>
          </div>
          <div className="summary">
            <div className="r">
              <b>Status</b>
              <span>Menunggu Verifikasi</span>
            </div>
            <div className="r">
              <b>Hasil Analisis AI</b>
              <span>
                {aiDiagnosis} | {aiScore}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="toolbar" style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <div className="input-search-box" style={{ flex: 'none', width: 260 }}>
          <Search size={16} color="var(--neutral-400)" />
          <input
            type="text"
            placeholder="Cari dokter atau spesialisasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          type="button"
          className={`btn ${sortByWorkload ? 'btn-neutral' : 'btn-outline'}`}
          aria-label="Filter beban kerja"
          onClick={() => {
            setSortByWorkload((prev) => !prev)
            addToast(
              !sortByWorkload
                ? 'Diurutkan berdasarkan beban kasus terendah.'
                : 'Urutan default dokter dipulihkan.',
              'info'
            )
          }}
          title="Urutkan beban kasus terendah"
        >
          <Filter size={16} />
          <span style={{ fontSize: 13 }}>{sortByWorkload ? 'Beban Kasus Terendah' : 'Filter'}</span>
        </button>
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="panel" style={{ padding: 32, textAlign: 'center', marginTop: 16, color: 'var(--neutral-400)' }}>
          Dokter tidak ditemukan dengan kata kunci "{searchTerm}".
        </div>
      ) : (
        <div className="docs" style={{ marginTop: 0 }}>
          {filteredDoctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doc={doc}
              onAssign={() => handleAssignDoctor(doc.nama)}
            />
          ))}
        </div>
      )}
    </>
  )
}
