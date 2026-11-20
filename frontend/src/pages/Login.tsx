import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User, ShieldCheck, Stethoscope, Building2, AlertCircle } from 'lucide-react'
import { usePneumonia } from '../context/PneumoniaContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = usePneumonia()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!password.trim()) {
      setErrorMsg('Silakan masukkan kata sandi Anda.')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      const res = login(password, username)
      setIsLoading(false)

      if (res.success) {
        if (res.role === 'faskes') {
          navigate('/faskes-3t/dashboard', { replace: true })
        } else if (res.role === 'radiolog') {
          navigate('/dokter-radiologi/dashboard', { replace: true })
        }
      } else {
        setErrorMsg(res.error || 'Kata sandi tidak valid.')
      }
    }, 300)
  }

  const fillPreset = (userType: 'faskes' | 'radiolog') => {
    setErrorMsg('')
    if (userType === 'faskes') {
      setUsername('petugas_faskes3t')
      setPassword('faskes123')
    } else {
      setUsername('dr.shinyu_radiolog')
      setPassword('radiolog123')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f4f9 0%, #ffffff 50%, #e7edf5 100%)',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        fontFamily: 'var(--font)',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '36px 32px',
          boxShadow: '0 20px 48px rgba(39, 39, 45, 0.08)',
          borderRadius: 16,
          border: '1px solid var(--neutral-300)',
          background: '#ffffff',
          animation: 'zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: 'var(--neutral-800)',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              fontSize: 24,
              fontWeight: 700,
              margin: '0 auto 14px',
              boxShadow: '0 6px 16px rgba(52, 47, 50, 0.2)',
            }}
          >
            T
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--neutral-1000)', margin: '0 0 6px' }}>
            Teleradiologi AI
          </h1>
          <p style={{ fontSize: 13, color: 'var(--neutral-400)', margin: 0, lineHeight: '19px' }}>
            Masuk ke portal layanan teleradiologi terintegrasi AI
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div
            style={{
              background: 'rgba(251, 55, 72, 0.08)',
              border: '1px solid var(--red-100)',
              borderRadius: 8,
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              marginBottom: 20,
              fontSize: 13,
              color: '#c91828',
              lineHeight: '18px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="field">
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-1000)' }}>
              Nama Pengguna / ID Akun
            </label>
            <div className="input-search-box" style={{ height: 42 }}>
              <User size={18} color="var(--neutral-400)" />
              <input
                type="text"
                placeholder="Contoh: petugas_faskes atau dr.shinyu"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-1000)' }}>
                Kata Sandi (Penentu Akses Portal)
              </label>
            </div>
            <div className="input-search-box" style={{ height: 42, position: 'relative' }}>
              <Lock size={18} color="var(--neutral-400)" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  color: 'var(--neutral-400)',
                }}
                title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-neutral"
            disabled={isLoading}
            style={{
              height: 44,
              fontSize: 14,
              fontWeight: 600,
              width: '100%',
              borderRadius: 8,
              marginTop: 4,
            }}
          >
            {isLoading ? 'Memverifikasi Akses...' : 'Masuk ke Sistem'}
          </button>
        </form>

        {/* Info & Fast Role Selection Hint */}
        <div style={{ marginTop: 24, borderTop: '1px solid var(--neutral-200)', paddingTop: 18 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: 'var(--neutral-400)',
              marginBottom: 10,
              textAlign: 'center',
            }}
          >
            Pilih Kredensial Peran Akun (Otomatis Diarahkan):
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Preset Faskes 3T */}
            <div
              onClick={() => fillPreset('faskes')}
              style={{
                border: '1px solid var(--neutral-300)',
                borderRadius: 8,
                padding: '10px 8px',
                cursor: 'pointer',
                textAlign: 'center',
                background: 'var(--primary-100)',
                borderColor: 'var(--primary-300)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                <Building2 size={16} color="var(--primary-600)" />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-600)' }}>Faskes 3T</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--neutral-1000)', margin: 0 }}>
                Sandi: <code style={{ fontWeight: 600 }}>faskes123</code>
              </p>
            </div>

            {/* Preset Dokter Radiologi */}
            <div
              onClick={() => fillPreset('radiolog')}
              style={{
                border: '1px solid var(--neutral-300)',
                borderRadius: 8,
                padding: '10px 8px',
                cursor: 'pointer',
                textAlign: 'center',
                background: 'rgba(95, 92, 176, 0.08)',
                borderColor: 'rgba(95, 92, 176, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                <Stethoscope size={16} color="var(--quaternary-600)" />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--quaternary-600)' }}>Radiolog</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--neutral-1000)', margin: 0 }}>
                Sandi: <code style={{ fontWeight: 600 }}>radiolog123</code>
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: 14,
              fontSize: 11,
              color: 'var(--neutral-400)',
            }}
          >
            <ShieldCheck size={14} color="var(--tertiary-600)" />
            <span>Sistem Terenkripsi & Terpisah Berdasarkan Peran</span>
          </div>
        </div>
      </div>
    </div>
  )
}
