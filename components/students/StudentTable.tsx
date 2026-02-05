"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { calculateAge } from "@/lib/age";
import { formatDateDMY } from "@/lib/format";
import type { StudentDTO } from "@/lib/api";

type StudentTableProps = {
  items: StudentDTO[];
  onDelete: (student: StudentDTO) => void;
};

export default function StudentTable({ items, onDelete }: StudentTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface shadow-soft md:block">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">District</th>
            <th className="px-4 py-3">City</th>
            <th className="px-4 py-3">Birth Date</th>
            <th className="px-4 py-3">Age</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {items.map((student) => {
            const fullName = [student.name.first, student.name.middle, student.name.last]
              .filter(Boolean)
              .join(" ");
            const age = calculateAge(student.birthDate);

            return (
              <tr key={student._id} className="hover:bg-surface-2/70">
                <td className="px-4 py-4 font-semibold text-ink">{student.studentCode}</td>
                <td className="px-4 py-4 text-ink-soft">{fullName}</td>
                <td className="px-4 py-4 text-muted">{student.address.district}</td>
                <td className="px-4 py-4 text-muted">{student.address.city}</td>
                <td className="px-4 py-4 text-muted">{formatDateDMY(student.birthDate)}</td>
                <td className="px-4 py-4 text-muted">{Number.isNaN(age) ? "-" : age}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Link href={`/students/${student._id}`} className="text-sm font-semibold text-muted hover:text-ink">
                      View
                    </Link>
                    <Link
                      href={`/students/${student._id}/edit`}
                      className="text-sm font-semibold text-muted hover:text-ink"
                    >
                      Edit
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(student)} aria-label="Delete student">
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
