import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-[rgba(6,44,73,0.14)] bg-white/80 px-3.5 text-sm font-medium text-brand-900 transition focus-visible:outline-none focus-visible:border-accent-500 focus-visible:ring-4 focus-visible:ring-accent-500/15",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
