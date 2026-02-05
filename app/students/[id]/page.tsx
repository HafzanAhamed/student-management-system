"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiDeleteStudent, apiGetStudent, type StudentDTO } from "@/lib/api";
import { formatDateDMY } from "@/lib/format";
import { AGE_REFERENCE_DATE, calculateAge } from "@/lib/age";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/ToastProvider";

export default function StudentDetailsPage({ params }: { params: { id: string } }) {
  const { addToast } = useToast();
  const router = useRouter();
  const [student, setStudent] = useState<StudentDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadStudent = async () => {
      setLoading(true);
      const response = await apiGetStudent(params.id);
      if (!active) return;

      if (response.ok) {
        setStudent(response.student);
      } else {
        addToast({ type: "error", title: "Unable to load student", description: response.error.message });
        setStudent(null);
      }
      setLoading(false);
    };

    loadStudent();

    return () => {
      active = false;
    };
  }, [addToast, params.id]);

  const handleDelete = async () => {
    if (!student) return;

    const response = await apiDeleteStudent(student._id);
    if (response.ok) {
      addToast({ type: "success", title: "Student deleted" });
      router.push("/students");
    } else {
      addToast({ type: "error", title: "Delete failed", description: response.error.message });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="mt-3 h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl text-ink">Student not found</h1>
        <p className="text-sm text-muted">The record may have been deleted or does not exist.</p>
        <Link href="/students" className="text-sm font-semibold text-ink">
          Back to students
        </Link>
      </div>
    );
  }

  const fullName = [student.name.first, student.name.middle, student.name.last].filter(Boolean).join(" ");
  const age = calculateAge(student.birthDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/students" className="text-sm font-semibold text-muted">
            Back to students
          </Link>
          <h1 className="mt-2 font-display text-3xl text-ink">{fullName}</h1>
          <p className="mt-1 text-sm text-muted">Student Code: {student.studentCode}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/students/${student._id}/edit`}
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink-soft shadow-sm transition hover:-translate-y-0.5 hover:border-border/80"
          >
            Edit
          </Link>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Birth date</p>
          <p className="mt-2 text-lg font-semibold text-ink">{formatDateDMY(student.birthDate)}</p>
          <p className="mt-1 text-sm text-muted">Age as of {formatDateDMY(AGE_REFERENCE_DATE)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Age</p>
          <p className="mt-2 text-lg font-semibold text-ink">{Number.isNaN(age) ? "-" : age}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Contact number</p>
          <p className="mt-2 text-lg font-semibold text-ink">{student.contactNumber}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Email</p>
          <p className="mt-2 text-lg font-semibold text-ink">{student.email || "-"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Address</p>
          <p className="mt-2 text-lg font-semibold text-ink">
            {student.address.line1}
            {student.address.line2 ? `, ${student.address.line2}` : ""}
          </p>
          <p className="mt-1 text-sm text-muted">
            {student.address.city} · {student.address.district}
          </p>
        </div>
      </div>

      <Modal
        open={deleteOpen}
        title="Delete student"
        description="This action will archive the record. You can still include deleted records via the API."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
        confirmVariant="danger"
      />
    </div>
  );
}
