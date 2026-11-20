import Sidebar, { SidebarProvider } from "@/components/Sidebar";
import { VerificationProvider } from "@/components/VerificationProvider";

export default function RadiologiLayout({ children }: LayoutProps<"/radiologi">) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar role="radiologi" />
        <div className="min-w-0 flex-1">
          <VerificationProvider>{children}</VerificationProvider>
        </div>
      </div>
    </SidebarProvider>
  );
}
