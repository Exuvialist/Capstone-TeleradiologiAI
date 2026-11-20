"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Dummy accounts until the backend has a login. Replace the check in `login` with a call to the backend.
const accounts = [
  { email: "faskes@teleradiologi.id", password: "faskes123", role: "faskes" },
  { email: "dokter@teleradiologi.id", password: "dokter123", role: "radiologi" },
];

// The "session" cookie only holds the role ("faskes" | "radiologi"); proxy.ts reads it.
export async function login(_state: { error: string; email: string } | undefined, formData: FormData) {
  const email = String(formData.get("email")).trim().toLowerCase();
  const account = accounts.find((a) => a.email === email && a.password === formData.get("password"));
  if (!account) return { error: "Email atau kata sandi salah", email };

  (await cookies()).set("session", account.role, { httpOnly: true, sameSite: "lax", path: "/" });
  redirect(`/${account.role}/dashboard`);
}

export async function logout() {
  (await cookies()).delete("session");
  redirect("/login");
}
