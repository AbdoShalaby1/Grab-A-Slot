import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaSpinner, FaCalendar, FaTrash, FaInbox, FaClipboardList } from "react-icons/fa";
import { ApiError } from "../api/client";
import * as api from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { AppointmentRow } from "../types";

export function MyAppointmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<AppointmentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState<number | null>(null);

  // Redirect admins away from their appointments page
  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin/slots", { replace: true });
    }
  }, [user, navigate]);

  const fetchAppointments = useCallback(async () => {
    try {
      const { appointments } = await api.getMyAppointments();
      setRows(appointments);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    void fetchAppointments();
  }, [fetchAppointments]);

  async function handleCancel(appointmentId: number) {
    if (!confirm("Are you sure you want to cancel this appointment? This action cannot be undone.")) return;
    setCanceling(appointmentId);
    setError(null);
    try {
      await api.cancelAppointment(appointmentId);
      await fetchAppointments();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to cancel");
    } finally {
      setCanceling(null);
    }
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <FaClipboardList /> My Appointments
        </h1>
        <div className="alert alert-error flex items-center gap-2">
          <FaExclamationTriangle /> {error}
        </div>
      </div>
    );
  }

  if (!rows) {
    return (
      <div className="space-y-4">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <FaClipboardList /> My Appointments
        </h1>
        <div className="state-loading">
          <FaSpinner className="inline-block animate-spin" /> Loading appointments...
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <FaClipboardList /> My Appointments
        </h1>
        <div className="empty-state-container">
          <FaInbox className="text-6xl mb-4 opacity-50" />
          <h3 className="empty-state-title">No Appointments Yet</h3>
          <p className="empty-state-text">You haven't booked any appointments yet. Browse available slots and make your first booking.</p>
          <Link to="/calendar" className="btn btn-primary mt-6 flex items-center justify-center gap-2">
            <FaCalendar /> Browse Available Slots
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <FaClipboardList /> My Appointments
        </h1>
        <p className="text-gray-400">Manage your upcoming and past appointments</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-700 shadow-lg">
        <table className="data-table">
          <thead>
            <tr>
              <th className="flex items-center gap-1">
                <FaCalendar /> When
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const startDate = new Date(row.timeSlot.startAt);
              const endDate = new Date(row.timeSlot.endAt);
              const isPast = endDate < new Date();

              return (
                <tr key={row.id} className={isPast ? "opacity-60" : ""}>
                  <td>
                    <div className="space-y-1">
                      <p className="font-semibold text-white">
                        {startDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-400">
                        {startDate.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {endDate.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleCancel(row.id)}
                      disabled={canceling === row.id || isPast}
                      className="btn btn-danger btn-small flex items-center gap-1"
                    >
                      {canceling === row.id ? (
                        <>
                          <FaSpinner className="inline-block animate-spin" />
                          Canceling…
                        </>
                      ) : isPast ? (
                        <>Completed</>
                      ) : (
                        <>
                          <FaTrash /> Cancel
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
