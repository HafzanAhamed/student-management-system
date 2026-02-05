import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? React.useId();
    const describedBy = [
      error ? `${inputId}-error` : null,
      hint ? `${inputId}-hint` : null
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-ink-soft">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={
            "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink shadow-sm transition focus:border-brand disabled:bg-surface-2 " +
            (className ?? "")
          }
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-coral">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
