"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { register } from "@/app/login/actions";
import Button from "@/components/Button";
import { field, label } from "@/components/fieldStyles";

const roles = [
  { value: "faskes", label: "Faskes" },
  { value: "radiologi", label: "Dokter Radiologi" },
];

export default function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);
  const [role, setRole] = useState("");

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className={label}>Nama</span>
        <input name="name" required autoComplete="name" placeholder="Nama" defaultValue={state?.name} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={label}>Username</span>
        <input name="username" required autoComplete="username" placeholder="Username" defaultValue={state?.username} className={field} />
      </label>
      <div className="flex flex-col gap-1">
        <span className={label}>Role</span>
        {/* Same picker as Jenis Kelamin on Buat Pemeriksaan: chosen = Neutral, the other = Outline */}
        <input type="hidden" name="role" value={role} />
        <div className="flex gap-2">
          {roles.map((option) => (
            <Button
              key={option.value}
              variant={role === option.value ? "neutral" : "outline"}
              aria-pressed={role === option.value}
              onClick={() => setRole(option.value)}
              className="flex-1 justify-center"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      <label className="flex flex-col gap-1">
        <span className={label}>Kata Sandi</span>
        <input name="password" type="password" required autoComplete="new-password" placeholder="Kata Sandi" className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={label}>Ulangi Kata Sandi</span>
        <input name="confirm" type="password" required autoComplete="new-password" placeholder="Ulangi Kata Sandi" className={field} />
      </label>
      {state && (
        <p role="alert" className="text-b4 text-red-200">
          {state.error}
        </p>
      )}
      <Button variant="neutral" type="submit" disabled={pending} className="mt-2 justify-center">
        Daftar
      </Button>
      <p className="text-center text-b4">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-bold underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
