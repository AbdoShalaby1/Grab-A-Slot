import { type FormEvent, useCallback, useEffect, useState } from "react";
import { ApiError } from "../api/client";
import * as api from "../api/client";
import type { TimeSlotListItem } from "../types";
import "./Pages.css";

export function AdminSlotsPage() {
  const [slots, setSlots] = useState<TimeSlotListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { slots: s } = await api.getTimeSlots({});
      setSlots(s);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load slots");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!startAt || !endAt) return;
    setCreating(true);
    setError(null);
    try {
      await api.createTimeSlot({
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
      });
      setStartAt("");
      setEndAt("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(s: TimeSlotListItem) {
    setError(null);
    try {
      await api.updateTimeSlot(s.id, { isActive: !s.isActive });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  async function removeSlot(s: TimeSlotListItem) {
    if (!window.confirm("Delete this slot? Fails if it has a booking.")) return;
    setError(null);
    try {
      await api.deleteTimeSlot(s.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  if (!slots && !error) {
    return <p className="muted">Loading…</p>;
  }

  return (
    <div className="page-stack">
      <h1>Manage time slots</h1>
      {error && <p className="form-error">{error}</p>}

      <form className="form-card admin-create" onSubmit={onCreate}>
        <h2>New slot</h2>
        <div className="form-row">
          <label>
            Start
            <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
          </label>
          <label>
            End
            <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} required />
          </label>
        </div>
        <button type="submit" className="btn primary" disabled={creating}>
          {creating ? "Creating…" : "Add slot"}
        </button>
      </form>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Booking</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {slots?.map((s) => (
              <tr key={s.id}>
                <td>{new Date(s.startAt).toLocaleString()}</td>
                <td>{new Date(s.endAt).toLocaleString()}</td>
                <td>{s.isActive ? "Active" : "Inactive"}</td>
                <td>
                  {s.available ? "—" : s.bookedByMe ? "You" : "Booked"}
                </td>
                <td className="actions-cell">
                  <button type="button" className="btn small" onClick={() => toggleActive(s)}>
                    {s.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button type="button" className="btn small ghost" onClick={() => removeSlot(s)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
