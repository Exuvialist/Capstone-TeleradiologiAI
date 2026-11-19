import { useRef } from 'react'
import { Calendar } from 'lucide-react'
import type { Patient } from '../types/patient'

interface PatientCardProps {
  p?: Patient
  onChange?: (updated: Patient) => void
  readOnly?: boolean
}

export function PatientCard({ p, onChange, readOnly = false }: PatientCardProps) {
  const hiddenDateInputRef = useRef<HTMLInputElement>(null)

  // Current values
  const id = p?.id ?? ''
  const nama = p?.nama ?? ''
  const dd = p?.dd ?? ''
  const mm = p?.mm ?? ''
  const yyyy = p?.yyyy ?? ''
  const gender = p?.gender ?? null

  const handleFieldChange = (field: keyof Patient, value: any) => {
    if (readOnly || !onChange) return
    const current: Patient = {
      id,
      nama,
      dd,
      mm,
      yyyy,
      gender,
      gejala: p?.gejala || '',
      [field]: value,
    }
    onChange(current)
  }

  const handleCalendarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly || !onChange) return
    const dateVal = e.target.value // "YYYY-MM-DD"
    if (!dateVal) return
    const [y, m, d] = dateVal.split('-')
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des',
    ]
    const mIdx = parseInt(m, 10) - 1
    const mmStr = monthNames[mIdx] || m

    const current: Patient = {
      id,
      nama,
      dd: d,
      mm: mmStr,
      yyyy: y,
      gender,
      gejala: p?.gejala || '',
    }
    onChange(current)
  }

  const isFilled = (val: string | null | undefined) => Boolean(val && val.trim() !== '')

  return (
    <div className="card stack" style={{ padding: 16 }}>
      {/* ID Rekam Medis */}
      <div className="field">
        <label>ID Rekam Medis</label>
        {readOnly ? (
          <div className={`input ${isFilled(id) ? 'filled' : ''}`}>
            {id || <span className="ph">ID Rekam Medis</span>}
          </div>
        ) : (
          <input
            type="text"
            className={`input ${isFilled(id) ? 'filled' : ''}`}
            placeholder="ID Rekam Medis (misal: #PN-0123)"
            value={id}
            onChange={(e) => handleFieldChange('id', e.target.value)}
          />
        )}
      </div>

      {/* Nama Pasien */}
      <div className="field">
        <label>Nama Pasien</label>
        {readOnly ? (
          <div className={`input ${isFilled(nama) ? 'filled' : ''}`}>
            {nama || <span className="ph">Nama Pasien</span>}
          </div>
        ) : (
          <input
            type="text"
            className={`input ${isFilled(nama) ? 'filled' : ''}`}
            placeholder="Nama Pasien"
            value={nama}
            onChange={(e) => handleFieldChange('nama', e.target.value)}
          />
        )}
      </div>

      {/* Tanggal Lahir */}
      <div className="field">
        <label>Tanggal Lahir</label>
        <div className="datefield">
          {readOnly ? (
            <>
              <div className={`input sm ${isFilled(dd) ? 'filled' : ''}`}>
                {dd || <span className="ph">01</span>}
              </div>
              /
              <div className={`input sm ${isFilled(mm) ? 'filled' : ''}`}>
                {mm || <span className="ph">Mei</span>}
              </div>
              /
              <div className={`input sm w ${isFilled(yyyy) ? 'filled' : ''}`}>
                {yyyy || <span className="ph">2000</span>}
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                className={`input sm ${isFilled(dd) ? 'filled' : ''}`}
                placeholder="01"
                maxLength={2}
                value={dd}
                onChange={(e) => handleFieldChange('dd', e.target.value)}
                style={{ textAlign: 'center', width: 44 }}
              />
              /
              <input
                type="text"
                className={`input sm ${isFilled(mm) ? 'filled' : ''}`}
                placeholder="Mei"
                maxLength={4}
                value={mm}
                onChange={(e) => handleFieldChange('mm', e.target.value)}
                style={{ textAlign: 'center', width: 56 }}
              />
              /
              <input
                type="text"
                className={`input sm w ${isFilled(yyyy) ? 'filled' : ''}`}
                placeholder="2000"
                maxLength={4}
                value={yyyy}
                onChange={(e) => handleFieldChange('yyyy', e.target.value)}
                style={{ textAlign: 'center' }}
              />
            </>
          )}

          {/* Hidden HTML5 date picker for easy click */}
          <button
            type="button"
            className="btn-calendar-trigger"
            onClick={() => !readOnly && hiddenDateInputRef.current?.showPicker?.()}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: readOnly ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--neutral-1000)',
              padding: 2,
            }}
            title={readOnly ? undefined : 'Pilih Tanggal'}
          >
            <Calendar size={18} />
          </button>
          <input
            type="date"
            ref={hiddenDateInputRef}
            onChange={handleCalendarPick}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
            tabIndex={-1}
          />
        </div>
      </div>

      {/* Jenis Kelamin */}
      <div className="field">
        <label>Jenis Kelamin</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            disabled={readOnly}
            onClick={() => handleFieldChange('gender', gender === 'L' ? null : 'L')}
            className={`btn ${gender === 'L' ? 'btn-neutral' : 'btn-outline'}`}
            style={{
              cursor: readOnly ? 'default' : 'pointer',
              color: gender === 'L' ? '#fff' : gender ? 'var(--neutral-1000)' : 'var(--neutral-400)',
              transition: 'all 0.15s ease',
            }}
          >
            Laki-Laki
          </button>
          <button
            type="button"
            disabled={readOnly}
            onClick={() => handleFieldChange('gender', gender === 'P' ? null : 'P')}
            className={`btn ${gender === 'P' ? 'btn-neutral' : 'btn-outline'}`}
            style={{
              cursor: readOnly ? 'default' : 'pointer',
              color: gender === 'P' ? '#fff' : gender ? 'var(--neutral-1000)' : 'var(--neutral-400)',
              transition: 'all 0.15s ease',
            }}
          >
            Perempuan
          </button>
        </div>
      </div>
    </div>
  )
}
