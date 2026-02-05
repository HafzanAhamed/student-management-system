"use client";

import StudentForm from "@/components/students/StudentForm";

export default function NewStudentPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Create new record</p>
        <h1 className="font-display text-3xl text-ink">Add Student</h1>
      </div>
      <StudentForm mode="create" />
    </div>
  );
}
