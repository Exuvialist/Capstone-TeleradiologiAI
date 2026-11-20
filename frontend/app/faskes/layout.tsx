import { AssignmentProvider } from "@/components/AssignmentProvider";
import Sidebar, { SidebarProvider } from "@/components/Sidebar";

export default function FaskesLayout({ children }: LayoutProps<"/faskes">) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar role="faskes" />
        <div className="min-w-0 flex-1">
          <AssignmentProvider>{children}</AssignmentProvider>
        </div>
      </div>
    </SidebarProvider>
  );
}
