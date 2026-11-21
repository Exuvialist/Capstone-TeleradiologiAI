"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "react-feather";
import Button from "@/components/Button";

// "Kembali": goes to the previous page, like the browser's back button.
export default function BackButton() {
  const router = useRouter();

  return (
    <Button variant="outline" onClick={() => router.back()} className="self-start">
      <ChevronLeft />
      Kembali
    </Button>
  );
}
