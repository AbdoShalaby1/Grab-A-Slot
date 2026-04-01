import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendar, FaLock, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import { ApiError, bookAppointment, validateAdminCode } from "../api/client";
import { SimpleMonthCalendar } from "../components/SimpleMonthCalendar";
import { useAuth } from "../context/AuthContext";
import type { TimeSlotListItem } from "../types";

export function CalendarPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<TimeSlotListItem | null>(null);
  const [adminCode, setAdminCode] = useState("");
  const [bookError, setBookError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);

  // Redirect admins to their dashboard
  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin/slots", { replace: true });
    }
  }, [user, navigate]);

  async function confirmBook() {
    if (!selected || !user || !adminCode.trim()) return;
    setBookError(null);
    setBooking(true);
    try {
      // Validate the admin code and get its ID
      const codeData = await validateAdminCode(adminCode.trim());
      // Book the appointment with the code ID
      await bookAppointment(selected.id, codeData.id);
      setSelected(null);
      setAdminCode("");
      setRefetchKey((prev) => prev + 1);
    } catch (err) {
      setBookError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Could not book");
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <FaCalendar /> Book an Appointment
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Click on a day to view available time slots. Green is available, blue is today. Click a time slot to book.
        </p>
      </div>

      {/* Admin Code Input - Visible before booking */}
      {user && (
        <div className="card bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 max-w-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white mb-1">Admin Code Required</p>
              <p className="text-sm text-gray-400">Enter the booking code provided by the administrator to reserve an appointment</p>
            </div>
            <input
              type="text"
              className="form-control w-32"
              placeholder="Enter code"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value.toUpperCase())}
              maxLength={10}
            />
          </div>
        </div>
      )}

      {/* Calendar Component */}
      <SimpleMonthCalendar
        key={refetchKey}
        canBook={Boolean(user) && Boolean(adminCode)}
        onSlotSelect={(slot) => {
          setBookError(null);
          setSelected(slot);
        }}
      />

      {/* Booking Modal */}
      {selected && (
        <div className="modal-backdrop" role="presentation" onClick={() => !booking && setSelected(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="book-title" className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
              <FaCalendar /> Confirm Booking
            </h2>

            <div className="bg-gray-700/50 rounded-lg p-4 mb-4 border border-gray-600">
              <p className="text-sm text-gray-300 mb-2">Requested Time Slot</p>
              <p className="text-lg font-semibold text-white">
                {new Date(selected.startAt).toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                –{" "}
                {new Date(selected.endAt).toLocaleString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {adminCode && (
              <div className="bg-green-500/10 rounded-lg p-3 mb-4 border border-green-500/30">
                <p className="text-sm text-green-400 flex items-center gap-2">
                  ✓ Admin code verified: {adminCode}
                </p>
              </div>
            )}

            {!user && (
              <div className="alert alert-error mb-4 flex items-center gap-2">
                <FaLock /> You must be signed in to book this slot
              </div>
            )}

            {bookError && (
              <div className="alert alert-error mb-4 flex items-center gap-2">
                <FaExclamationTriangle /> {bookError}
              </div>
            )}

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelected(null)}
                disabled={booking}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmBook}
                disabled={!user || booking || !adminCode.trim()}
              >
                {booking ? (
                  <>
                    <FaSpinner className="inline-block animate-spin" />
                    Booking…
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
