import PageShell from "@/components/PageShell";
import RadiologiList from "@/components/RadiologiList";

// Figma: Desktop-20 243:1046
export default function AntreanPage() {
  return (
    <PageShell crumbs={["Antrean Verifikasi"]}>
      <h1 className="text-b1 font-bold">Antrean Verifikasi</h1>
      <hr className="mt-2.5 mb-[11px] border-neutral-300" />
      <RadiologiList verified={false} />
    </PageShell>
  );
}
