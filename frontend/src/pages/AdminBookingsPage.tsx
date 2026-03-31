import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaChartBar,
  FaEnvelope,
  FaExclamationTriangle,
  FaInbox,
  FaSearch,
  FaUser,
} from "react-icons/fa";
import { ApiError } from "../api/client";
import * as api from "../api/client";
import type { AdminAppointmentRow } from "../types";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <FaChartBar /> All Bookings
        </h1>
        <p className="text-gray-400">View and manage all user appointments</p>
      </div>

      {/* Filter Form */}
      <div className="card max-w-3xl">
        <h2 className="card-title mb-6">Filter Bookings</h2>
        <form onSubmit={onFilter} className="space-y-6">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="from" className="form-label">
                From Date
              </label>
              <input
                id="from"
                type="datetime-local"
                className="form-control"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="to" className="form-label">
                To Date
              </label>
              <input
                id="to"
                type="datetime-local"
                className="form-control"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-loader" />
                  Filtering…
                </>
              ) : (
                <>
                  <FaSearch />
                  Apply Filter
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={loading}
              onClick={() => {
                setFrom("");
                setTo("");
                fetchBookings();
              }}
            >
              Clear & Reset
            </button>
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          <span className="flex items-center gap-2">
            <FaExclamationTriangle /> {error}
          </span>
        </div>
      )}

      {/* Loading State */}
      {loading && rows === null && (
        <div className="card text-center py-12">
          <div className="state-loading">Loading bookings...</div>
        </div>
      )}

      {/* Empty State */}
      {rows && rows.length === 0 && !loading && (
        <div className="empty-state-container">
          <div className="empty-state-icon">
            <FaInbox />
          </div>
          <h3 className="empty-state-title">No Bookings Found</h3>
          <p className="empty-state-text">No appointments match your filter criteria. Try adjusting your dates.</p>
        </div>
      )}

      {/* Bookings Table */}
      {rows && rows.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Total: <span className="text-sky-400">{rows.length}</span> Appointments
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-700 shadow-lg">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <span className="flex items-center gap-1">
                      <FaUser /> User
                    </span>
                  </th>
                  <th>
                    <span className="flex items-center gap-1">
                      <FaEnvelope /> Email
                    </span>
                  </th>
                  <th>
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt /> Appointment
                    </span>
                  </th>
                  <th>
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt /> Booked At
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => {
                  const slotStart = new Date(a.timeSlot.startAt);
                  const slotEnd = new Date(a.timeSlot.endAt);
                  const bookedAt = new Date(a.createdAt);

                  return (
                    <tr key={a.id}>
                      <td className="font-semibold text-white">{a.user.name}</td>
                      <td className="font-mono text-sky-400 text-sm">{a.user.email}</td>
                      <td>
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-white">
                            {slotStart.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-gray-400">
                            {slotStart.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            –{" "}
                            {slotEnd.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="text-sm text-gray-400">
                        {bookedAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "2-digit",
                        })}
                        {" "}
                        {bookedAt.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
