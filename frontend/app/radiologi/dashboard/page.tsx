import Analytics from "@/components/Analytics";
import PageShell from "@/components/PageShell";

// Figma: Desktop-17 228:681
export default function RadiologiDashboardPage() {
  return (
    <PageShell crumbs={["Dashboard"]}>
      <Analytics variant="radiologi" />
    </PageShell>
  );
}
