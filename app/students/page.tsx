"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import StudentFilters from "@/components/students/StudentFilters";
import StudentTable from "@/components/students/StudentTable";
import StudentCards from "@/components/students/StudentCards";
import Pagination from "@/components/students/Pagination";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import { apiDeleteStudent, apiGetStudents, type StudentDTO } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";

const PAGE_SIZE = 8;

export default function StudentsPage() {
  const { addToast } = useToast();
  const [items, setItems] = useState<StudentDTO[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<StudentDTO | null>(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    const response = await apiGetStudents({
      q: search || undefined,
      district: district || undefined,
      page,
      limit: PAGE_SIZE
    });

    if (response.ok) {
      setItems(response.items);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } else {
      setItems([]);
      addToast({
        type: "error",
        title: "Unable to load students",
        description: response.error.message
      });
    }

    setLoading(false);
  }, [addToast, district, page, search]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    const response = await apiDeleteStudent(deleteTarget._id);

    if (response.ok) {
      addToast({
        type: "success",
        title: "Student deleted",
        description: `${deleteTarget.name.first} ${deleteTarget.name.last} was removed.`
      });
      setDeleteTarget(null);

      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        loadStudents();
      }
    } else {
      addToast({ type: "error", title: "Delete failed", description: response.error.message });
    }
  };

  const handleSearchChange = (value: string) => {
    setPage(1);
    setSearch(value);
  };

  const handleDistrictChange = (value: string) => {
    setPage(1);
    setDistrict(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">Student Management</p>
          <h1 className="font-display text-3xl text-ink">Students</h1>
          <p className="mt-1 text-sm text-muted">{total} total student records</p>
        </div>
      </div>

      <StudentFilters
        search={search}
        district={district}
        onSearchChange={handleSearchChange}
        onDistrictChange={handleDistrictChange}
      />

      {loading ? (
        <div className="space-y-4">
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface shadow-soft md:block">
            <table className="min-w-full">
              <thead className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  {Array.from({ length: 7 }).map((_, index) => (
                    <th key={index} className="px-4 py-3" />
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 7 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-4 md:hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-3 h-4 w-2/3" />
                <Skeleton className="mt-3 h-4 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center shadow-soft">
          <h2 className="text-lg font-semibold text-ink">No students found</h2>
          <p className="mt-2 text-sm text-muted">
            Try adjusting your search or filters, or add a new student record.
          </p>
        </div>
      ) : (
        <>
          <StudentTable items={items} onDelete={setDeleteTarget} />
          <StudentCards items={items} onDelete={setDeleteTarget} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal
        open={!!deleteTarget}
        title="Delete student"
        description="This action will archive the record. You can still include deleted records via the API."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
        confirmVariant="danger"
      />
    </div>
  );
}
