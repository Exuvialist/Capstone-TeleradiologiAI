import DokterVerifikasi from "./DokterVerifikasi";

// Reads the exam ID from the URL; all data is in the browser, so blocking is fine (same as the faskes pages).
export const instant = false;

export default async function VerifikasiPage({ params }: PageProps<"/radiologi/antrean/[id]">) {
  const { id } = await params;
  return <DokterVerifikasi id={decodeURIComponent(id)} />;
}
