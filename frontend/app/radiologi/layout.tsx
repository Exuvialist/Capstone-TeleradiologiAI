import { ToastProvider } from "@/components/ToastProvider";
import { VerificationProvider } from "@/components/VerificationProvider";
import DokterShell from "./DokterShell";
import "./radiologi.css";

// Dokter Radiologi pages: Grace's layout and styles, Mel's data (VerificationProvider + data/mock.ts).
// The .radiologi wrapper keeps Grace's CSS from leaking into the faskes pages.
export default function RadiologiLayout({ children }: LayoutProps<"/radiologi">) {
  return (
    <div className="radiologi">
      <ToastProvider>
        <VerificationProvider>
          <DokterShell>{children}</DokterShell>
        </VerificationProvider>
      </ToastProvider>
    </div>
  );
}
