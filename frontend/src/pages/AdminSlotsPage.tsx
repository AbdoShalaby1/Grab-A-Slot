import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaCog,
  FaExclamationTriangle,
  FaPlus,
  FaCopy,
  FaCalendarAlt,
  FaUsers,
  FaChartBar,
  FaCircle,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";
import { ApiError } from "../api/client";
import * as api from "../api/client";
import type { TimeSlotListItem } from "../types";

export function AdminSlotsPage() {
  const [adminCode, setAdminCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [slots, setSlots] = useState<TimeSlotListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // New state management for separate date and time
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [validationError, setValidationError] = useState<string | null>(null);

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
    setValidationError(null);
    setError(null);

    // Validation
    if (!selectedDate || !startTime || !endTime) {
      setValidationError("Please select a date and times");
      return;
    }

    setCreating(true);
    try {
      const startAtIso = `${selectedDate}T${startTime}:00Z`;
      const endAtIso = `${selectedDate}T${endTime}:00Z`;

      await api.createTimeSlot({
        startAt: new Date(startAtIso).toISOString(),
        endAt: new Date(endAtIso).toISOString(),
      });

      // Reset form
      setSelectedDate("");
      setStartTime("09:00");
      setEndTime("10:00");
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
              <p className="text-sm text-gray-500">Share this code with clients so they can book appointments</p>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-2xl font-mono font-bold text-sky-400 bg-sky-400/10 px-4 py-2 rounded-lg">
                {adminCode}
              </code>
              <button
                onClick={copyCode}
                className="p-3 text-gray-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors cursor-pointer"
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

      {/* Create New Slot Form - Modern Design */}
      <div className="card bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FaPlus className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Create Time Slot</h2>
          </div>
          <p className="text-gray-400 text-sm ml-11">Add a new appointment slot for users to book</p>
        </div>

        <form onSubmit={onCreate} className="space-y-8">
          {/* Date Selection */}
          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-400" size={14} />
              Select Date
            </label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-950/50 border border-blue-500/30 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          {selectedDate && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">
                ✓ Selected: <span className="font-semibold">{new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
              </p>
            </div>
          )}

          {/* Time Selection */}
          {selectedDate && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                <FaClock className="text-cyan-400" size={14} />
                Time Range
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Start Time */}
                <div>
                  <label htmlFor="startTime" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                    Start Time
                  </label>
                  <input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      setValidationError(null);
                    }}
                    max={endTime || "23:59"}
                    className="w-full px-4 py-3 bg-gray-950/50 border border-cyan-500/30 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-center text-lg font-semibold"
                    required
                  />
                </div>

                {/* Arrow divider */}
                <div className="flex items-end justify-center pb-3">
                  <div className="flex items-center gap-2 text-gray-500">
                    <FaArrowRight size={16} />
                  </div>
                </div>
              </div>

              {/* End Time */}
              <div>
                <label htmlFor="endTime" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  End Time
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    setValidationError(null);
                  }}
                  min={startTime || "00:00"}
                  className="w-full px-4 py-3 bg-gray-950/50 border border-cyan-500/30 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-center text-lg font-semibold"
                  required
                />
              </div>
            </div>
          )}

          {/* Validation Error */}
          {validationError && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
              <FaExclamationTriangle className="text-yellow-400 flex-shrink-0" size={16} />
              <p className="text-sm text-yellow-300">{validationError}</p>
            </div>
          )}

          {/* Time Duration Display */}
          {selectedDate && startTime && endTime && endTime > startTime && (
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Duration</p>
                  <p className="text-lg font-bold text-green-400">
                    {Math.floor((parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]) - parseInt(startTime.split(":")[0]) * 60 - parseInt(startTime.split(":")[1])) / 60)} hours
                    {" "}
                    {(parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]) - parseInt(startTime.split(":")[0]) * 60 - parseInt(startTime.split(":")[1])) % 60} minutes
                  </p>
                </div>
                <div className="text-3xl text-green-400/20">✓</div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={creating || !selectedDate}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Slot…
              </>
            ) : (
              <>
                <FaPlus size={16} />
                Add Time Slot
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
                              <FaUsers /> Your Booking
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
