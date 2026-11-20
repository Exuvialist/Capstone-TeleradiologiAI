"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Assignments made in this browser (there's no backend yet), so they reset on refresh.
// radiologist: a name for Manual Assignment, null for Automatic Assignment.
type Assignments = Record<string, { radiologist: string | null }>;

const AssignmentContext = createContext<{
  assignments: Assignments;
  assign: (examId: string, radiologist: string | null) => void;
}>({ assignments: {}, assign: () => {} });

export function AssignmentProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<Assignments>({});
  const assign = (examId: string, radiologist: string | null) =>
    setAssignments((current) => ({ ...current, [examId]: { radiologist } }));

  return <AssignmentContext value={{ assignments, assign }}>{children}</AssignmentContext>;
}

export const useAssignments = () => useContext(AssignmentContext);
