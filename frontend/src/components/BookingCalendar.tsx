import type { EventInput, EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import * as api from "../api/client";
import type { TimeSlotListItem } from "../types";
import "./BookingCalendar.css";

function slotToEvent(s: TimeSlotListItem): EventInput {
  let title = "Unavailable";
  let statusBadge = "⊘";
  let color = "#6b7280";
  if (!s.isActive) {
    title = "Inactive";
    statusBadge = "⊗";
    color = "#4b5563";
  } else if (s.bookedByMe) {
    title = "Your Booking";
    statusBadge = "✓";
    color = "#2563eb";
  } else if (s.available) {
    title = "Available";
    statusBadge = "✕";
    color = "#059669";
  } else {
    title = "Booked";
    statusBadge = "✗";
    color = "#9ca3af";
  }
  return {
    id: `slot-${s.id}`,
    title: `${statusBadge} ${title}`,
    start: s.startAt,
    end: s.endAt,
    backgroundColor: color,
    borderColor: color,
    extendedProps: { slot: s },
  };
}

export type BookingCalendarHandle = { refetch: () => void };

type Props = {
  canBook: boolean;
  onSlotSelect: (slot: TimeSlotListItem) => void;
  onEventsLoaded?: () => void;
};

export const BookingCalendar = forwardRef<BookingCalendarHandle, Props>(function BookingCalendar(
  { canBook, onSlotSelect, onEventsLoaded },
  ref
) {
  const calRef = useRef<FullCalendar>(null);
  const toApiDateTime = useCallback((input: string) => new Date(input).toISOString(), []);

  useImperativeHandle(ref, () => ({
    refetch: () => calRef.current?.getApi().refetchEvents(),
  }));

  const loadEvents = useCallback(
    async (info: { startStr: string; endStr: string }): Promise<EventInput[]> => {
      const fromIso = toApiDateTime(info.startStr);
      const toIso = toApiDateTime(info.endStr);
      const { slots } = await api.getTimeSlots({ from: fromIso, to: toIso });

      onEventsLoaded?.();
      return slots.map(slotToEvent);
    },
    [onEventsLoaded, toApiDateTime]
  );

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const slot = arg.event.extendedProps.slot as TimeSlotListItem | undefined;
      if (!slot || !canBook) return;
      if (slot.available && !slot.bookedByMe) {
        onSlotSelect(slot);
      }
    },
    [canBook, onSlotSelect]
  );

  return (
    <div className="booking-calendar-wrap">
      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        allDaySlot={true}
        height="auto"
        events={(info, successCallback) => {
          loadEvents({ startStr: info.startStr, endStr: info.endStr })
            .then(successCallback)
            .catch((err) => {
              console.error("Failed to load calendar events", err);
              successCallback([]);
            });
        }}
        eventClick={handleEventClick}
      />
    </div>
  );
});

BookingCalendar.displayName = "BookingCalendar";
