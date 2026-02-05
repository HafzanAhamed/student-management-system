import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Student from "@/models/Student";
import { studentUpdateSchema, type StudentUpdateInput } from "@/lib/validators/student";

export const dynamic = "force-dynamic";

type ErrorFields = Record<string, string>;

function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

function error(status: number, code: string, message: string, fields?: ErrorFields) {
  return NextResponse.json({ ok: false, error: { code, message, fields } }, { status });
}

async function ensureDb() {
  try {
    await connectToDatabase();
    return null;
  } catch (err: any) {
    return error(500, "db_error", err?.message || "Database connection failed");
  }
}

function formatZodErrors(err: { issues: { path: (string | number)[]; message: string }[] }) {
  const fields: ErrorFields = {};
  err.issues.forEach((issue) => {
    const path = issue.path.join(".") || "root";
    if (!fields[path]) fields[path] = issue.message;
  });
  return fields;
}

function normalizeOptional(value?: string | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function serializeStudent(doc: any) {
  return {
    _id: doc._id.toString(),
    studentCode: doc.studentCode,
    name: {
      first: doc.name.first,
      middle: doc.name.middle ?? undefined,
      last: doc.name.last
    },
    birthDate: doc.birthDate?.toISOString(),
    address: {
      line1: doc.address.line1,
      line2: doc.address.line2 ?? undefined,
      city: doc.address.city,
      district: doc.address.district
    },
    contactNumber: doc.contactNumber,
    email: doc.email ?? undefined,
    deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null,
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString()
  };
}

function buildUpdatePayload(data: StudentUpdateInput) {
  const setOps: Record<string, unknown> = {};
  const unsetOps: Record<string, unknown> = {};

  if (data.name) {
    if (data.name.first !== undefined) setOps["name.first"] = data.name.first.trim();
    if (data.name.last !== undefined) setOps["name.last"] = data.name.last.trim();

    if (data.name.middle !== undefined) {
      const middle = normalizeOptional(data.name.middle);
      if (middle) setOps["name.middle"] = middle;
      else unsetOps["name.middle"] = "";
    }
  }

  if (data.birthDate !== undefined) {
    setOps.birthDate = new Date(`${data.birthDate}T00:00:00.000Z`);
  }

  if (data.address) {
    if (data.address.line1 !== undefined) setOps["address.line1"] = data.address.line1.trim();
    if (data.address.city !== undefined) setOps["address.city"] = data.address.city.trim();
    if (data.address.district !== undefined) setOps["address.district"] = data.address.district;

    if (data.address.line2 !== undefined) {
      const line2 = normalizeOptional(data.address.line2);
      if (line2) setOps["address.line2"] = line2;
      else unsetOps["address.line2"] = "";
    }
  }

  if (data.contactNumber !== undefined) {
    setOps.contactNumber = data.contactNumber.trim();
  }

  if (data.email !== undefined) {
    const email = normalizeOptional(data.email);
    if (email) setOps.email = email.toLowerCase();
    else unsetOps.email = "";
  }

  const updateOps: Record<string, unknown> = {};
  if (Object.keys(setOps).length) updateOps.$set = setOps;
  if (Object.keys(unsetOps).length) updateOps.$unset = unsetOps;

  return updateOps;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const dbError = await ensureDb();
  if (dbError) return dbError;

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return error(404, "not_found", "Student not found");
  }

  const includeDeleted = request.nextUrl.searchParams.get("includeDeleted") === "true";
  const filter: Record<string, unknown> = { _id: params.id };
  if (!includeDeleted) filter.deletedAt = null;

  const student = await Student.findOne(filter).lean();
  if (!student) {
    return error(404, "not_found", "Student not found");
  }

  return ok({ student: serializeStudent(student) });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const dbError = await ensureDb();
  if (dbError) return dbError;

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return error(404, "not_found", "Student not found");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "validation_error", "Invalid JSON body");
  }

  const parsed = studentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return error(400, "validation_error", "Invalid student data", formatZodErrors(parsed.error));
  }

  const updateOps = buildUpdatePayload(parsed.data);
  if (!updateOps.$set && !updateOps.$unset) {
    return error(400, "validation_error", "No fields to update");
  }

  try {
    const student = await Student.findOneAndUpdate(
      { _id: params.id, deletedAt: null },
      updateOps,
      { new: true }
    ).lean();

    if (!student) {
      return error(404, "not_found", "Student not found");
    }

    return ok({ student: serializeStudent(student) });
  } catch (err: any) {
    if (err && typeof err === "object" && err.code === 11000) {
      const duplicated = Object.keys(err.keyPattern || err.keyValue || {})[0] || "email";
      return error(409, "duplicate", `${duplicated} already exists`, {
        [duplicated]: "Already exists"
      });
    }

    if (err instanceof mongoose.Error) {
      return error(500, "server_error", err.message);
    }

    return error(500, "server_error", "Unable to update student");
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const dbError = await ensureDb();
  if (dbError) return dbError;

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return error(404, "not_found", "Student not found");
  }

  const student = await Student.findOneAndUpdate(
    { _id: params.id, deletedAt: null },
    { $set: { deletedAt: new Date() } },
    { new: true }
  ).lean();

  if (!student) {
    return error(404, "not_found", "Student not found");
  }

  return ok({ student: serializeStudent(student) });
}
