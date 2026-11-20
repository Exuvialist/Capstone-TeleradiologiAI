"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// The Buat Pemeriksaan form (one per exam type) and the saved drafts. Kept in the browser until refresh
// (there's no backend yet), so they survive moving between pages. Files are kept too.
export type DraftForm = {
  medicalRecordNo: string;
  patientName: string;
  day: string;
  month: string;
  year: string;
  gender: string | null;
  symptoms: string;
  files: File[];
};
export type Draft = DraftForm & { id: string; type: string; savedAt: Date };
type OpenForm = DraftForm & { draftId: string | null }; // draftId: the draft being continued

const emptyForm: OpenForm = { medicalRecordNo: "", patientName: "", day: "", month: "", year: "", gender: null, symptoms: "", files: [], draftId: null };

const DraftContext = createContext<{
  drafts: Draft[];
  forms: Record<string, OpenForm>;
  setForms: (update: (forms: Record<string, OpenForm>) => Record<string, OpenForm>) => void;
  setDrafts: (update: (drafts: Draft[]) => Draft[]) => void;
}>({ drafts: [], forms: {}, setForms: () => {}, setDrafts: () => {} });

export function DraftProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [forms, setForms] = useState<Record<string, OpenForm>>({});
  return <DraftContext value={{ drafts, forms, setForms, setDrafts }}>{children}</DraftContext>;
}

export function useDrafts(type: string) {
  const { drafts, forms, setForms, setDrafts } = useContext(DraftContext);
  const form = forms[type] ?? emptyForm;
  const reset = () => setForms((all) => ({ ...all, [type]: emptyForm }));

  return {
    form,
    drafts: drafts.filter((d) => d.type === type),
    // Update some fields of the open form
    update: (patch: Partial<DraftForm>) => setForms((all) => ({ ...all, [type]: { ...(all[type] ?? emptyForm), ...patch } })),
    // "Simpan Draft": save (or update) the open form as a draft, then empty the form
    save: () => {
      const { draftId, ...values } = form;
      const id = draftId ?? String(Date.now());
      setDrafts((all) => [{ ...values, id, type, savedAt: new Date() }, ...all.filter((d) => d.id !== id)]);
      reset();
    },
    // Continue a draft: load it into the form
    open: (draft: Draft) => setForms((all) => ({ ...all, [type]: { ...draft, draftId: draft.id } })),
    // "Hapus Draft" and "Mulai Analisis": remove the draft being continued (if any), then empty the form
    discard: () => {
      if (form.draftId) setDrafts((all) => all.filter((d) => d.id !== form.draftId));
      reset();
    },
  };
}
