"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { radiologistExams, type Exam } from "@/data/mock";

// Verifications made in this browser by the radiologist (there's no backend yet), so they reset on refresh.
// Only the Radiologi pages see them.
type Verdict = Pick<Exam, "verifiedAt" | "verdictPositive" | "note">;

const VerificationContext = createContext<{
  verdicts: Record<string, Verdict>;
  verify: (examId: string, verdict: Verdict) => void;
}>({ verdicts: {}, verify: () => {} });

export function VerificationProvider({ children }: { children: ReactNode }) {
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  const verify = (examId: string, verdict: Verdict) => setVerdicts((current) => ({ ...current, [examId]: verdict }));

  return <VerificationContext value={{ verdicts, verify }}>{children}</VerificationContext>;
}

export const useVerification = () => useContext(VerificationContext);

// The radiologist's cases with this browser's verifications applied.
export function useRadiologistExams() {
  const { verdicts } = useVerification();
  return radiologistExams.map((e) => ({ ...e, ...verdicts[e.id] }));
}
