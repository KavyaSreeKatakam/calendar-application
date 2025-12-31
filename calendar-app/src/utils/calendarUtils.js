export function isOverlapping(newEvent, events) {
  return events.some(event => {
    if (event.date !== newEvent.date) return false;

    return (
      newEvent.startTime < event.endTime &&
      newEvent.endTime > event.startTime
    );
  });
}

export function getRemainingEventsForToday(events) {
  const now = new Date();
  return events.filter(e => e.start > now);
}

export function findNextAvailableSlot(events, date, durationMinutes) {
  const WORK_START_HOUR = 9;
  const WORK_END_HOUR = 17;

  const dayStart = new Date(date);
  dayStart.setHours(WORK_START_HOUR, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(WORK_END_HOUR, 0, 0, 0);

  // If today, start from current minute (not 9 AM)
  const now = new Date();
  now.setSeconds(0, 0);

  let cursor =
    dayStart.toDateString() === now.toDateString() && now > dayStart
      ? now
      : dayStart;

  // Get events only for that day and sort them
  const dayEvents = events
    .filter(
      e => e.start.toDateString() === dayStart.toDateString()
    )
    .sort((a, b) => a.start - b.start);

  for (const event of dayEvents) {
    const slotEnd = new Date(cursor.getTime() + durationMinutes * 60000);

    // Slot must fit before this event starts
    if (slotEnd <= event.start) {
      return {
        start: cursor,
        end: slotEnd
      };
    }

    // Move cursor past this event if overlapping
    if (cursor < event.end) {
      cursor = new Date(event.end.getTime() + 60000);
    }
  }

  // Check after last event
  const finalSlotEnd = new Date(cursor.getTime() + durationMinutes * 60000);

  if (finalSlotEnd <= dayEnd) {
    return {
      start: cursor,
      end: finalSlotEnd
    };
  }

  // No slot found
  return null;
}

