import * as React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className, id, children, ...props }, ref) => {
    const selectId = id ?? React.useId();
    const describedBy = [
      error ? `${selectId}-error` : null,
      hint ? `${selectId}-hint` : null
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className="space-y-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-ink-soft">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={
            "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink shadow-sm transition focus:border-brand disabled:bg-surface-2 " +
            (className ?? "")
          }
          {...props}
        >
          {children}
        </select>
        {hint && !error && (
          <p id={`${selectId}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${selectId}-error`} className="text-xs text-coral">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
