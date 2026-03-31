const baseUrl = () => (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/api\/?$/, "");

let bearerToken: string | null = null;

export function setBearerToken(token: string | null) {
  bearerToken = token;
}

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function api<T>(
  path: string,
  init: RequestInit & { parse?: "json" | "none" } = {}
): Promise<T> {
  const { parse = "json", ...rest } = init;
  const headers = new Headers(rest.headers);
  if (!headers.has("Content-Type") && rest.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (bearerToken) {
    headers.set("Authorization", `Bearer ${bearerToken}`);
  }
  const res = await fetch(`${baseUrl()}${path}`, { ...rest, headers });
  if (parse === "none") {
    if (!res.ok) {
      const body = await parseJson(res);
      const msg =
        typeof body === "object" && body !== null && "error" in body
          ? String((body as { error: string }).error)
          : res.statusText;
      throw new ApiError(msg, res.status, body);
    }
    return undefined as T;
  }
  const body = await parseJson(res);
  if (!res.ok) {
    const msg =
      typeof body === "object" && body !== null && "error" in body
        ? String((body as { error: string }).error)
        : res.statusText;
    throw new ApiError(msg, res.status, body);
  }
  return body as T;
}

export function getTimeSlots(params: {
  from?: string;
  to?: string;
  availableOnly?: boolean;
  skip?: number;
  take?: number;
}) {
  const q = new URLSearchParams();
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  if (params.availableOnly) q.set("availableOnly", "true");
  if (params.skip !== undefined) q.set("skip", String(params.skip));
  if (params.take !== undefined) q.set("take", String(params.take));
  const qs = q.toString();
  return api<{ slots: import("../types").TimeSlotListItem[] }>(
    `/api/time-slots${qs ? `?${qs}` : ""}`
  );
}

export function getHolidays(year: number, country: string) {
  return api<{ holidays: import("../types").HolidayItem[] }>(
    `/api/holidays?year=${year}&country=${encodeURIComponent(country)}`
  );
}

export function bookAppointment(timeSlotId: number, adminCodeId: number) {
  return api<{ appointment: { id: number; createdAt: string; timeSlot: unknown } }>(
    "/api/appointments",
    { method: "POST", body: JSON.stringify({ timeSlotId, adminCodeId }) }
  );
}

export function cancelAppointment(appointmentId: number) {
  return api<void>(`/api/appointments/${appointmentId}`, {
    method: "DELETE",
    parse: "none",
  });
}

export function getMyAppointments(skip?: number, take?: number) {
  const q = new URLSearchParams();
  if (skip !== undefined) q.set("skip", String(skip));
  if (take !== undefined) q.set("take", String(take));
  const qs = q.toString();
  return api<{ appointments: import("../types").AppointmentRow[] }>(
    `/api/appointments/me${qs ? `?${qs}` : ""}`
  );
}

export function getAllAppointments(from?: string, to?: string, skip?: number, take?: number) {
  const q = new URLSearchParams();
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  if (skip !== undefined) q.set("skip", String(skip));
  if (take !== undefined) q.set("take", String(take));
  const qs = q.toString();
  return api<{ appointments: import("../types").AdminAppointmentRow[] }>(
    `/api/appointments${qs ? `?${qs}` : ""}`
  );
}

export function createTimeSlot(body: { startAt: string; endAt: string }) {
  return api<{ slot: { id: number; startAt: string; endAt: string; isActive: boolean } }>(
    "/api/admin/time-slots",
    { method: "POST", body: JSON.stringify(body) }
  );
}

export function updateTimeSlot(
  id: number,
  body: { startAt?: string; endAt?: string; isActive?: boolean }
) {
  return api<{ slot: { id: number; startAt: string; endAt: string; isActive: boolean } }>(
    `/api/admin/time-slots/${id}`,
    { method: "PATCH", body: JSON.stringify(body) }
  );
}

export function deleteTimeSlot(id: number) {
  return api<void>(`/api/admin/time-slots/${id}`, { method: "DELETE", parse: "none" });
}

export function login(email: string, password: string) {
  return api<{ user: import("../types").User; token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string, name: string, role?: "user" | "admin") {
  return api<{ user: import("../types").User; token: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name, role }),
  });
}

export function validateAdminCode(code: string) {
  return api<{ id: number; adminId: number; code: string }>("/api/admin/codes/validate", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function getAdminCode() {
  return api<{ code: string }>("/api/admin/codes/my");
}
