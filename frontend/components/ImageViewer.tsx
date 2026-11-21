"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Download, Minus, Plus } from "react-feather";
import Button from "@/components/Button";

// "Hasil Deteksi" viewer (Desktop-4/-6/-14/-15): zoom 1×–3×, previous/next image, download.
// `compact`: the Radiologi verify page (Desktop-29): no title, 240px tall.
export default function ImageViewer({ images, compact = false }: { images: string[]; compact?: boolean }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [failed, setFailed] = useState(false);
  const src = images[index];

  const show = (next: number) => {
    setIndex(next);
    setZoom(1);
    setFailed(false);
  };

  const download = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = "";
    link.click();
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        {!compact && <span className="text-b4 font-bold">Hasil Deteksi</span>}
        <div className={`relative overflow-hidden ${compact ? "h-[240px]" : "h-[300px]"} rounded-md border border-neutral-300 bg-neutral-200`}>
          {/* Scroll to move around a zoomed image */}
          <div className="size-full overflow-auto">
            {src && !failed && (
              <div className="relative" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
                <Image src={src} alt={`Hasil deteksi ${index + 1}`} fill sizes="1500px" className="object-contain" onError={() => setFailed(true)} />
              </div>
            )}
          </div>
          <Button variant="outline" aria-label="Unduh gambar" disabled={!src || failed} onClick={download} className={`absolute top-[10px] ${compact ? "right-[11px]" : "right-3"}`}>
            <Download />
          </Button>
        </div>
      </div>
      <div className="flex justify-between">
        <div className="flex gap-3">
          <Button variant="outline" aria-label="Perbesar" disabled={zoom >= 3} onClick={() => setZoom(zoom + 0.5)}>
            <Plus />
          </Button>
          <Button variant="outline" aria-label="Perkecil" disabled={zoom <= 1} onClick={() => setZoom(zoom - 0.5)}>
            <Minus />
          </Button>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" aria-label="Gambar sebelumnya" disabled={index === 0} onClick={() => show(index - 1)}>
            <ArrowLeft />
          </Button>
          <Button variant="outline" aria-label="Gambar berikutnya" disabled={index >= images.length - 1} onClick={() => show(index + 1)}>
            <ArrowRight />
          </Button>
        </div>
      </div>
    </>
  );
}
