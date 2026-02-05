"use client";

import Button from "@/components/ui/Button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const safeTotalPages = totalPages > 0 ? totalPages : 1;
  const canGoBack = page > 1;
  const canGoForward = page < safeTotalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Button variant="secondary" disabled={!canGoBack} onClick={() => onPageChange(page - 1)}>
        Prev
      </Button>
      <span className="text-sm text-muted">
        Page {page} of {safeTotalPages}
      </span>
      <Button variant="secondary" disabled={!canGoForward} onClick={() => onPageChange(page + 1)}>
        Next
      </Button>
    </div>
  );
}
