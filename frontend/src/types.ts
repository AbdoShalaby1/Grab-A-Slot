export type Role = "user" | "admin";

export type User = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

export type TimeSlotListItem = {
  id: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  available: boolean;
  bookedByMe: boolean;
  appointmentId: number | null;
};

export type AppointmentRow = {
  id: number;
  createdAt: string;
  timeSlot: {
    id: number;
    startAt: string;
    endAt: string;
    isActive?: boolean;
  };
};

export type AdminAppointmentRow = AppointmentRow & {
  user: { id: number; email: string; name: string };
};

export type HolidayItem = { date: string; localName: string; name: string };
