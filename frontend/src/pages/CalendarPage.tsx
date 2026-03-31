import { useCallback, useRef, useState } from "react";
import { ApiError, bookAppointment } from "../api/client";
import { BookingCalendar, type BookingCalendarHandle } from "../components/BookingCalendar";
import { useAuth } from "../context/AuthContext";
import type { TimeSlotListItem } from "../types";
import "./Pages.css";

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
    <div className="page-stack">
      <div className="page-head">
        <h1>Book a slot</h1>
        <p className="muted">
          Green slots are free. Click one to book (log in required). Red-tinted days show public holidays ({country}).
        </p>
        <label className="inline-field">
          Holiday country (ISO)
          <input
            className="country-input"
            value={country}
            onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))}
            maxLength={2}
            aria-label="Two-letter country code for holidays"
          />
        </label>
      </div>
      <BookingCalendar
        ref={calRef}
        countryCode={country.length === 2 ? country : "US"}
        canBook={Boolean(user)}
        onSlotSelect={onSlotSelect}
      />

      {selected && (
        <div className="modal-backdrop" role="presentation" onClick={() => !booking && setSelected(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="book-title">Confirm booking</h2>
            <p>
              {new Date(selected.startAt).toLocaleString()} – {new Date(selected.endAt).toLocaleString()}
            </p>
            {!user && <p className="form-error">Log in to book this slot.</p>}
            {bookError && <p className="form-error">{bookError}</p>}
            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={() => setSelected(null)} disabled={booking}>
                Cancel
              </button>
              <button type="button" className="btn primary" onClick={confirmBook} disabled={!user || booking}>
                {booking ? "Booking…" : "Book"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
