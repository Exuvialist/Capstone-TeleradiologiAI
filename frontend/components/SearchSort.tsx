"use client";

import { useState } from "react";
import { Filter } from "react-feather";
import Button from "@/components/Button";
import SearchField from "@/components/SearchField";

// Search bar + filter button that opens a sort menu (same light-blue style as the sidebar footer menu).
type Props = {
  searchLabel: string;
  query: string;
  onQuery: (query: string) => void;
  sorts: string[];
  sort: number;
  onSort: (index: number) => void;
};

export default function SearchSort({ searchLabel, query, onQuery, sorts, sort, onSort }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative mb-2.5 flex items-center gap-1.5">
      <SearchField aria-label={searchLabel} value={query} onChange={(e) => onQuery(e.target.value)} />
      <Button variant="outline" aria-label="Urutkan" selected={open} onClick={() => setOpen(!open)}>
        <Filter />
      </Button>
      {open && (
        <div className="absolute top-full right-0 z-10 @md:right-auto @md:left-[311px] mt-1 flex w-max flex-col gap-1 rounded-sm border border-primary-200 bg-primary-100 p-1">
          {sorts.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                onSort(i);
                setOpen(false);
              }}
              className={`flex w-full cursor-pointer items-center rounded-md p-2 hover:bg-primary-200 ${i === sort ? "font-bold" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
