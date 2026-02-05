import type {
  District,
  StudentCreateInput,
  StudentUpdateInput
} from "@/lib/validators/student";

export type StudentDTO = {
  _id: string;
  studentCode: string;
  name: {
    first: string;
    middle?: string;
    last: string;
  };
  birthDate: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    district: District;
  };
  contactNumber: string;
  email?: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudentsListResponse = {
  items: StudentDTO[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiError = {
  ok: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};

export type ApiSuccess<T> = { ok: true } & T;
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {})
      }
    });

    const json = await response.json().catch(() => null);

    if (json && typeof json === "object" && "ok" in json) {
      return json as ApiResponse<T>;
    }

    if (!response.ok) {
      return {
        ok: false,
        error: {
          code: "http_error",
          message: response.statusText || "Request failed"
        }
      };
    }

    return {
      ok: false,
      error: {
        code: "invalid_response",
        message: "Invalid server response"
      }
    };
  } catch {
    return {
      ok: false,
      error: {
        code: "network_error",
        message: "Network error"
      }
    };
  }
}

export async function apiGetStudents(params: {
  q?: string;
  district?: string;
  page?: number;
  limit?: number;
  sort?: string;
  includeDeleted?: boolean;
}) {
  return request<StudentsListResponse>(`/api/students${buildQuery(params)}`);
}

export async function apiGetStudent(id: string, includeDeleted?: boolean) {
  return request<{ student: StudentDTO }>(`/api/students/${id}${buildQuery({ includeDeleted })}`);
}

export async function apiCreateStudent(payload: StudentCreateInput) {
  return request<{ student: StudentDTO }>(`/api/students`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function apiUpdateStudent(id: string, payload: StudentUpdateInput) {
  return request<{ student: StudentDTO }>(`/api/students/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function apiDeleteStudent(id: string) {
  return request<{ student: StudentDTO }>(`/api/students/${id}`, {
    method: "DELETE"
  });
}
