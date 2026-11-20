"use client";

import Link from "next/link";
import { useActionState } from "react";
import Button from "@/components/Button";
import { field, label } from "@/components/fieldStyles";
import { login } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className={label}>Username</span>
        {/* keeps the typed username after a wrong password */}
        <input name="username" required autoComplete="username" placeholder="Username" defaultValue={state?.username} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={label}>Kata Sandi</span>
        <input name="password" type="password" required autoComplete="current-password" placeholder="Kata Sandi" className={field} />
      </label>
      {state && (
        <p role="alert" className="text-b4 text-red-200">
          {state.error}
        </p>
      )}
      <Button variant="neutral" type="submit" disabled={pending} className="mt-2 justify-center">
        Masuk
      </Button>
      <p className="text-center text-b4">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-bold underline">
          Daftar
        </Link>
      </p>
    </form>
  );
}
