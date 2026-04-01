import { useState, useCallback, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import * as api from "../api/client";
import type { TimeSlotListItem } from "../types";
import "./SimpleMonthCalendar.css";

type Props = {
  canBook: boolean;
  adminCodeId?: number;
  onSlotSelect: (slot: TimeSlotListItem) => void;
};

export function SimpleMonthCalendar({ canBook, adminCodeId, onSlotSelect }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slotsForDate, setSlotsForDate] = useState<TimeSlotListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [daysWithSlots, setDaysWithSlots] = useState<Set<number>>(new Set());

  const loadSlotsForDate = useCallback(
    async (date: Date) => {
      if (!canBook) return;
      setLoading(true);
      try {
        // Create date range for the entire calendar day in UTC
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        
        // Use date strings in UTC format: YYYYMMDDt00:00:00Z to YYYYMMDD T23:59:59Z
        const fromIso = `${year}-${month}-${day}T00:00:00Z`;
        const toIso = `${year}-${month}-${day}T23:59:59Z`;

        const { slots } = await api.getTimeSlots({
          from: fromIso,
          to: toIso,
          adminCodeId,
        });

        setSlotsForDate(slots);
        setSelectedDate(date);
      } catch (err) {
        console.error("Failed to load slots for date", err);
        setSlotsForDate([]);
      } finally {
        setLoading(false);
      }
    },
    [canBook, adminCodeId]
  );

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Load all slots for the current month
  useEffect(() => {
    const loadMonthSlots = async () => {
      if (!canBook) return;
      try {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const firstDay = "01";
        const lastDay = String(daysInMonth(currentDate)).padStart(2, "0");

        const fromIso = `${year}-${month}-${firstDay}T00:00:00Z`;
        const toIso = `${year}-${month}-${lastDay}T23:59:59Z`;

        const { slots } = await api.getTimeSlots({
          from: fromIso,
          to: toIso,
          adminCodeId,
        });

        // Group available slots by day
        const daysSet = new Set<number>();
        slots.forEach((slot) => {
          if (slot.available) {
            const slotDate = new Date(slot.startAt);
            daysSet.add(slotDate.getUTCDate());
          }
        });
        setDaysWithSlots(daysSet);
      } catch (err) {
        console.error("Failed to load month slots", err);
        setDaysWithSlots(new Set());
      }
    };
    loadMonthSlots();
  }, [currentDate, canBook, adminCodeId]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
    setSlotsForDate([]);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
    setSlotsForDate([]);
  };

  const handleDayClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    loadSlotsForDate(date);
  };

  const handleSlotSelect = (slot: TimeSlotListItem) => {
    if (slot.available && !slot.bookedByMe && canBook) {
      onSlotSelect(slot);
      setSelectedDate(null);
      setSlotsForDate([]);
    }
  };

  const monthName = currentDate.toLocaleString("en-US", { month: "long", year: "numeric" });
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth(currentDate); i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day-cell empty"></div>);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth(currentDate); day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const isToday = date.getTime() === today.getTime();
    const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
    const hasSlots = daysWithSlots.has(day);

    days.push(
      <button
        key={`day-${day}`}
        className={`calendar-day-button ${isToday ? "today" : ""} ${
          isSelected ? "selected" : ""
        } ${hasSlots ? "has-slots" : ""}`}
        onClick={() => handleDayClick(day)}
      >
        <span className="day-number">{day}</span>
      </button>
    );
  }

  return (
    <div className="simple-calendar">
      <div className="calendar-header">
        <button className="nav-button" onClick={goToPreviousMonth} aria-label="Previous month">
          <FaChevronLeft />
        </button>
        <h2 className="calendar-title">{monthName}</h2>
        <button className="nav-button" onClick={goToNextMonth} aria-label="Next month">
          <FaChevronRight />
        </button>
      </div>

      <div className="weekday-headers">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">{days}</div>

      {/* Time Slots Display */}
      {selectedDate && (
        <div className="slots-panel">
          <div className="slots-header">
            <h3>
              Available Times for {selectedDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </h3>
            <button
              className="close-button"
              onClick={() => {
                setSelectedDate(null);
                setSlotsForDate([]);
              }}
            >
              ✕
            </button>
          </div>

          {loading ? (
            <div className="slots-loading">Loading time slots...</div>
          ) : slotsForDate.length === 0 ? (
            <div className="no-slots">No available time slots for this day</div>
          ) : (
            <div className="slots-grid">
              {slotsForDate.map((slot) => {
                const isAvailable = slot.available && !slot.bookedByMe;
                const isBooked = slot.bookedByMe;
                const startTime = new Date(slot.startAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const endTime = new Date(slot.endAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <button
                    key={slot.id}
                    className={`slot-button ${isAvailable ? "available" : isBooked ? "booked-by-me" : "booked"}`}
                    onClick={() => handleSlotSelect(slot)}
                    disabled={!isAvailable || !canBook}
                    title={
                      isBooked
                        ? "Your booking"
                        : isAvailable
                          ? "Click to book"
                          : !slot.isActive
                            ? "Inactive"
                            : "Already booked"
                    }
                  >
                    <span className="time-range">
                      {startTime} - {endTime}
                    </span>
                    <span className="status-text">
                      {isBooked
                        ? "Your Booking"
                        : isAvailable
                          ? "Available"
                          : !slot.isActive
                            ? "Inactive"
                            : "Booked"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
