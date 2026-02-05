"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { calculateAge } from "@/lib/age";
import { formatDateDMY } from "@/lib/format";
import type { StudentDTO } from "@/lib/api";

type StudentCardsProps = {
  items: StudentDTO[];
  onDelete: (student: StudentDTO) => void;
};

export default function StudentCards({ items, onDelete }: StudentCardsProps) {
  return (
    <div className="grid gap-4 md:hidden">
      {items.map((student) => {
        const fullName = [student.name.first, student.name.middle, student.name.last]
          .filter(Boolean)
          .join(" ");
        const age = calculateAge(student.birthDate);

        return (
          <div key={student._id} className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{student.studentCode}</p>
                <h3 className="mt-1 text-lg font-semibold text-ink">{fullName}</h3>
              </div>
              <span className="rounded-full bg-surface-2 px-2 py-1 text-xs font-semibold text-muted">
                {student.address.district}
              </span>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-muted">
              <p>City: {student.address.city}</p>
              <p>Birth: {formatDateDMY(student.birthDate)}</p>
              <p>Age: {Number.isNaN(age) ? "-" : age}</p>
              <p>Contact: {student.contactNumber}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link href={`/students/${student._id}`} className="text-sm font-semibold text-ink-soft hover:text-ink">
                View
              </Link>
              <Link
                href={`/students/${student._id}/edit`}
                className="text-sm font-semibold text-ink-soft hover:text-ink"
              >
                Edit
              </Link>
              <Button variant="ghost" size="sm" onClick={() => onDelete(student)} aria-label="Delete student">
                Delete
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
