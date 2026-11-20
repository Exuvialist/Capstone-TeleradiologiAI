import Sidebar from "@/components/Sidebar";

export default function RadiologiLayout({ children }: LayoutProps<"/radiologi">) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="radiologi" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
