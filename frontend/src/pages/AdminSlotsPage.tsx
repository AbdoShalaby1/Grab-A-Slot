import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaCog,
  FaExclamationTriangle,
  FaPlus,
  FaCopy,
} from "react-icons/fa";
import { ApiError } from "../api/client";
import * as api from "../api/client";
import type { TimeSlotListItem } from "../types";

export function AdminSlotsPage() {
  const [adminCode, setAdminCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [slots, setSlots] = useState<TimeSlotListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.getAdminCode()
      .then(res => setAdminCode(res.code))
      .catch(() => {/* silently fail */});
  }, []);

  function copyCode() {
    if (adminCode) {
      navigator.clipboard.writeText(adminCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  }

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
    if (!window.confirm("Delete this slot? This fails if the slot has a booking.")) return;
    setError(null);
    try {
      await api.deleteTimeSlot(s.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  if (!slots && !error) {
    return (
      <div className="space-y-4">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <FaCog /> Manage Time Slots
        </h1>
        <div className="state-loading">Loading slots...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <FaCog /> Manage Time Slots
        </h1>
        <p className="text-gray-400">Create, activate, and manage appointment time slots</p>
      </div>

      {adminCode && (
        <div className="card bg-gradient-to-r from-sky-500/10 to-blue-500/10 border-sky-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300 mb-2">Your Booking Code</p>
              <p className="text-sm text-gray-500">Share this code with patients so they can book appointments</p>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-2xl font-mono font-bold text-sky-400 bg-sky-400/10 px-4 py-2 rounded-lg">
                {adminCode}
              </code>
              <button
                onClick={copyCode}
                className="p-3 text-gray-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                title="Copy code"
              >
                {codeCopied ? (
                  <FaCheckCircle className="text-green-400" />
                ) : (
                  <FaCopy size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span className="flex items-center gap-2">
            <FaExclamationTriangle /> {error}
          </span>
        </div>
      )}

      {/* Create New Slot Form */}
      <div className="card max-w-2xl">
        <h2 className="card-title mb-6">Create New Time Slot</h2>
        <form onSubmit={onCreate} className="space-y-6">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startAt" className="form-label">
                Start Time
              </label>
              <input
                id="startAt"
                type="datetime-local"
                className="form-control"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endAt" className="form-label">
                End Time
              </label>
              <input
                id="endAt"
                type="datetime-local"
                className="form-control"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={creating}>
            {creating ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-loader" />
                Creating…
              </>
            ) : (
              <>
                <FaPlus />
                Add Slot
              </>
            )}
          </button>
        </form>
      </div>

      {/* Slots List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Slots</h2>
        {slots && slots.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-400">No time slots yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-700 shadow-lg">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt /> Start
                    </span>
                  </th>
                  <th>
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt /> End
                    </span>
                  </th>
                  <th>
                    <span className="flex items-center gap-1">
                      <FaChartBar /> Status
                    </span>
                  </th>
                  <th>
                    <span className="flex items-center gap-1">
                      <FaUsers /> Booking
                    </span>
                  </th>
                  <th>
                    <span className="flex items-center gap-1">
                      <FaCog /> Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {slots?.map((s) => {
                  const startDate = new Date(s.startAt);
                  const endDate = new Date(s.endAt);

                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="space-y-1">
                          <p className="font-semibold text-white text-sm">
                            {startDate.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-gray-400">
                            {startDate.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm text-gray-300">
                          {endDate.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            s.isActive ? "badge-success" : "badge-gray"
                          }`}
                        >
                          {s.isActive ? (
                            <>
                              <FaCheckCircle /> Active
                            </>
                          ) : (
                            <>
                              <FaCircle /> Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm">
                          {s.available ? (
                            <span className="text-green-400 flex items-center gap-1">
                              <FaCheckCircle /> Available
                            </span>
                          ) : s.bookedByMe ? (
                            <span className="text-blue-400 flex items-center gap-1">
                              <FaUser /> You
                            </span>
                          ) : (
                            <span className="text-gray-400">— Booked</span>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary btn-small"
                            onClick={() => toggleActive(s)}
                          >
                            {s.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-small"
                            onClick={() => removeSlot(s)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
