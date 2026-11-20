import PageShell from "@/components/PageShell";
import RadiologiList from "@/components/RadiologiList";

// Figma: Desktop-31 243:4136
export default function RadiologiRiwayatPage() {
  return (
    <PageShell crumbs={["Riwayat"]}>
      <h1 className="text-b1 font-bold">Riwayat Kasus Terverifikasi</h1>
      <hr className="mt-2.5 mb-[11px] border-neutral-300" />
      <RadiologiList verified />
    </PageShell>
  );
}
