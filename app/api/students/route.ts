import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Student from "@/models/Student";
import { getNextStudentCode } from "@/lib/studentCode";
import {
  districtList,
  studentCreateSchema,
  type StudentCreateInput
} from "@/lib/validators/student";

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

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildCreatePayload(data: StudentCreateInput) {
  return {
    name: {
      first: data.name.first.trim(),
      middle: normalizeOptional(data.name.middle),
      last: data.name.last.trim()
    },
    birthDate: new Date(`${data.birthDate}T00:00:00.000Z`),
    address: {
      line1: data.address.line1.trim(),
      line2: normalizeOptional(data.address.line2),
      city: data.address.city.trim(),
      district: data.address.district
    },
    contactNumber: data.contactNumber.trim(),
    email: normalizeOptional(data.email)?.toLowerCase()
  };
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

export async function GET(request: NextRequest) {
  const dbError = await ensureDb();
  if (dbError) return dbError;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const district = searchParams.get("district");
  const includeDeleted = searchParams.get("includeDeleted") === "true";
  const sortParam = searchParams.get("sort") ?? "createdAt_desc";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "10", 10)));

  if (district && !districtList.includes(district as (typeof districtList)[number])) {
    return error(400, "validation_error", "Invalid district", {
      "address.district": "District must be selected from the list"
    });
  }

  if (!Number.isFinite(page) || !Number.isFinite(limit)) {
    return error(400, "validation_error", "Invalid pagination", {
      page: "Page and limit must be numbers"
    });
  }

  const filter: Record<string, unknown> = {};
  if (!includeDeleted) filter.deletedAt = null;
  if (district) filter["address.district"] = district;

  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { studentCode: regex },
      { "name.first": regex },
      { "name.middle": regex },
      { "name.last": regex },
      { "address.city": regex }
    ];
  }

  const sort = sortParam === "createdAt_asc" ? { createdAt: 1 } : { createdAt: -1 };

  const total = await Student.countDocuments(filter);
  const items = await Student.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return ok({
    items: items.map(serializeStudent),
    page,
    limit,
    total,
    totalPages
  });
}

export async function POST(request: NextRequest) {
  const dbError = await ensureDb();
  if (dbError) return dbError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "validation_error", "Invalid JSON body");
  }

  const parsed = studentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return error(400, "validation_error", "Invalid student data", formatZodErrors(parsed.error));
  }

  try {
    const studentCode = await getNextStudentCode();
    const payload = buildCreatePayload(parsed.data);
    const student = await Student.create({
      studentCode,
      ...payload
    });

    return ok({ student: serializeStudent(student) }, 201);
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

    return error(500, "server_error", "Unable to create student");
  }
}
