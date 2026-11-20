import type { ComponentProps } from "react";
import { Search } from "react-feather";

// Search bar from Figma (Outline Button with a search icon), 305px wide.
export default function SearchField(props: ComponentProps<"input">) {
  return (
    <label className="flex w-[305px] items-center gap-2.5 rounded-md border border-neutral-400 p-[7px]">
      <Search className="size-5 shrink-0" />
      <input type="text" placeholder="Search bar" className="min-w-0 flex-1 placeholder:text-neutral-1000" {...props} />
    </label>
  );
}
