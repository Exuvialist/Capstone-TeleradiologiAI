"use client";

import { useActionState } from "react";
import Button from "@/components/Button";
import { login } from "./actions";

const label = "text-b4 font-bold";
const field =
  "rounded-md border border-neutral-400 bg-neutral-100 p-[7px] placeholder:text-neutral-400 not-placeholder-shown:border-primary-300 not-placeholder-shown:bg-primary-100";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className={label}>Email</span>
        {/* keeps the typed email after a wrong password */}
        <input name="email" type="email" required autoComplete="email" placeholder="Email" defaultValue={state?.email} className={field} />
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
    </form>
  );
}
