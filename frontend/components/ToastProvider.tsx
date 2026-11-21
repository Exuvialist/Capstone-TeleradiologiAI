"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

// Small notification in the bottom-right corner (ported from Grace's PneumoniaContext).
// Only one toast at a time; it disappears after 3.5 seconds.
type ToastType = "success" | "info" | "warning";
type Toast = { id: number; text: string; type: ToastType };

const colors: Record<ToastType, string> = { success: "#0e7940", info: "#342f32", warning: "#d00416" };

const ToastContext = createContext<{ addToast: (text: string, type?: ToastType) => void }>({ addToast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const addToast = useCallback((text: string, type: ToastType = "info") => {
    const id = Date.now();
    setToast({ id, text, type });
    setTimeout(() => setToast((current) => (current?.id === id ? null : current)), 3500);
  }, []);

  return (
    <ToastContext value={{ addToast }}>
      {children}
      <div role="status" aria-live="polite" style={{ position: "fixed", right: 24, bottom: 24, zIndex: 2000 }}>
        {toast && (
          <div
            style={{
              background: colors[toast.type],
              color: "#fff",
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 14,
              lineHeight: "20px",
              maxWidth: 360,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            {toast.text}
          </div>
        )}
      </div>
    </ToastContext>
  );
}

export const useToast = () => useContext(ToastContext);
