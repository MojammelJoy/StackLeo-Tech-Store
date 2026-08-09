import { forwardRef } from "react";

import { cn } from "../lib/cn";

import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * Shared text input primitive. No built-in label/error rendering yet —
 * form-field composition (label, helper text, validation message) belongs
 * to whichever feature introduces the first real form, not this
 * foundation-level primitive.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900",
        "placeholder:text-neutral-400",
        "focus-visible:border-primary-500",
        "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
