import { type FormEvent, useCallback, useEffect, useState } from "react";
import { ApiError } from "../api/client";
import * as api from "../api/client";
import type { AdminAppointmentRow } from "../types";
import "./Pages.css";

export function AdminBookingsPage() {
  const [rows, setRows] = useState<AdminAppointmentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBookings = useCallback(async (fromIso?: string, toIso?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { appointments } = await api.getAllAppointments(fromIso, toIso);
      setRows(appointments);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  function onFilter(e: FormEvent) {
    e.preventDefault();
    fetchBookings(
      from ? new Date(from).toISOString() : undefined,
      to ? new Date(to).toISOString() : undefined
    );
  }

  return (
    <div className="page-stack">
      <h1>All bookings</h1>
      <form className="filter-bar" onSubmit={onFilter}>
        <label>
          From
          <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          To
          <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? "Loading…" : "Apply filter"}
        </button>
        <button
          type="button"
          className="btn ghost"
          disabled={loading}
          onClick={() => {
            setFrom("");
            setTo("");
            fetchBookings();
          }}
        >
          Clear and reload all
        </button>
      </form>
      {error && <p className="form-error">{error}</p>}
      {loading && rows === null && <p className="muted">Loading…</p>}
      {rows && rows.length === 0 && !loading && <p className="muted">No bookings yet.</p>}
      {rows && rows.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Slot</th>
                <th>Booked at</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td>{a.user.name}</td>
                  <td>{a.user.email}</td>
                  <td>
                    {new Date(a.timeSlot.startAt).toLocaleString()} –{" "}
                    {new Date(a.timeSlot.endAt).toLocaleString()}
                  </td>
                  <td>{new Date(a.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
