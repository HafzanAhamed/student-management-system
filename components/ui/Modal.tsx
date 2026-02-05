"use client";

import { useEffect, useRef } from "react";
import Button from "@/components/ui/Button";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger";
  onConfirm: () => void;
  onClose: () => void;
};

export default function Modal({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onClose
}: ModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    cancelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-ink/40"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-md rounded-2xl bg-surface p-6 shadow-soft"
      >
        <h2 id="modal-title" className="text-lg font-semibold text-ink">
          {title}
        </h2>
        {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            ref={cancelRef}
            variant="secondary"
            onClick={onClose}
            aria-label="Cancel deletion"
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            aria-label="Confirm deletion"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
