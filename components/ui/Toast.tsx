"use client";

type ToastProps = {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
  onDismiss: (id: string) => void;
};

const typeStyles: Record<ToastProps["type"], string> = {
  success: "border-brand/30 bg-brand/10 text-ink",
  error: "border-coral/30 bg-coral/10 text-ink",
  info: "border-sky/30 bg-sky/10 text-ink"
};

export default function Toast({ id, type, title, description, onDismiss }: ToastProps) {
  return (
    <div className={`w-full rounded-2xl border px-4 py-3 shadow-soft ${typeStyles[type]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {description ? <p className="mt-1 text-xs text-muted">{description}</p> : null}
        </div>
        <button
          onClick={() => onDismiss(id)}
          className="text-xs font-semibold text-muted hover:text-ink"
          aria-label="Dismiss notification"
        >
          Close
        </button>
      </div>
    </div>
  );
}
