import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-out disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-forest focus-visible:ring-offset-paper";

const variants: Record<Variant, string> = {
  primary:
    "bg-forest text-paper hover:bg-forest-soft active:scale-[0.98] shadow-[0_1px_0_rgba(0,0,0,0.05)]",
  secondary:
    "bg-transparent text-ink border border-line-strong hover:border-ink hover:bg-paper-alt active:scale-[0.98]",
  ghost: "bg-transparent text-ink-muted hover:text-ink hover:bg-paper-alt",
  danger: "bg-brick text-paper hover:opacity-90 active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-[0.95rem]",
  sm: "px-4 py-2 text-sm",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}

export function LinkButton({
  href,
  className,
  variant = "primary",
  size = "md",
  children,
}: {
  href: string;
  className?: string;
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
