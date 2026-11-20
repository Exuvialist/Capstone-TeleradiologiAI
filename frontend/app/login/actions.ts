"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type Role = "faskes" | "radiologi";

// Accounts live in the dev server's memory until the backend exists: the two dummy accounts, plus any
// made on /daftar (lost when `npm run dev` restarts). Replace these checks with calls to the backend.
const accounts: { username: string; password: string; role: Role; name: string }[] = [
  { username: "faskes3t", password: "faskes123", role: "faskes", name: "Faskes 3T" },
  { username: "drshinyu", password: "dokter123", role: "radiologi", name: "Dr. Shinyu" },
];

const text = (value: FormDataEntryValue | null) => String(value ?? "").trim();

// "session" = role (httpOnly, read by proxy.ts); "name" = the account's name, shown in the sidebar.
async function startSession(role: Role, name: string) {
  const store = await cookies();
  store.set("session", role, { httpOnly: true, sameSite: "lax", path: "/" });
  store.set("name", name, { sameSite: "lax", path: "/" });
  redirect(`/${role}/dashboard`);
}

export async function login(_state: { error: string; username: string } | undefined, formData: FormData) {
  const username = text(formData.get("username")).toLowerCase();
  const account = accounts.find((a) => a.username === username && a.password === formData.get("password"));
  if (!account) return { error: "Username atau kata sandi salah", username };
  await startSession(account.role, account.name);
}

type RegisterState = { error: string; name: string; username: string } | undefined;

export async function register(_state: RegisterState, formData: FormData): Promise<RegisterState> {
  const name = text(formData.get("name"));
  const username = text(formData.get("username")).toLowerCase();
  const role = formData.get("role");
  const password = String(formData.get("password") ?? "");
  const fail = (error: string) => ({ error, name, username });

  if (!name || !username || !password) return fail("Lengkapi semua isian");
  if (role !== "faskes" && role !== "radiologi") return fail("Pilih role");
  if (/\s/.test(username)) return fail("Username tidak boleh pakai spasi");
  if (accounts.some((a) => a.username === username)) return fail("Username sudah dipakai");
  if (password !== formData.get("confirm")) return fail("Kata sandi tidak sama");

  accounts.push({ username, password, role, name });
  redirect("/login");
}

export async function logout() {
  const store = await cookies();
  store.delete("session");
  store.delete("name");
  redirect("/login");
}
