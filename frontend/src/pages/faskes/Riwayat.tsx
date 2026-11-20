import { useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePneumonia, type PatientRecord } from '../../context/PneumoniaContext'

export default function Riwayat() {
  const navigate = useNavigate()
  const { cases, setCurrentCase } = usePneumonia()
  const [currentPage, setCurrentPage] = useState(1)

  // 13 rows as shown in the Figma reference design
  const totalRows = 13
  const verifiedCases = cases.filter((c) => c.status === 'terverifikasi')

  const rows = Array.from({ length: totalRows }, (_, i) => {
    const isEven = i % 2 === 0
    const matched = verifiedCases[i]
    return {
      id: matched?.id || '#PN-0123',
      nama: matched?.nama || 'Gracella Uhuy',
      aiScore: matched?.aiResult
        ? `${matched.aiResult.diagnosis} | ${matched.aiResult.confidence}%`
        : isEven
        ? 'Bukan Pneumonia | 90%'
        : 'Pneumonia | 90%',
      radiologi: matched?.radiologist || 'Dr. Tama',
      tgl: matched?.verificationDate || '19/10/2026',
      hasil: matched?.verificationResult || 'Bukan Pneumonia',
      raw: matched,
    }
  })

  const handleRowClick = (item: (typeof rows)[0]) => {
    if (item.raw) {
      setCurrentCase(item.raw)
    } else {
      const dummy: PatientRecord = {
        id: item.id,
        nama: item.nama,
        dd: '01',
        mm: 'Mei',
        yyyy: '2000',
        gender: 'P',
        gejala:
          'Pasien datang dengan keluhan sesak napas yang meningkat sejak [X] hari, disertai batuk berdahak kental dan demam naik-turun.',
        files: [{ name: 'untitled-attachment01.jpeg', size: '128.KB', url: '/sample-xray.jpeg' }],
        aiResult: {
          diagnosis: item.aiScore.includes('Bukan') ? 'Bukan Pneumonia' : 'Pneumonia',
          confidence: 90,
          finding: 'Normal thorax or mild infiltrate.',
        },
        radiologist: item.radiologi,
        verificationDate: item.tgl,
        verificationResult: item.hasil as any,
        status: 'terverifikasi',
        createdAt: '2026-10-19',
      }
      setCurrentCase(dummy)
    }
    const isBone = item.id.startsWith('#KT-')
    const isBrain = item.id.startsWith('#TO-')
    const mod = isBone ? 'kanker-tulang' : isBrain ? 'tumor-otak' : 'pneumonia'
    navigate(`/faskes-3t/${mod}/detail/hasil`)
  }

  return (
    <div>
      {/* Title strictly following Figma reference */}
      <h1
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 16,
          color: 'var(--neutral-1000)',
        }}
      >
        Riwayat Kasus Terverifikasi
      </h1>

      {/* Main Table Panel */}
      <div
        className="panel"
        style={{
          padding: 0,
          borderRadius: 12,
          border: '1px solid var(--neutral-300)',
          background: '#fff',
          overflowX: 'auto',
        }}
      >
        <table>
          <thead>
            <tr>
              <th style={{ color: 'inherit', fontWeight: 700, paddingLeft: 20 }}>ID Rekam Medis</th>
              <th style={{ color: 'inherit', fontWeight: 700 }}>Nama Pasien</th>
              <th style={{ color: 'inherit', fontWeight: 700 }}>AI Confidence Score</th>
              <th style={{ color: 'inherit', fontWeight: 700 }}>Radiologi</th>
              <th style={{ color: 'inherit', fontWeight: 700 }}>Tanggal Verifikasi</th>
              <th style={{ color: 'inherit', fontWeight: 700 }}>Hasil Verifikasi</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                style={{
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onClick={() => handleRowClick(r)}
                className="table-row-hover"
              >
                {/* ID with vertical stripe indicator as seen in Figma */}
                <td style={{ paddingLeft: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 3,
                        height: 16,
                        backgroundColor: 'var(--quaternary-600)',
                        borderRadius: 2,
                        flexShrink: 0,
                      }}
                    />
                    <span>{r.id}</span>
                  </div>
                </td>
                <td>{r.nama}</td>
                <td>{r.aiScore}</td>
                <td>{r.radiologi}</td>
                <td>{r.tgl}</td>
                <td>{r.hasil}</td>
                <td style={{ textAlign: 'right', paddingRight: 20 }}>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      color: 'var(--neutral-1000)',
                      padding: 2,
                    }}
                    title="Lihat Detail Hasil"
                  >
                    <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination control matching Figma reference */}
      <div
        className="pager"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 10,
          marginTop: 16,
        }}
      >
        <button
          type="button"
          className="btn btn-outline"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          style={{
            padding: '6px 10px',
            opacity: currentPage <= 1 ? 0.4 : 1,
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
          }}
          title="Halaman Sebelumnya"
        >
          <ArrowLeft size={16} />
        </button>
        <span style={{ fontWeight: 400, fontSize: 14 }}>
          {currentPage}/10
        </span>
        <button
          type="button"
          className="btn btn-outline"
          disabled={currentPage >= 10}
          onClick={() => setCurrentPage((p) => Math.min(10, p + 1))}
          style={{
            padding: '6px 10px',
            opacity: currentPage >= 10 ? 0.4 : 1,
            cursor: currentPage >= 10 ? 'not-allowed' : 'pointer',
          }}
          title="Halaman Selanjutnya"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
