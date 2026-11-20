"use client";

import { useState } from "react";
import { ChevronDown } from "react-feather";
import Button from "@/components/Button";

// Outline button "Label ⌄" that opens a menu (same light-blue style as the sort menu). Desktop-20 / -31 filters.
type Props = {
  label: string;
  options: string[];
  value: number;
  onChange: (index: number) => void;
};

export default function Dropdown({ label, options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button variant="outline" aria-expanded={open} selected={open} onClick={() => setOpen(!open)}>
        {label}
        <ChevronDown />
      </Button>
      {open && (
        <div className="absolute top-full left-0 z-10 mt-1 flex w-max flex-col gap-1 rounded-sm border border-primary-200 bg-primary-100 p-1">
          {options.map((option, i) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(i);
                setOpen(false);
              }}
              className={`flex w-full cursor-pointer items-center rounded-md p-2 hover:bg-primary-200 ${i === value ? "font-bold" : ""}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
