"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft, Download, Minus, Plus } from "lucide-react";
import { useRadiologistExams, useVerification } from "@/components/VerificationProvider";
import { useToast } from "@/components/ToastProvider";
import { aiText, formatBirthDate, formatDate, todayYmd, verdictLabel } from "../../format";

// Verifikasi kasus (ported from Grace's RadiologVerifikasi): patient data, image viewer, and the radiologist's decision.

const label = { fontSize: 12, fontWeight: 700, color: "var(--neutral-400)", marginBottom: 2 } as const;

export default function DokterVerifikasi({ id }: { id: string }) {
  const router = useRouter();
  const { verify } = useVerification();
  const { addToast } = useToast();
  const exam = useRadiologistExams().find((e) => e.id === id);

  const [choice, setChoice] = useState<"terima" | "tolak" | null>(null);
  const [keputusanRad, setKeputusanRad] = useState("");
  const [alasanMod, setAlasanMod] = useState("");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [imageIdx, setImageIdx] = useState(0);

  if (!exam) {
    return (
      <div className="card stack">
        <p>Kasus #{id} tidak ditemukan di antrean Anda.</p>
        <Link href="/radiologi/antrean" className="btn btn-outline" style={{ alignSelf: "flex-start" }}>
          <ChevronLeft size={18} /> Kembali
        </Link>
      </div>
    );
  }

  const ai = aiText(exam); // "Pneumonia" or "Bukan Pneumonia"
  const image = exam.images[imageIdx] ?? exam.images[0];

  const handleSelectChoice = (c: "terima" | "tolak") => {
    setChoice(c);
    if (c === "terima") {
      setKeputusanRad(ai);
      setAlasanMod("");
    } else {
      setKeputusanRad(ai.startsWith("Bukan ") ? ai.replace("Bukan ", "") : `Bukan ${ai}`);
      setAlasanMod("");
    }
  };

  const handleConfirm = () => {
    if (!keputusanRad.trim()) {
      addToast("Lengkapi keputusan radiologi terlebih dahulu", "warning");
      return;
    }
    if (choice === "tolak" && !alasanMod.trim()) {
      addToast("Lengkapi alasan modifikasi terlebih dahulu", "warning");
      return;
    }
    // Accepting the AI keeps its answer; rejecting flips it.
    const verdictPositive = choice === "terima" ? exam.aiPositive : !exam.aiPositive;
    verify(exam.id, {
      verifiedAt: todayYmd(),
      verdictPositive,
      note: alasanMod.trim() || `Hasil AI diterima: ${keputusanRad}`,
    });
    addToast(`Kasus #${exam.id} berhasil diverifikasi: ${verdictPositive ? "Terdeteksi" : "Tidak terdeteksi"}.`, "success");
    router.push("/radiologi/antrean");
  };

  return (
    <div>
      <Link href="/radiologi/antrean" className="btn" style={{ marginBottom: 18 }}>
        <ChevronLeft size={18} />
        <span>Kembali</span>
      </Link>

      <div className="card detail">
        {/* Left column: patient data & viewer */}
        <div className="left">
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Data Pasien</div>
            <div className="sub">
              <div className="grid2" style={{ marginBottom: 12 }}>
                <div>
                  <div style={label}>ID Rekam Medis</div>
                  <div style={{ fontWeight: 600 }}>{exam.medicalRecordNo}</div>
                </div>
                <div>
                  <div style={label}>Nama Pasien</div>
                  <div style={{ fontWeight: 600 }}>{exam.patientName}</div>
                </div>
                <div>
                  <div style={label}>Tanggal Lahir</div>
                  <div>{formatBirthDate(exam.birthDate)}</div>
                </div>
                <div>
                  <div style={label}>Jenis Kelamin</div>
                  <div>{exam.gender}</div>
                </div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Gejala Klinis</div>
              <div style={{ color: "var(--neutral-800)", lineHeight: "20px" }}>{exam.symptoms}</div>
            </div>
          </div>

          <div className="card">
            <div className="viewer">
              {/* eslint-disable-next-line @next/next/no-img-element -- zoomed with CSS transform */}
              <img
                src={image}
                alt={`Citra radiologi ${exam.id}`}
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                  transform: `scale(${zoomLevel / 100})`,
                  transition: "transform 0.2s ease",
                }}
              />
              <a className="btn sq" href={image} download aria-label="Unduh citra" title="Unduh Citra">
                <Download size={16} />
              </a>
            </div>

            <div className="row-between">
              <div>
                <button type="button" className="btn sq" aria-label="Perbesar" onClick={() => setZoomLevel((z) => Math.min(200, z + 20))}>
                  <Plus size={16} />
                </button>
                <button type="button" className="btn sq" aria-label="Perkecil" onClick={() => setZoomLevel((z) => Math.max(60, z - 20))}>
                  <Minus size={16} />
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className="btn sq"
                  aria-label="Citra sebelumnya"
                  onClick={() => setImageIdx((i) => Math.max(0, i - 1))}
                  disabled={imageIdx <= 0}
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  className="btn sq"
                  aria-label="Citra berikutnya"
                  onClick={() => setImageIdx((i) => i + 1)}
                  disabled={imageIdx >= exam.images.length - 1}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: decision */}
        <div className="right">
          <div style={{ width: "100%" }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Keputusan</div>
            <div className="dec">
              <div className="info">
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Status</span>
                  {exam.verifiedAt ? (
                    <span style={{ color: "#0e7940", fontWeight: 600 }}>
                      Terverifikasi {formatDate(exam.verifiedAt)} · {verdictLabel(exam)}
                    </span>
                  ) : (
                    <span style={{ color: "var(--quaternary-600)", fontWeight: 600 }}>Menunggu Verifikasi</span>
                  )}
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Hasil Analisis AI</span>
                  <span style={{ fontWeight: 600 }}>
                    {ai} | {exam.aiScore}%
                  </span>
                </div>
              </div>

              <div className="field">
                <span style={{ fontSize: 12, fontWeight: 700 }}>Verifikasi</span>
                <div className="verif">
                  <button
                    type="button"
                    className={`accept ${choice === "terima" ? "sel-on" : ""}`}
                    aria-pressed={choice === "terima"}
                    onClick={() => handleSelectChoice("terima")}
                  >
                    Terima Hasil AI
                  </button>
                  <button
                    type="button"
                    className={`reject ${choice === "tolak" ? "sel-on" : ""}`}
                    aria-pressed={choice === "tolak"}
                    onClick={() => handleSelectChoice("tolak")}
                  >
                    Tolak Hasil AI
                  </button>
                </div>
              </div>

              <div className="field">
                <label htmlFor="kr" style={{ fontSize: 12, fontWeight: 700 }}>
                  Keputusan Radiologi
                </label>
                <input
                  id="kr"
                  className={`input ${keputusanRad ? "filled" : ""}`}
                  placeholder="Keputusan Radiologi"
                  value={keputusanRad}
                  onChange={(e) => setKeputusanRad(e.target.value)}
                />
              </div>

              <div className="field grow">
                <label htmlFor="am" style={{ fontSize: 12, fontWeight: 700 }}>
                  Alasan Modifikasi
                </label>
                <textarea
                  id="am"
                  className={`input ${alasanMod ? "filled" : ""}`}
                  placeholder="Alasan Modifikasi"
                  value={alasanMod}
                  onChange={(e) => setAlasanMod(e.target.value)}
                  style={{ minHeight: 90, padding: "10px 12px" }}
                />
              </div>
            </div>
          </div>

          {choice && (
            <button type="button" className="btn btn-neutral" style={{ width: 188 }} onClick={handleConfirm}>
              Konfirmasi Keputusan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
