import { EVENT_TYPES } from "../utils/eventTypes";

export default function EventsPanel({
  todayEvents,       // all events scheduled for today
  remainingEvents    // events that are not yet completed
}) {

  // Build a quick lookup of remaining (not completed) event IDs
  const remainingIds = new Set(remainingEvents.map(e => e.id));

  // If there are no events today, show a message
  if (!todayEvents.length) {
    return <p style={{ color: "#64748b" }}>No events today.</p>;
  }

  // Sort events by start time (earliest first)
  const sortedEvents = [...todayEvents].sort((a, b) => {
    const aTime = new Date(`${a.date}T${a.startTime}`).getTime();
    const bTime = new Date(`${b.date}T${b.startTime}`).getTime();
    return aTime - bTime;
  });

  return (
    <div className="events-panel">
      {sortedEvents.map(e => {
        // An event is completed if it is NOT in remainingEvents
        const isCompleted = !remainingIds.has(e.id);

        return (
          <div
            key={e.id}
            className={`event-card ${isCompleted ? "completed" : ""}`}
            style={{
              // Color stripe based on event type
              borderLeft: `6px solid ${EVENT_TYPES[e.type].color}`
            }}
          >
            {/* Event title */}
            <h4>{e.title}</h4>

            {/* Event time range */}
            <p>
              {e.startTime} – {e.endTime}
            </p>

            {/* Event type label */}
            <span className="event-type">
              {EVENT_TYPES[e.type].label}
            </span>

            {/* Completed indicator */}
            {isCompleted && (
              <span className="completed-label">
                Completed
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
