import type { EventInput, EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import * as api from "../api/client";
import type { HolidayItem, TimeSlotListItem } from "../types";
import "./BookingCalendar.css";

function slotToEvent(s: TimeSlotListItem): EventInput {
  let title = "Unavailable";
  let color = "#6b7280";
  if (!s.isActive) {
    title = "Inactive";
    color = "#4b5563";
  } else if (s.bookedByMe) {
    title = "Your booking";
    color = "#2563eb";
  } else if (s.available) {
    title = "Available";
    color = "#059669";
  } else {
    title = "Booked";
    color = "#9ca3af";
  }
  return {
    id: `slot-${s.id}`,
    title,
    start: s.startAt,
    end: s.endAt,
    backgroundColor: color,
    borderColor: color,
    extendedProps: { slot: s },
  };
}

export type BookingCalendarHandle = { refetch: () => void };

type Props = {
  countryCode: string;
  canBook: boolean;
  onSlotSelect: (slot: TimeSlotListItem) => void;
  onEventsLoaded?: () => void;
};

export const BookingCalendar = forwardRef<BookingCalendarHandle, Props>(function BookingCalendar(
  { countryCode, canBook, onSlotSelect, onEventsLoaded },
  ref
) {
  const calRef = useRef<FullCalendar>(null);

  useImperativeHandle(ref, () => ({
    refetch: () => calRef.current?.getApi().refetchEvents(),
  }));

  const loadEvents = useCallback(
    async (info: { startStr: string; endStr: string }): Promise<EventInput[]> => {
      const [{ slots }, holidaysRes] = await Promise.all([
        api.getTimeSlots({ from: info.startStr, to: info.endStr }),
        api
          .getHolidays(new Date(info.startStr).getFullYear(), countryCode)
          .catch(() => ({ holidays: [] as HolidayItem[] })),
      ]);

      const holidayEvents: EventInput[] = (holidaysRes.holidays ?? []).map((h) => ({
        id: `holiday-${h.date}-${h.name}`,
        title: h.localName,
        start: h.date,
        allDay: true,
        display: "background",
        classNames: ["fc-holiday-bg"],
      }));

      onEventsLoaded?.();
      return [...holidayEvents, ...slots.map(slotToEvent)];
    },
    [countryCode, onEventsLoaded]
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
        events={(info, successCallback, failureCallback) => {
          loadEvents({ startStr: info.startStr, endStr: info.endStr })
            .then(successCallback)
            .catch(failureCallback);
        }}
        eventClick={handleEventClick}
      />
    </div>
  );
});

BookingCalendar.displayName = "BookingCalendar";
