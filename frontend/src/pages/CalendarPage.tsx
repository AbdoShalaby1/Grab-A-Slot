import { useCallback, useRef, useState } from "react";
import { FaCalendar, FaLock, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import { ApiError, bookAppointment } from "../api/client";
import { BookingCalendar, type BookingCalendarHandle } from "../components/BookingCalendar";
import { useAuth } from "../context/AuthContext";
import type { TimeSlotListItem } from "../types";

export function CalendarPage() {
  const { user } = useAuth();
  const calRef = useRef<BookingCalendarHandle>(null);
  const [country, setCountry] = useState("US");
  const [selected, setSelected] = useState<TimeSlotListItem | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  const onSlotSelect = useCallback((slot: TimeSlotListItem) => {
    setBookError(null);
    setSelected(slot);
  }, []);

  async function confirmBook() {
    if (!selected || !user) return;
    setBookError(null);
    setBooking(true);
    try {
      await bookAppointment(selected.id);
      setSelected(null);
      calRef.current?.refetch();
    } catch (err) {
      setBookError(err instanceof ApiError ? err.message : "Could not book");
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <FaCalendar /> Book a Slot
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Select any green time slot from the calendar to book an appointment. Red-tinted days show public holidays. Click on an available slot to confirm your booking.
        </p>
      </div>

      {/* Country Code Selector */}
      <div className="card w-full md:w-80">
        <label htmlFor="country" className="form-label">
          Holiday Country (ISO Code)
        </label>
        <input
          id="country"
          type="text"
          className="form-control uppercase"
          value={country}
          onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))}
          maxLength={2}
          placeholder="US"
          aria-label="Two-letter country code for holidays"
        />
        <p className="text-xs text-gray-500 mt-2">Enter a 2-letter country code (e.g., US, GB, DE)</p>
      </div>

      {/* Calendar Component */}
      <BookingCalendar
        ref={calRef}
        countryCode={country.length === 2 ? country : "US"}
        canBook={Boolean(user)}
        onSlotSelect={onSlotSelect}
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
                disabled={!user || booking}
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
