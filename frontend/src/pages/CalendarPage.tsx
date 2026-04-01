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
  const [validatedAdminCodeId, setValidatedAdminCodeId] = useState<number | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [validateError, setValidateError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);

  // Redirect admins to their dashboard
  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin/slots", { replace: true });
    }
  }, [user, navigate]);

  async function handleValidateAdminCode() {
    if (!adminCode.trim()) return;
    setValidateError(null);
    setValidating(true);
    try {
      const codeData = await validateAdminCode(adminCode.trim());
      setValidatedAdminCodeId(codeData.id);
    } catch (err) {
      setValidateError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Invalid admin code");
      setAdminCode("");
      setValidatedAdminCodeId(null);
    } finally {
      setValidating(false);
    }
  }

  function handleClearAdminCode() {
    setAdminCode("");
    setValidatedAdminCodeId(null);
    setValidateError(null);
    setSelected(null);
    setRefetchKey((prev) => prev + 1);
  }

  async function confirmBook() {
    if (!selected || !user || !validatedAdminCodeId) return;
    setBookError(null);
    setBooking(true);
    try {
      // Book the appointment with the validated code ID
      await bookAppointment(selected.id, validatedAdminCodeId);
      setSelected(null);
      setAdminCode("");
      setValidatedAdminCodeId(null);
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

      {/* Admin Code Input - Visible before validation */}
      {user && validatedAdminCodeId === null && (
        <div className="card bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 max-w-2xl">
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-white mb-1">Admin Code Required</p>
              <p className="text-sm text-gray-400">Enter the booking code provided by the administrator to reserve an appointment</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                className="form-control flex-1"
                placeholder="Enter code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value.toUpperCase())}
                maxLength={10}
                disabled={validating}
              />
              <button
                onClick={handleValidateAdminCode}
                disabled={!adminCode.trim() || validating}
                className="btn btn-primary"
              >
                {validating ? (
                  <>
                    <FaSpinner className="inline-block animate-spin" />
                    Validating…
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
            {validateError && (
              <div className="alert alert-error flex items-center gap-2">
                <FaExclamationTriangle /> {validateError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Code Validated - Show selected code */}
      {user && validatedAdminCodeId !== null && (
        <div className="card bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 max-w-2xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <div>
                <p className="font-semibold text-white">Admin Code Verified</p>
                <p className="text-sm text-gray-400">Code: <span className="font-mono font-bold text-green-400">{adminCode}</span></p>
              </div>
            </div>
            <button
              onClick={handleClearAdminCode}
              className="btn btn-secondary btn-small"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Calendar Component - Only show after admin code is validated */}
      {validatedAdminCodeId !== null && (
        <SimpleMonthCalendar
          key={refetchKey}
          canBook={Boolean(user)}
          adminCodeId={validatedAdminCodeId}
          onSlotSelect={(slot) => {
            setBookError(null);
            setSelected(slot);
          }}
        />
      )}

      {/* Booking Modal */}
      {selected && (
        <div className="modal-backdrop cursor-pointer" role="presentation" onClick={() => !booking && setSelected(null)}>
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

            {validatedAdminCodeId && (
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
                disabled={!user || booking || !validatedAdminCodeId}
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
