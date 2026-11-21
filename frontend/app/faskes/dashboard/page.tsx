import Analytics from "@/components/Analytics";
import PageShell from "@/components/PageShell";

// Figma: Desktop-12 163:737 (Desktop-32 249:901 is the same page with the sidebar menu open)
export default function FaskesDashboardPage() {
  return (
    <PageShell crumbs={["Dashboard"]}>
      <Analytics variant="faskes" />
    </PageShell>
  );
}
