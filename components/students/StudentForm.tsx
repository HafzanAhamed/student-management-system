"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { apiCreateStudent, apiUpdateStudent, type StudentDTO } from "@/lib/api";
import { AGE_REFERENCE_DATE, calculateAge } from "@/lib/age";
import { formatDateDMY, toInputDateValue } from "@/lib/format";
import {
  districtList,
  studentFormSchema,
  type StudentFormValues
} from "@/lib/validators/student";

type StudentFormProps = {
  mode: "create" | "edit";
  studentId?: string;
  initialData?: StudentDTO | null;
};

export default function StudentForm({ mode, studentId, initialData }: StudentFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const defaultValues = useMemo<StudentFormValues>(
    () => ({
      name: {
        first: initialData?.name.first ?? "",
        middle: initialData?.name.middle ?? "",
        last: initialData?.name.last ?? ""
      },
      birthDate: initialData?.birthDate ? toInputDateValue(initialData.birthDate) : "",
      address: {
        line1: initialData?.address.line1 ?? "",
        line2: initialData?.address.line2 ?? "",
        city: initialData?.address.city ?? "",
        district: initialData?.address.district ?? districtList[0]
      },
      contactNumber: initialData?.contactNumber ?? "",
      email: initialData?.email ?? ""
    }),
    [initialData]
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors }
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const birthDateValue = watch("birthDate");
  const age = useMemo(() => {
    if (!birthDateValue) return "";
    const parsed = new Date(`${birthDateValue}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) return "";
    return calculateAge(parsed);
  }, [birthDateValue]);

  const birthDatePreview = birthDateValue
    ? formatDateDMY(`${birthDateValue}T00:00:00.000Z`)
    : "";

  const onSubmit = async (values: StudentFormValues) => {
    setSubmitting(true);

    const response =
      mode === "create" ? await apiCreateStudent(values) : await apiUpdateStudent(studentId!, values);

    setSubmitting(false);

    if (!response.ok) {
      if (response.error.fields) {
        Object.entries(response.error.fields).forEach(([field, message]) => {
          setError(field as any, { message });
        });
      }
      addToast({ type: "error", title: "Save failed", description: response.error.message });
      return;
    }

    addToast({
      type: "success",
      title: mode === "create" ? "Student created" : "Student updated"
    });

    router.push(`/students/${response.student._id}`);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-3xl border border-border bg-surface/90 p-6 shadow-soft"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label="Student Code"
          value={initialData?.studentCode ?? "Auto-generated after save"}
          disabled
          readOnly
        />
        <Input
          label="Age"
          value={age === "" ? "-" : String(age)}
          disabled
          readOnly
          hint={`Age is calculated as of ${formatDateDMY(AGE_REFERENCE_DATE)}.`}
        />
        <Input
          label="First Name"
          placeholder="Avery"
          error={errors.name?.first?.message}
          {...register("name.first")}
        />
        <Input
          label="Middle Name"
          placeholder="Optional"
          error={errors.name?.middle?.message}
          {...register("name.middle")}
        />
        <Input
          label="Last Name"
          placeholder="Johnson"
          error={errors.name?.last?.message}
          {...register("name.last")}
        />
        <Input
          label="Birth Date"
          type="date"
          error={errors.birthDate?.message}
          hint={birthDatePreview ? `Preview: ${birthDatePreview}` : "Format: DD/MM/YYYY"}
          {...register("birthDate")}
        />
        <Input
          label="Address Line 1"
          placeholder="House 14, Sunrise Avenue"
          error={errors.address?.line1?.message}
          {...register("address.line1")}
        />
        <Input
          label="Address Line 2 (optional)"
          placeholder="Apartment, suite, etc. (optional)"
          error={errors.address?.line2?.message}
          {...register("address.line2")}
        />
        <Input
          label="City"
          placeholder="Springfield"
          error={errors.address?.city?.message}
          {...register("address.city")}
        />
        <Select label="District" error={errors.address?.district?.message} {...register("address.district")}>
          {districtList.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </Select>
        <Input
          label="Contact Number"
          placeholder="0123456789"
          error={errors.contactNumber?.message}
          {...register("contactNumber")}
        />
        <Input
          label="Email (optional)"
          placeholder="student@email.com (optional)"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-muted">
          Student code is generated automatically and cannot be edited.
        </p>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : mode === "create" ? "Create Student" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
