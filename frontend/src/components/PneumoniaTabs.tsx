import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Airplay, CheckSquare, Clipboard, Loader, FileText, Trash2, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { usePneumonia } from '../context/PneumoniaContext'

export type ModuleType = 'pneumonia' | 'kanker-tulang' | 'tumor-otak'

interface ModuleInfo {
  type: ModuleType
  title: string
  color: string
  basePath: string
}

export function getModuleInfo(pathname: string): ModuleInfo {
  if (pathname.includes('kanker-tulang')) {
    return {
      type: 'kanker-tulang',
      title: 'Kanker Tulang',
      color: 'var(--primary-600)',
      basePath: '/faskes-3t/kanker-tulang',
    }
  }
  if (pathname.includes('tumor-otak')) {
    return {
      type: 'tumor-otak',
      title: 'Tumor Otak',
      color: 'var(--tertiary-600)',
      basePath: '/faskes-3t/tumor-otak',
    }
  }
  return {
    type: 'pneumonia',
    title: 'Pneumonia',
    color: 'var(--quaternary-600)',
    basePath: pathname.includes('/pneumonia') ? '/faskes-3t/pneumonia' : '/faskes-3t',
  }
}

export default function PneumoniaLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { drafts, loadDraft, deleteDraft } = usePneumonia()

  const [showDraftsModal, setShowDraftsModal] = useState(false)
  const currentModule = getModuleInfo(pathname)

  const isLegacy = !pathname.includes('/pneumonia') && !pathname.includes('/kanker-tulang') && !pathname.includes('/tumor-otak')

  const tabs = [
    {
      to: isLegacy ? '/faskes-3t/statistika' : `${currentModule.basePath}/statistika`,
      label: 'Statistika',
      icon: <Airplay size={16} />,
    },
    {
      to: isLegacy ? '/faskes-3t/buat' : `${currentModule.basePath}/buat`,
      label: 'Buat Pemeriksaan',
      icon: <Clipboard size={16} />,
      also: isLegacy ? '/faskes-3t/buat/terisi' : `${currentModule.basePath}/buat/terisi`,
    },
    {
      to: isLegacy ? '/faskes-3t/proses' : `${currentModule.basePath}/proses`,
      label: 'Dalam Proses',
      icon: <Loader size={16} />,
    },
    {
      to: isLegacy ? '/faskes-3t/terverifikasi' : `${currentModule.basePath}/terverifikasi`,
      label: 'Terverifikasi',
      icon: <CheckSquare size={16} />,
    },
  ]

  const handleOpenDraft = (draftId: string) => {
    loadDraft(draftId)
    setShowDraftsModal(false)
    navigate(isLegacy ? '/faskes-3t/buat' : `${currentModule.basePath}/buat`)
  }

  return (
    <>
      <div className="page-title">
        <span className="sq" style={{ background: currentModule.color }} />
        <span>{currentModule.title}</span>
      </div>

      <div className="tabrow">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `btn ${isActive || (t.also && pathname === t.also) ? 'btn-neutral' : 'btn-outline'}`
            }
          >
            {t.icon} {t.label}
          </NavLink>
        ))}

        <span className="spacer" />

        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setShowDraftsModal(true)}
          style={{ position: 'relative' }}
        >
          <FileText size={15} />
          <span>Drafts Pemeriksaan</span>
          {drafts.length > 0 && (
            <span
              style={{
                background: currentModule.color,
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 999,
                padding: '1px 6px',
                marginLeft: 2,
              }}
            >
              {drafts.length}
            </span>
          )}
        </button>
      </div>

      {children}

      {/* Modal Daftar Draft */}
      {showDraftsModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <b style={{ fontSize: 16 }}>Daftar Draft ({currentModule.title})</b>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setShowDraftsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {drafts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--neutral-400)' }}>
                Belum ada draft pemeriksaan yang disimpan.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                {drafts.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      border: '1px solid var(--neutral-300)',
                      borderRadius: 8,
                      padding: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#fff',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{d.nama || 'Pasien Tanpa Nama'}</div>
                      <div style={{ fontSize: 11, color: 'var(--neutral-400)' }}>
                        {d.id} • {d.files.length} citra terlampir
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-neutral"
                        style={{ fontSize: 11, padding: '4px 8px' }}
                        onClick={() => handleOpenDraft(d.id)}
                      >
                        Buka Draft
                      </button>
                      <button
                        type="button"
                        className="btn btn-del"
                        style={{ padding: 6 }}
                        onClick={() => deleteDraft(d.id)}
                        title="Hapus draft"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowDraftsModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
