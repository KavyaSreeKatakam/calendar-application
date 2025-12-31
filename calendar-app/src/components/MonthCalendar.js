import { EVENT_TYPES } from "../utils/eventTypes";

export default function MonthCalendar({ selectedDate, onSelectDate, events }) {
  // Extract current year and month from selected date
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // First day of the month (used to align the calendar)
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay(); // 0 (Sun) → 6 (Sat)

  // Total number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build calendar cells (null = empty slot before month starts)
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="month-grid">
      {/* Day headers */}
      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
        <div key={d} className="day-header">{d}</div>
      ))}

      {/* Calendar cells */}
      {cells.map((day, idx) => {
        // Filter events that belong to this day
        const dayEvents = events.filter(
          e =>
            day &&
            e.start.getDate() === day &&
            e.start.getMonth() === month
        );

        return (
          <div
            key={idx}
            className={`month-cell ${day ? "clickable" : ""}`}
            // Clicking a valid day switches to DayView
            onClick={() => day && onSelectDate(new Date(year, month, day))}
          >
            {/* Date number */}
            <div className="date-number">{day}</div>

            {/* Show up to 3 event indicators */}
            {dayEvents.slice(0, 3).map((e, i) => (
              <div
                key={i}
                className="event-dot"
                // Color based on event type
                style={{ background: EVENT_TYPES[e.type].color }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
