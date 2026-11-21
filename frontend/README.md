# Teleradiologi AI — Frontend

Web app where a **Faskes 3T** (remote health facility) uploads a patient's X-ray, gets an AI result, and sends the case to a **Dokter Radiologi**, who accepts or rejects the AI result. Three exam types: Pneumonia, Kanker Tulang, Tumor Otak.

This folder is **frontend only**. Every screen works on **dummy data** in `data/mock.ts`, accounts live in the dev server's memory, and anything else you "save" (drafts, assignments, verifications) lives in the browser until refresh. The section [Connecting the backend](#connecting-the-backend) lists exactly what to replace.

> **Known gap: the two roles don't share data yet.** A Manual/Automatic Assignment made by the faskes does not reach the radiologist's queue, and a radiologist's verification does not reach the faskes pages. Both wait for the backend; see [Faskes ↔ Radiologi data flow](#faskes--radiologi-data-flow).

Design reference: the Figma file *UI Design | Capstone*, plus `documentation.md` (colors, type, spacing, components) and `roadmap.md` (every decision made while building).

---

## Quick start

Needs **Node.js 20.9 or newer** and npm.

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. It redirects to the login page.

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (also type-checks) |
| `npm start` | Runs the production build |
| `npm run lint` | ESLint |

- **Log in** with a dummy account, or make one on *Daftar* (`/daftar`, linked from the login page). The account decides the role; to switch role, *Log Out* (click the name at the bottom of the sidebar) and log in with another account. New accounts disappear when `npm run dev` restarts.

  | Role | Username | Password |
  |---|---|---|
  | Faskes 3T | `faskes3t` | `faskes123` |
  | Dokter Radiologi (Dr. Shinyu) | `drshinyu` | `dokter123` |
- **Sample image:** every dummy exam shows `public/sample/xray.jpg`. If the file is missing, the image viewer is an empty grey box.

---

## Tech stack

- **Next.js 16.4.6** (App Router) with **Cache Components** on (`next.config.ts`; see [Next.js notes](#nextjs-notes))
- **React 19.3**, **TypeScript**
- **Tailwind CSS v4**: design tokens (Figma colors, text styles, radius) live in `app/globals.css` under `@theme`. Tailwind's default colors are switched off, so only Figma colors exist (`bg-primary-100`, `text-neutral-1000`, …). Text styles are `text-h1`…`text-h8` and `text-b1`…`text-b5`.
- **react-feather** for icons, **Recharts 3** for the bar charts (Faskes pages)
- **Radiologi pages** use their own plain CSS (`app/radiologi/radiologi.css`, every selector scoped under `.radiologi`) and **lucide-react** icons; see [Radiologi pages](#radiologi-pages)
- **Clarity City** font in `public/font/` (with its license), loaded in `app/layout.tsx`

---

## Project structure

```
frontend/
├─ app/
│  ├─ layout.tsx, globals.css        # font, design tokens
│  ├─ page.tsx                       # "/" → /login (proxy.ts sends logged-in users to their dashboard)
│  ├─ login/                         # page.tsx, LoginForm.tsx, actions.ts (accounts, login / register / logout)
│  ├─ daftar/                        # page.tsx + RegisterForm.tsx (sign-up)
│  ├─ faskes/                        # role: Faskes 3T
│  │  ├─ layout.tsx                  # sidebar + AssignmentProvider + DraftProvider
│  │  ├─ dashboard/page.tsx
│  │  ├─ riwayat/page.tsx
│  │  └─ pemeriksaan/[jenis]/        # jenis = pneumonia | kanker-tulang | tumor-otak
│  │     ├─ statistika/page.tsx
│  │     ├─ buat/page.tsx + BuatForm.tsx
│  │     ├─ dalam-proses/page.tsx
│  │     ├─ terverifikasi/page.tsx
│  │     ├─ drafts/page.tsx + DraftList.tsx
│  │     └─ [id]/page.tsx + DetailView.tsx
│  │        ├─ assign/page.tsx + AssignView.tsx
│  │        └─ laporan/page.tsx + Report.tsx
│  └─ radiologi/                     # role: Dokter Radiologi
│     ├─ layout.tsx                  # .radiologi wrapper + ToastProvider + VerificationProvider + DokterShell
│     ├─ DokterShell.tsx             # sidebar + top bar (breadcrumb, search)
│     ├─ format.ts                   # Exam → display text (dates, "Pneumonia | 90%", verdict)
│     ├─ radiologi.css               # all Radiologi styles, scoped under .radiologi
│     ├─ dashboard/page.tsx + DokterDashboard.tsx
│     ├─ antrean/page.tsx + DokterAntrean.tsx
│     ├─ antrean/[id]/page.tsx + DokterVerifikasi.tsx
│     ├─ riwayat/page.tsx + DokterRiwayat.tsx
│     └─ riwayat/[id]/page.tsx       # old version, no longer linked (see Radiologi pages)
├─ components/                       # shared UI (Button, Sidebar, PageShell, ExamTable, …)
├─ data/mock.ts                      # ALL dummy data + the data types
├─ proxy.ts                          # redirects by login + role
└─ public/                           # font, sample image
```

Pages (`page.tsx`) are server components. Anything interactive is a `"use client"` component, either next to its page (`BuatForm.tsx`, `DetailView.tsx`, `AssignView.tsx`) or in `components/`.

---

## Screens and routes

| Route | Screen | Figma frame | Main file |
|---|---|---|---|
| `/login` | Login (username + password) | none, built from the design system | `app/login/LoginForm.tsx` |
| `/daftar` | Create an account (name, username, role, password) | none | `app/daftar/RegisterForm.tsx` |
| `/faskes/dashboard` | Faskes dashboard: chart, numbers, latest verified cases | Desktop-12 | `components/Analytics.tsx` |
| `/faskes/pemeriksaan/[jenis]/statistika` | Statistika tab for one exam type | Desktop-8 | `components/Analytics.tsx` |
| `/faskes/pemeriksaan/[jenis]/buat` | Buat Pemeriksaan: patient form + upload | Desktop-2, -3 | `buat/BuatForm.tsx` |
| `/faskes/pemeriksaan/[jenis]/dalam-proses` | Exams not verified yet | Desktop-9 | `components/ExamTable.tsx` |
| `/faskes/pemeriksaan/[jenis]/terverifikasi` | Verified exams | Desktop-10 | `components/ExamTable.tsx` |
| `/faskes/pemeriksaan/[jenis]/drafts` | Drafts Pemeriksaan: saved drafts of this type | none | `drafts/DraftList.tsx` |
| `/faskes/pemeriksaan/[jenis]/[id]` | Exam detail, 4 states (see [Exam status](#exam-status)) | Desktop-4, -6, -15, -14 | `[id]/DetailView.tsx` |
| `/faskes/pemeriksaan/[jenis]/[id]/assign` | Manual Assignment: pick a radiologist | Desktop-11 | `assign/AssignView.tsx` |
| `/faskes/pemeriksaan/[jenis]/[id]/laporan` | Export Laporan: printable report of a verified exam | none | `laporan/Report.tsx` |
| `/faskes/riwayat` | All verified exams | Desktop-16 | `components/ExamTable.tsx` |
| `/radiologi/dashboard` | Radiologist dashboard | Desktop-17 | `radiologi/dashboard/DokterDashboard.tsx` |
| `/radiologi/antrean` | Antrean Verifikasi: the radiologist's queue | Desktop-20 | `radiologi/antrean/DokterAntrean.tsx` |
| `/radiologi/antrean/[id]` | Verify a case: Terima / Tolak Hasil AI | Desktop-29, -30 | `radiologi/antrean/[id]/DokterVerifikasi.tsx` |
| `/radiologi/riwayat` | The radiologist's verified cases | Desktop-31 | `radiologi/riwayat/DokterRiwayat.tsx` |
| `/radiologi/riwayat/[id]` | A verified case, read-only (old version, not linked from Riwayat) | (Desktop-29 layout) | `components/VerifyView.tsx` |

---

## Data: what the screens need

Everything is in `data/mock.ts`. The types there are the contract the screens are built on, so the API should return the same shapes (or be mapped to them).

### Exam

One row per examination (`type Exam`). Dates are `"YYYY-MM-DD"` strings.

| Field | Type | Meaning | Shown in |
|---|---|---|---|
| `id` | string | Exam ID **created by the backend** when "Mulai Analisis" is clicked, e.g. `PN-0123` (prefix from the exam type) | URL, breadcrumb (`#PN-0123`) |
| `medicalRecordNo` | string | The patient's own record number, typed by the faskes | "ID Rekam Medis" in every table and detail page |
| `patientName` | string | | Faskes tables, detail pages |
| `faskes` | string | Name of the faskes account that sent the exam (from the login) | "Asal Faskes" in Radiologi tables |
| `type` | string | Exam type slug: `pneumonia`, `kanker-tulang`, `tumor-otak` | color bar, "Jenis Pemeriksaan" |
| `aiPositive` | boolean | AI says the disease is present | "Pneumonia" vs "Bukan Pneumonia" |
| `aiScore` | number | AI confidence, 0–100 | "Pneumonia \| 90%" |
| `radiologist` | string \| null | Radiologist chosen in Manual Assignment; `null` = nobody named | "Radiologi" / "Dokter Radiologi" columns, "Nama Radiologi" |
| `autoAssigned` | boolean | Sent with Automatic Assignment (the backend picks the doctor; the faskes sees no name) | Detail state Desktop-6, radiologist queue |
| `submittedAt` | string | Date the exam came in | "Tanggal Masuk", dashboard date range |
| `verifiedAt` | string \| null | Date the radiologist confirmed; `null` = not verified | "Tanggal Verifikasi" |
| `verdictPositive` | boolean \| null | The radiologist's result; `null` until verified. Different from `aiPositive` = AI result rejected | "Hasil Verifikasi" ("Terdeteksi" / "Tidak terdeteksi" or "Pneumonia" / "Bukan Pneumonia") |
| `note` | string \| null | The radiologist's reason ("Alasan Modifikasi" on the verify page, "Catatan" on the faskes detail page) | Detail pages |
| `birthDate` | string | | "Tanggal Lahir", shown as `DD / MM / YYYY` |
| `gender` | `"Laki-Laki"` \| `"Perempuan"` | | "Jenis Kelamin" |
| `symptoms` | string | "Gejala Klinis" typed by the faskes | Detail pages |
| `images` | string[] | Image URLs for the "Hasil Deteksi" viewer (zoom, previous/next, download) | Detail pages |

### Exam status

There is no status field: the screens work it out from the fields above, in this order.

| Status | Rule | Faskes detail page | Radiologist |
|---|---|---|---|
| Verified | `verifiedAt` is set | "Hasil Radiologi" (Desktop-14) | in Riwayat |
| Assigned | `radiologist` is set | "Menunggu Verifikasi" + doctor name (Desktop-15) | in that doctor's queue |
| Auto-assigned | `autoAssigned` is true | "Menunggu Verifikasi", no name (Desktop-6) | in the queue of the doctor the backend picked |
| AI result only | none of the above | AI result + Manual / Automatic Assignment buttons (Desktop-4) | nobody's queue yet |

### Other data

| Export | Shape | Used by |
|---|---|---|
| `examTypes` | `{ slug, label, prefix, color }[]` (color is a Tailwind class) | Sidebar, tabs, tables, charts. Fixed list, can stay in the frontend |
| `radiologists` | `{ name, experience, pending }[]`: years of experience, cases waiting for them | Manual Assignment cards (sorted by fewest cases, most experience, or name) |
| `radiologist` | `"Dr. Shinyu"` | The radiologist account's name (hard-coded, also in `components/Sidebar.tsx` with "Faskes 3T"; the login only stores the role) |
| `radiologistExams` | `Exam[]` | That radiologist's cases: assigned to them **plus** every auto-assigned exam |

### Dashboard numbers

The dashboards and Statistika tab compute everything **in the browser** from the exam list (`components/Analytics.tsx`): exams whose `submittedAt` falls in the picked date range, grouped per day / month / year per exam type, plus counts (verified, waiting, active doctors) and the average AI score. The default range is hard-coded to 13–19 Okt 2026 (the dummy data's last week); switch it to today when real data arrives. With a lot of data, the backend can return these numbers instead (see [Suggested API](#suggested-api)).

---

## Connecting the backend

### Login

Today (all dummy, nothing secure), everything is in `app/login/actions.ts`:

- `accounts`: the two dummy accounts plus any made on `/daftar`, **kept in the dev server's memory** (gone on restart). Passwords are stored as plain text, which is only acceptable for this dummy.
- `login()` checks username + password and sets three cookies: httpOnly **`session` = the role** (`faskes` or `radiologi`), plus **`name`** and **`username`**, which the sidebar's profile menu shows (name, @username, role). `logout()` deletes them; the menu's *Log Out* calls it.
- `register()` checks: all fields filled, a role picked, no spaces in the username, username not taken, both passwords the same. Then it adds the account and opens `/login`.
- `proxy.ts` reads `session` on every page request: no valid cookie → `/login`; logged in → only that role's pages (`/faskes/*` or `/radiologi/*`); `/login`, `/daftar` and `/` → the role's dashboard.
- Every account sees the same dummy exams; only the name in the sidebar changes.

With the backend:

1. In `login()` and `register()`, call the backend instead of checking `accounts`; show its error message on failure (the forms already show whatever the action returns as `error`).
2. Store what the backend returns (session ID or token) in the cookie instead of the role, and let `proxy.ts` get the role from it (or keep a second cookie with the role just for redirects).
3. Every API call sends the session/token, and **the backend checks the user and role on every endpoint**. `proxy.ts` only decides which page to show; it is not security.
4. Take the name and username from the backend (`GET /me`, or its login response) instead of the `name` / `username` cookies.

### Reads: where dummy data comes in

| File | Reads today | Replace with |
|---|---|---|
| `app/faskes/riwayat/page.tsx` | `exams` (verified) | verified exams of this faskes |
| `app/faskes/pemeriksaan/[jenis]/dalam-proses/page.tsx` | `exams` (this type, not verified) | same filter from the API |
| `app/faskes/pemeriksaan/[jenis]/terverifikasi/page.tsx` | `exams` (this type, verified) | same filter from the API |
| `app/faskes/pemeriksaan/[jenis]/[id]/page.tsx`, `…/assign/page.tsx` | one exam by `id` | one exam by ID |
| `app/faskes/pemeriksaan/[jenis]/[id]/assign/AssignView.tsx` | `radiologists` | radiologist list |
| `app/radiologi/antrean/[id]/page.tsx`, `riwayat/[id]/page.tsx` | `radiologistExams` (one by `id`) | one exam by ID |
| `components/Analytics.tsx` (client) | `exams` (Faskes dashboard + Statistika) | exams for the date range, or ready-made numbers |
| `app/radiologi/*/Dokter*.tsx` (client) | the radiologist's cases via `useRadiologistExams()` | the logged-in radiologist's exams |
| `app/radiologi/DokterShell.tsx` (client) | `exams` (breadcrumb label), the `name` cookie | the exam from the page, the logged-in user (`/me`) |
| `components/VerificationProvider.tsx` (client) | `radiologistExams` + verifications made in the browser | the logged-in radiologist's exams |
| `components/Sidebar.tsx` | the `name` / `username` cookies, falling back to the dummy accounts | the logged-in user (`/me`) |
| `components/DraftProvider.tsx` (client) | drafts made in the browser | the faskes' drafts |

Client components can't read server data directly: either pass the data from the server `page.tsx` as props (as the detail and table pages already do), or fetch it in the client.

### Writes: actions that should call the API

| Action | Where | Today | Should send |
|---|---|---|---|
| **Mulai Analisis** (create exam + run AI) | `buat/BuatForm.tsx` | shows the "Menganalisis Citra" pop-up with a progress bar that fills in **3 seconds (simulated)** (`AnalysisProgress`), then removes the draft being continued and opens the dummy exam `<prefix>-0123`. The form values (including the picked files) are in `useDrafts(type).form` (`components/DraftProvider.tsx`) | type (from the URL), `medicalRecordNo`, `patientName`, birth date (`day`, `month`, `year`), `gender`, `symptoms`, `files`. Keep the pop-up open while the API works (real upload/AI progress if the API reports it), then open `/faskes/pemeriksaan/<jenis>/<new id>` |
| **Simpan Draft** / **Hapus Draft** | `buat/BuatForm.tsx` → `save()` / `discard()` | `components/DraftProvider.tsx`, in the browser until refresh | the form values (create or update the draft) / the draft ID to delete |
| **Manual Assignment** | `assign/AssignView.tsx` → "Assign" on a card → confirmation pop-up → `assign(exam.id, doctor)` | `components/AssignmentProvider.tsx`, in the browser until refresh | exam ID + radiologist |
| **Automatic Assignment** | `[id]/DetailView.tsx` → `assign(exam.id, null)` | same provider | exam ID, "pick a doctor for me" |
| **Konfirmasi Keputusan** | `app/radiologi/antrean/[id]/DokterVerifikasi.tsx` → `verify(…)` | `components/VerificationProvider.tsx`, in the browser until refresh, **Radiologi pages only** (the faskes side doesn't see it). "Terima" keeps the AI's answer, "Tolak" flips it | exam ID, `verdictPositive`, `note` (required when the AI result is rejected). The server sets `verifiedAt` |

Once these call the API, `AssignmentProvider` and `VerificationProvider` can be removed and the pages read the updated exam from the server.

### Faskes ↔ Radiologi data flow

**Not connected yet.** Each role keeps its own changes in its own provider, mounted in its own layout, so the other role never sees them:

| Direction | Saved in | Missing today |
|---|---|---|
| Faskes → Radiologi (assign a doctor) | `AssignmentProvider` (`app/faskes/layout.tsx`) | the case doesn't appear in the doctor's Antrean Verifikasi |
| Radiologi → Faskes (verify a case) | `VerificationProvider` (`app/radiologi/layout.tsx`) | the result doesn't appear in Terverifikasi, the detail page or the Laporan |

**Plan: the backend connects them.** Both sides already use the same `Exam` type, so nothing changes in the screens: `POST /exams/{id}/assign` sets `radiologist` / `autoAssigned`, `POST /exams/{id}/verify` sets `verifiedAt` / `verdictPositive` / `note`, and both roles read the updated exam from `GET /exams`.

**Temporary option (only if a demo needs it before the backend):** keep assignments and verdicts in `localStorage`, and move `AssignmentProvider` and `VerificationProvider` up to `app/layout.tsx` so both roles read the same state. Works only in the same browser; replace it with the API calls above later.

### Suggested API

A starting point, not a contract; adjust freely as long as the screens get the fields above.

| Method | Path | Body / query | Returns |
|---|---|---|---|
| `POST` | `/auth/login` | `{ username, password }` | session / token + `{ role, name }` |
| `POST` | `/auth/register` | `{ name, username, role, password }` | `201`, or an error ("Username sudah dipakai", …) |
| `POST` | `/auth/logout` | | |
| `GET` | `/me` | | `{ role: "faskes" \| "radiologi", name }` |
| `GET` | `/exams` | `?type=&verified=&from=&to=` (scoped to the logged-in faskes or radiologist) | `Exam[]` |
| `GET` | `/exams/{id}` | | `Exam` |
| `POST` | `/exams` | multipart: `type`, `medicalRecordNo`, `patientName`, `birthDate`, `gender`, `symptoms`, `files[]` | `Exam` with `id` and the AI result |
| `POST` | `/exams/{id}/assign` | `{ radiologist: string \| null }` (`null` = automatic) | `Exam` |
| `POST` | `/exams/{id}/verify` | `{ verdictPositive: boolean, note: string \| null }` | `Exam` |
| `GET` | `/radiologists` | | `{ name, experience, pending }[]` (better with an `id`) |
| `GET` / `POST` / `PUT` / `DELETE` | `/drafts`, `/drafts/{id}` | `?type=`; the form fields + files | drafts: the form fields + `id`, `savedAt` |
| `GET` | `/stats` (optional) | `?type=&from=&to=&group=day\|month\|year` | chart groups + the dashboard numbers |

Upload rules shown on Buat Pemeriksaan: txt, docx, pdf, jpeg, xlsx, max 50 MB (not enforced in the frontend yet). Keep the API URL in `.env.local` (already git-ignored), e.g. `NEXT_PUBLIC_API_URL=…`.

### Next.js notes

This Next.js version ships its own docs in `node_modules/next/dist/docs/`; read them before changing data fetching. The guides named below are in `node_modules/next/dist/docs/01-app/01-getting-started/`.

- **Cache Components is on.** When a server page fetches data that must be fresh on every request, wrap the part that awaits it in `<Suspense fallback={…}>`, or cache it with `'use cache'` (`06-fetching-data.md`, `08-caching.md`). Without that, the dev overlay warns about a "blocking route".
- **Dynamic routes** (`[jenis]`, `[id]`) export `generateStaticParams`. With Cache Components it **must return at least one real ID** (an empty array fails the build). IDs not in the list are rendered on their first visit.
- Pages that read the URL (`params`) export `instant = false`, which silences the instant-navigation warning. Keep it, or switch to `<Suspense>` + a loading design.
- **Mutations:** Server Functions (`'use server'`) can be called straight from the existing click handlers, then refresh the data with `revalidatePath` (`07-mutating-data.md`).
- **Images from the API:** the viewer uses `next/image`, so add the image host to `images.remotePatterns` in `next.config.ts` (`12-images.md`).
- **`proxy.ts`** is Next.js 16's name for middleware. It only runs on `/`, `/login`, `/daftar`, `/faskes/*` and `/radiologi/*` (its `matcher`), so fonts and images aren't blocked.
- **Leave the rest of `next.config.ts` as it is**: the `turbopack` rule is what makes Tailwind work.

### Not implemented yet (does nothing)

- Real accounts (they live in the dev server's memory) and "forgot password"
- Top-bar search bar
- Download icon in an uploaded file's row; the 50 MB limit
- Loading and empty states (no design yet): an empty search shows just the table header

---

## Radiologi pages

The Dokter Radiologi screens were first built in a separate Vite app and moved into this project. They keep that app's look, but read the same data as the faskes pages (`data/mock.ts` + `VerificationProvider`).

- **Styling:** plain CSS in `app/radiologi/radiologi.css`, not Tailwind. Every selector starts with `.radiologi` (the wrapper in `app/radiologi/layout.tsx`), and its animations are named `rad-*`, so nothing leaks into the faskes pages. Colors are CSS variables at the top of that file (same hex values as the Figma tokens).
- **Icons:** `lucide-react` (the faskes pages use `react-feather`; Lucide started as a fork of Feather, so most icon names match).
- **Notifications:** `components/ToastProvider.tsx` (`useToast().addToast(text, "success" | "info" | "warning")`), one toast at a time, bottom-right. Only mounted in the Radiologi layout for now.
- **Dashboard chart:** the bar chart in `DokterDashboard.tsx` still draws generated numbers (`dayVals`), not exams. The four stat cards and the table under it use real case data. Switch the chart to `exams` (or `/stats`) together with the backend.
- **Not responsive yet:** the sidebar is a fixed 280 px (no drawer below 1024 px like the faskes pages).
- **Old files:** `app/radiologi/riwayat/[id]/page.tsx`, `components/VerifyView.tsx` and `components/RadiologiList.tsx` belong to the previous Radiologi version. Riwayat rows don't link to a detail page anymore; delete them or port the detail page when needed.

---

## Conventions

- **Desktop (1440 px) matches Figma.** Content is max 1100 px wide and centered.
- The conventions below are for the **faskes pages** (Tailwind). The Radiologi pages follow their own CSS; see [Radiologi pages](#radiologi-pages).
- **Responsive:** below 1024 px the sidebar becomes a drawer (layout button in the top bar). Pages switch layout by the **content width**, not the window: `<main>` is a CSS container and components use Tailwind container variants like `@4xl:flex-row`.
- **Tables** (`components/ExamTable.tsx`): one component; `kind` picks the column set, `tools` adds search + a sort icon (`"sort"`: Faskes Dalam Proses / Terverifikasi) or search + filter buttons (`"filters"`: Faskes Riwayat, Radiologi Antrean / Riwayat). Rows are a fixed 42 px (two lines, text centered), and tables scroll sideways on narrow screens.
- **Figma borders:** buttons and fields draw their border inside the padding (`p-[7px]` + `border` = Figma's 8 px); panels and info boxes add it outside (`p-3` + `border`).
- **Pop-ups** use `components/Modal.tsx` (a native `<dialog>`: dark backdrop, Escape / backdrop click close it when it has `onClose`).
- **Filter buttons** (`components/Dropdown.tsx`) show the chosen option, or their own label while the first (default) option is chosen.
- **Charts** show a tooltip with each exam type's count on hover (or tap) of a day / month / year.
- **Export Laporan** (`laporan/Report.tsx`) uses the browser's print window ("Save as PDF"); it opens by itself once the images have loaded. When printing, the sidebar and top bar are hidden (`print:hidden`) and the page is A4 (`@page` in `app/globals.css`).
- `roadmap.md` lists every decision (behavior, labels, what each button does).