import Sidebar from "@/components/Sidebar";

export default function FaskesLayout({ children }: LayoutProps<"/faskes">) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="faskes" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
