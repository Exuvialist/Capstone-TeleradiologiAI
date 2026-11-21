"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Download, Image as ImageIcon, Info, Trash2, UploadCloud } from "react-feather";
import Button from "@/components/Button";
import { useDrafts } from "@/components/DraftProvider";
import { field, label } from "@/components/fieldStyles";
import Modal from "@/components/Modal";

// Figma Desktop-2 124:10896 (empty) and Desktop-3 125:11758 (filled, files uploaded).
// The values live in DraftProvider, so "Simpan Draft" can save them and a draft can be continued here.
const panel = "rounded-lg border border-neutral-300 p-3";

type Props = { type: string; detailHref: string; draftsHref: string };

// "Mulai Analisis" pop-up: a progress bar that fills in 3 seconds (simulated until the backend runs the AI), then calls onDone.
function AnalysisProgress({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const done = useEffectEvent(onDone);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const value = Math.min(100, Math.round(((Date.now() - start) / 3000) * 100));
      setProgress(value);
      if (value === 100) {
        clearInterval(timer);
        done();
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <Modal title="Menganalisis Citra">
      <p>AI sedang menganalisis citra pasien. Mohon tunggu.</p>
      <div className="flex items-center gap-3">
        <div role="progressbar" aria-valuenow={progress} aria-label="Progres analisis" className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
          <div className="h-full rounded-full bg-neutral-800" style={{ width: `${progress}%` }} />
        </div>
        <span className="w-10 text-right">{progress}%</span>
      </div>
    </Modal>
  );
}

export default function BuatForm({ type, detailHref, draftsHref }: Props) {
  const router = useRouter();
  const { form, update, save, discard } = useDrafts(type);
  const { files } = form;
  const picker = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const addFiles = (list: FileList | null) => {
    const picked = Array.from(list ?? []); // copy now: the input gets cleared right after
    update({ files: [...files, ...picked] });
  };

  return (
    <>
      <div className="mt-2 grid grid-cols-1 gap-4.5 @2xl:grid-cols-2">
        <section className="flex flex-col gap-1.5">
          <h2 className="font-bold">Data Pasien</h2>
          <div className={`${panel} flex flex-col gap-3`}>
            <label className="flex flex-col gap-1">
              <span className={label}>ID Rekam Medis</span>
              <input
                placeholder="ID Rekam Medis"
                value={form.medicalRecordNo}
                onChange={(e) => update({ medicalRecordNo: e.target.value })}
                className={field}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={label}>Nama Pasien</span>
              <input placeholder="Nama Pasien" value={form.patientName} onChange={(e) => update({ patientName: e.target.value })} className={field} />
            </label>
            <div className="flex flex-col gap-1">
              <span className={label}>Tanggal Lahir</span>
              <div className="flex items-center gap-1">
                <input
                  aria-label="Tanggal"
                  placeholder="01"
                  maxLength={2}
                  inputMode="numeric"
                  value={form.day}
                  onChange={(e) => update({ day: e.target.value })}
                  className={`${field} w-[37px] text-center`}
                />
                <span className="w-[7px] text-center">/</span>
                <input
                  aria-label="Bulan"
                  placeholder="05"
                  maxLength={2}
                  inputMode="numeric"
                  value={form.month}
                  onChange={(e) => update({ month: e.target.value })}
                  className={`${field} w-[37px] text-center`}
                />
                <span className="w-[7px] text-center">/</span>
                <input
                  aria-label="Tahun"
                  placeholder="2000"
                  maxLength={4}
                  inputMode="numeric"
                  value={form.year}
                  onChange={(e) => update({ year: e.target.value })}
                  className={`${field} w-[53px] text-center`}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className={label}>Jenis Kelamin</span>
              <div className="flex gap-2">
                {["Laki-Laki", "Perempuan"].map((option) => (
                  <Button
                    key={option}
                    variant={form.gender === option ? "neutral" : "outline"}
                    aria-pressed={form.gender === option}
                    onClick={() => update({ gender: option })}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Upload Citra</h2>
            <Info className="size-5" />
          </div>
          <input
            ref={picker}
            type="file"
            multiple
            accept=".txt,.docx,.pdf,.jpeg,.jpg,.xlsx"
            hidden
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {files.length === 0 ? (
            <div className={`${panel} flex flex-1`}>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  addFiles(e.dataTransfer.files);
                }}
                className="flex flex-1 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 bg-neutral-200/30 text-center"
              >
                <UploadCloud className="size-7" />
                <div>
                  <p className="font-bold">Pilih file atau tarik &amp; lepas di sini</p>
                  <p className="-mt-0.5">txt, docx, pdf, jpeg, xlsx - Max. 50MB</p>
                </div>
                <Button variant="outline" onClick={() => picker.current?.click()}>
                  Cari File
                </Button>
              </div>
            </div>
          ) : (
            <div className={`${panel} flex flex-1 flex-col items-end justify-between gap-3`}>
              <ul className="flex w-full flex-col gap-3">
                {files.map((file, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2.5 rounded-md border border-neutral-400 p-[7px]">
                      <span className="flex min-w-0 items-center gap-2">
                        <ImageIcon className="size-5 shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2.5 text-b4">
                        {Math.round(file.size / 1024)} KB
                        <Download className="size-5" />
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label={`Hapus ${file.name}`}
                      onClick={() => update({ files: files.filter((_, j) => j !== i) })}
                      className="cursor-pointer rounded-md border border-red-alpha-10 bg-red-alpha-10 p-[7px] text-red-100"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </li>
                ))}
              </ul>
              <Button variant="outline" onClick={() => picker.current?.click()}>
                Cari File Tambahan
              </Button>
            </div>
          )}
        </section>
      </div>

      <label className="mt-4.5 mb-[26px] flex flex-col gap-1">
        <span className={label}>Gejala Klinis</span>
        <textarea
          placeholder="Gejala Klinis"
          value={form.symptoms}
          onChange={(e) => update({ symptoms: e.target.value })}
          className={`${field} h-40 resize-none`}
        />
      </label>

      <div className="sticky bottom-5 mt-auto flex justify-end gap-[9px]">
        {/* Only when continuing a draft */}
        {form.draftId && (
          <Button
            variant="outline"
            onClick={() => {
              discard();
              router.push(draftsHref);
            }}
            className="flex-1 justify-center text-red-200! @md:w-[188px] @md:flex-none"
          >
            Hapus Draft
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => {
            save();
            router.push(draftsHref);
          }}
          className="flex-1 justify-center @md:w-[188px] @md:flex-none"
        >
          Simpan Draft
        </Button>
        {/* Shows the analysis pop-up, then opens the dummy exam until the backend creates one; a continued draft is removed */}
        <Button
          variant="neutral"
          onClick={() => setAnalyzing(true)}
          className="flex-1 justify-center @md:w-[188px] @md:flex-none"
        >
          Mulai Analisis
        </Button>
      </div>

      {analyzing && (
        <AnalysisProgress
          onDone={() => {
            discard();
            setAnalyzing(false); // pages stay mounted in the background, so close it before leaving
            router.push(detailHref);
          }}
        />
      )}
    </>
  );
}
