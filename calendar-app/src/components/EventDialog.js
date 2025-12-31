import { useState } from "react";
import { isOverlapping } from "../utils/calendarUtils";
import { EVENT_TYPES } from "../utils/eventTypes";

export default function EventDialog({ events, onSave }) {

  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [type, setType] = useState("REMINDER");

  // Error message shown to user
  const [error, setError] = useState("");


  // Checks if a given date/time is in the past
  function isPast(date) {
    return date < new Date();
  }


 // Validate input and trigger save
  const save = () => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Prevent creating events in the past
    if (isPast(startDate)) {
      setError("Event cannot start in the past");
      return;
    }

    // End must be after start
    if (startDate >= endDate) {
      setError("End time must be after start time");
      return;
    }

    // Build event object
    const event = {
      title,
      start: startDate,
      end: endDate,
      type
    };

    // Check for overlap with existing events
    if (isOverlapping(event, events)) {
      setError("Overlapping event");
      return;
    }

    // Pass valid event back to parent
    onSave(event);
  };

  return (
    <>
      {/* Validation error */}
      {error && <p className="error">{error}</p>}

      {/* Event title */}
      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      {/* Event type selector */}
      <select value={type} onChange={e => setType(e.target.value)}>
        {Object.entries(EVENT_TYPES).map(([key, val]) => (
          <option key={key} value={key}>
            {val.label}
          </option>
        ))}
      </select>

      {/* Start date & time */}
      <input
        type="datetime-local"
        min={new Date().toISOString().slice(0, 16)}
        onChange={e => setStart(e.target.value)}
      />

      {/* End date & time */}
      <input
        type="datetime-local"
        onChange={e => setEnd(e.target.value)}
      />

      {/* Save action */}
      <button onClick={save}>Save</button>
    </>
  );
}
