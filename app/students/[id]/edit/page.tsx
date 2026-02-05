"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentForm from "@/components/students/StudentForm";
import Skeleton from "@/components/ui/Skeleton";
import { apiGetStudent, type StudentDTO } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const { addToast } = useToast();
  const [student, setStudent] = useState<StudentDTO | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-3 h-4 w-1/2" />
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Update student record</p>
        <h1 className="font-display text-3xl text-ink">Edit Student</h1>
      </div>
      <StudentForm mode="edit" studentId={params.id} initialData={student} />
    </div>
  );
}
