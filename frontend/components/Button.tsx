import Link from "next/link";
import type { ComponentProps } from "react";

// Figma: White Button 28:9058 · Outline Button 28:9179 · Neutral Button 28:9300 (size sm)
const styles = {
  white: {
    rest: "border-neutral-100 bg-neutral-100",
    selected: "border-primary-100 bg-primary-100",
    states:
      "text-neutral-1000 not-disabled:hover:border-primary-200 not-disabled:hover:bg-primary-200 not-disabled:active:border-primary-100 not-disabled:active:bg-primary-100 disabled:text-neutral-400",
  },
  outline: {
    rest: "border-neutral-400 bg-neutral-100",
    selected: "border-primary-300 bg-primary-100",
    states:
      "text-neutral-1000 not-disabled:hover:border-primary-300 not-disabled:hover:bg-primary-200 not-disabled:active:border-primary-300 not-disabled:active:bg-primary-100 disabled:text-neutral-400",
  },
  neutral: {
    rest: "border-neutral-800 bg-neutral-800",
    selected: "border-neutral-900 bg-neutral-900",
    states:
      "text-neutral-100 not-disabled:hover:border-neutral-1000 not-disabled:hover:bg-neutral-1000 not-disabled:active:border-neutral-900 not-disabled:active:bg-neutral-900 disabled:border-neutral-600 disabled:bg-neutral-600 disabled:text-neutral-400",
  },
};

type ButtonProps = ComponentProps<"button"> & {
  variant: keyof typeof styles;
  selected?: boolean; // keeps the "active" look, e.g. the current page
  href?: string; // renders a Next.js link instead of a <button>
};

export default function Button({ variant, selected = false, href, className = "", ...props }: ButtonProps) {
  const style = styles[variant];
  // p-[7px] + 1px border = Figma's 8px padding (Figma draws the border inside the padding)
  const classes = `inline-flex cursor-pointer items-center gap-2.5 rounded-md border p-[7px] text-b3 disabled:cursor-default [&_svg]:size-5 [&_svg]:shrink-0 ${selected ? style.selected : style.rest} ${style.states} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} aria-current={selected ? "page" : undefined} aria-label={props["aria-label"]}>
        {props.children}
      </Link>
    );
  }

  return <button type="button" className={classes} {...props} />;
}
