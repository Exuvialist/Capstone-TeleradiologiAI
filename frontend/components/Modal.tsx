"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Pop-up in the middle of the screen over a dark backdrop. No Figma frame: card style of the design system.
// A native <dialog>, so focus stays inside. With `onClose`, Escape and a click on the backdrop close it.
export default function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose?: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose?.();
      }}
      onClick={(e) => e.target === dialog.current && onClose?.()}
      className="m-auto w-[calc(100%-40px)] max-w-[400px] rounded-lg border border-neutral-300 bg-neutral-100 text-neutral-1000 backdrop:bg-neutral-1000/30"
    >
      <div className="flex flex-col gap-4 p-5">
        <h2 id="modal-title" className="text-b1 font-bold">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
