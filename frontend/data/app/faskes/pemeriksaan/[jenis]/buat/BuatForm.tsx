"use client";

import { useRef, useState } from "react";
import { Download, Image as ImageIcon, Info, Trash2, UploadCloud } from "react-feather";
import Button from "@/components/Button";

// Figma Desktop-2 124:10896 (empty) and Desktop-3 125:11758 (filled, files uploaded).
// Fields: white + Neutral/400 border when empty, Primary/100 + Primary/300 border once filled.
const field =
  "rounded-md border border-neutral-400 bg-neutral-100 p-[7px] placeholder:text-neutral-400 not-placeholder-shown:border-primary-300 not-placeholder-shown:bg-primary-100";
const label = "text-b4 font-bold";
const panel = "rounded-lg border border-neutral-300 p-3";

export default function BuatForm({ detailHref }: { detailHref: string }) {
  const [gender, setGender] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const picker = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    const picked = Array.from(list ?? []); // copy now: the input gets cleared right after
    setFiles((prev) => [...prev, ...picked]);
  };

  return (
    <>
      <div className="mt-2 grid grid-cols-2 gap-4.5">
        <section className="flex flex-col gap-1.5">
          <h2 className="font-bold">Data Pasien</h2>
          <div className={`${panel} flex flex-col gap-3`}>
            <label className="flex flex-col gap-1">
              <span className={label}>ID Rekam Medis</span>
              <input placeholder="ID Rekam Medis" className={field} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={label}>Nama Pasien</span>
              <input placeholder="Nama Pasien" className={field} />
            </label>
            <div className="flex flex-col gap-1">
              <span className={label}>Tanggal Lahir</span>
              <div className="flex items-center gap-1">
                <input aria-label="Tanggal" placeholder="01" maxLength={2} inputMode="numeric" className={`${field} w-[37px] text-center`} />
                <span className="w-[7px] text-center">/</span>
                <input aria-label="Bulan" placeholder="05" maxLength={2} inputMode="numeric" className={`${field} w-[37px] text-center`} />
                <span className="w-[7px] text-center">/</span>
                <input aria-label="Tahun" placeholder="2000" maxLength={4} inputMode="numeric" className={`${field} w-[53px] text-center`} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className={label}>Jenis Kelamin</span>
              <div className="flex gap-2">
                {["Laki-Laki", "Perempuan"].map((option) => (
                  <Button
                    key={option}
                    variant={gender === option ? "neutral" : "outline"}
                    aria-pressed={gender === option}
                    onClick={() => setGender(option)}
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
                      onClick={() => setFiles(files.filter((_, j) => j !== i))}
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
        <textarea placeholder="Gejala Klinis" className={`${field} h-40 resize-none`} />
      </label>

      <div className="sticky bottom-5 mt-auto flex justify-end gap-[9px]">
        {/* Does nothing for now */}
        <Button variant="outline" className="w-[188px] justify-center">
          Simpan Draft
        </Button>
        <Button variant="neutral" href={detailHref} className="w-[188px] justify-center">
          Mulai Analisis
        </Button>
      </div>
    </>
  );
}
