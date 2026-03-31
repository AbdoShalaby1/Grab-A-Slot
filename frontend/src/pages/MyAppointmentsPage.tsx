import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import * as api from "../api/client";
import type { AppointmentRow } from "../types";
import "./Pages.css";

export function MyAppointmentsPage() {
  const [rows, setRows] = useState<AppointmentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState<number | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const { appointments } = await api.getMyAppointments();
      setRows(appointments);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { appointments } = await api.getMyAppointments();
        if (!cancelled) setRows(appointments);
      } catch (e) {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCancel(appointmentId: number) {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
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
    return <p className="form-error">{error}</p>;
  }
  if (!rows) {
    return <p className="muted">Loading…</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="page-stack">
        <h1>My appointments</h1>
        <p className="muted">You have no bookings yet.</p>
        <Link className="btn primary" to="/calendar">
          Book a slot
        </Link>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <h1>My appointments</h1>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Slot ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>
                  {new Date(a.timeSlot.startAt).toLocaleString()} –{" "}
                  {new Date(a.timeSlot.endAt).toLocaleString()}
                </td>
                <td>{a.timeSlot.id}</td>
                <td>
                  <button
                    className="btn ghost"
                    onClick={() => handleCancel(a.id)}
                    disabled={canceling === a.id}
                  >
                    {canceling === a.id ? "Canceling…" : "Cancel"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link className="btn" to="/calendar">
        Book another
      </Link>
    </div>
  );
}
