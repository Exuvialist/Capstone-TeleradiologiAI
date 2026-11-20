import { redirect } from "next/navigation";

// proxy.ts already sends "/" to /login or the user's dashboard; this is the fallback.
export default function Home() {
  redirect("/login");
}
