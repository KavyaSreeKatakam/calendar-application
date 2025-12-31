import { EVENT_TYPES } from "../utils/eventTypes";

// Hours displayed on the calendar (0–23)
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Mapping: 1 pixel = 1 minute (since 60px = 60 minutes)
const MINUTES_PER_PIXEL = 1;

// Checks if the given date is in the past
function isPastDay(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  return day < today;
}

export default function DayView({
  date,
  events,
  onEventRightClick,
  onTimeSlotClick,
  onEventClick
}) {
  // Whether the selected day is in the past
  const pastDay = isPastDay(date);

  /**
   * Handles clicking on an empty part of the grid
   * Converts click position into hour + minute
   */
  const handleGridClick = (e) => {
    if (pastDay) return;

    // Ignore clicks on existing events
    if (e.target.closest(".event-bar")) return;

    const scrollContainer = e.currentTarget;
    const rect = scrollContainer.getBoundingClientRect();

    // Y position inside the scrollable grid
    const clickY =
      e.clientY - rect.top + scrollContainer.scrollTop;

    // Convert Y position to minutes from midnight
    const minutesFromMidnight = Math.max(
      0,
      Math.min(1439, Math.floor(clickY * MINUTES_PER_PIXEL))
    );

    const hour = Math.floor(minutesFromMidnight / 60);
    const minute = minutesFromMidnight % 60;

    // Notify parent to open Add Event modal
    onTimeSlotClick({ hour, minute });
  };

  return (
    <div className="day-view">
      <div className="day-view-sticky-stack">
        <div className="day-view-header">
          <h3>{date.toDateString()}</h3>
        </div>

        <div className="day-grid-sticky">
          <div
            className={`day-grid-scroll ${pastDay ? "disabled" : ""}`}
            onClick={handleGridClick}
          >
            {/* Time labels column */}
            <div className="time-column">
              {HOURS.map(h => (
                <div key={h} className="time-label">
                  {h}:00
                </div>
              ))}
            </div>

            {/* Events canvas */}
            <div className="events-column">
              {/* Hour background slots */}
              {HOURS.map(h => (
                <div key={h} className="hour-slot" />
              ))}

              {/* Render each event */}
              {events.map(e => {
                const startMinutes =
                  e.start.getHours() * 60 + e.start.getMinutes();
                const endMinutes =
                  e.end.getHours() * 60 + e.end.getMinutes();

                return (
                  <div
                    key={`${e.title}-${e.start.toISOString()}`}
                    className="event-bar clickable"
                    style={{
                      top: startMinutes,
                      height: endMinutes - startMinutes,
                      borderLeft: `6px solid ${EVENT_TYPES[e.type].color}`
                    }}
                    onClick={evt => {
                      evt.stopPropagation();
                      onEventClick(e); // view-only modal
                    }}
                    onContextMenu={evt => {
                      if (pastDay) return;

                      evt.preventDefault();
                      evt.stopPropagation();
                      onEventRightClick(e, evt); // edit/delete menu
                    }}
                  >
                    <b>{e.title}</b>
                    <div className="event-type">
                      {EVENT_TYPES[e.type].label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
