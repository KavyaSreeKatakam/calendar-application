import { useState, useEffect } from "react";
import { EVENT_TYPES } from "../utils/eventTypes";
import { isOverlapping } from "../utils/calendarUtils";


// Date Time Helpers
// yyyy-mm-dd for <input type="date">
function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// Convert Date → "HH:MM"
function toHHMM(date) {
  return date.toTimeString().slice(0, 5);
}

// Current time in HH:MM
function nowHHMM() {
  return toHHMM(new Date());
}

// Generate time options in 30-min intervals
function generate30MinOptions(minTime = "00:00") {
  const [mh, mm] = minTime.split(":").map(Number);
  const minMinutes = mh * 60 + mm;

  const opts = [];
  for (let t = 0; t < 24 * 60; t += 30) {
    if (t < minMinutes) continue;
    const h = String(Math.floor(t / 60)).padStart(2, "0");
    const m = String(t % 60).padStart(2, "0");
    opts.push(`${h}:${m}`);
  }
  return opts;
}

export default function EventModal({
  event,          // existing event (edit mode)
  events,         // all events for overlap check
  defaultStart,   // start time from grid click
  defaultEnd,     // end time from grid click
  onSave,
  onCancel,
  saveError       // backend save error
}) {
  const isEdit = !!event;

  const [title, setTitle] = useState("");
  const [type, setType] = useState("REMINDER");
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");

    // EDIT MODE: populate from existing event
    if (event) {
      setTitle(event.title);
      setType(event.type);
      setDate(event.date);
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      return;
    }

    // GRID CLICK MODE: use clicked slot times
    if (defaultStart && defaultEnd) {
      setDate(defaultStart.toISOString().split("T")[0]);
      setStartTime(toHHMM(defaultStart));
      setEndTime(toHHMM(defaultEnd));
      return;
    }

    // MANUAL ADD: default to now + 30 mins
    const now = new Date();
    setDate(todayISO());
    setStartTime(toHHMM(now));

    const end = new Date(now);
    end.setMinutes(end.getMinutes() + 30);
    setEndTime(toHHMM(end));
  }, [event, defaultStart, defaultEnd]);


  // Handle date change
  useEffect(() => {
    // Do not auto-change times when editing or grid-clicking
    if (event || defaultStart) return;

    const today = todayISO();

    // Future date → start from midnight
    if (date > today) {
      setStartTime("00:00");
      setEndTime("00:30");
      return;
    }

    // Today → start from current time
    if (date === today) {
      const now = new Date();
      setStartTime(toHHMM(now));

      const end = new Date(now);
      end.setMinutes(end.getMinutes() + 30);
      setEndTime(toHHMM(end));
    }
  }, [date]);

  // time Constraints
  const isToday = date === todayISO();
  const minStartTime = isToday ? nowHHMM() : "00:00";

  const startOptions = generate30MinOptions(minStartTime);
  const endOptions = generate30MinOptions(startTime);

  // Auto fix end time
  useEffect(() => {
    if (startTime && endTime && endTime <= startTime) {
      const next = endOptions[0];
      if (next) setEndTime(next);
    }
  }, [startTime]);

  // Save handler
  const save = () => {
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (endTime <= startTime) {
      setError("End time must be after start time");
      return;
    }

    const updatedEvent = {
      ...(event || {}),
      title: title.trim(),
      type,
      date,
      startTime,
      endTime
    };

    // Ignore current event when editing
    const otherEvents = isEdit
      ? events.filter(e => e.id !== event.id)
      : events;

    // Prevent overlaps
    if (isOverlapping(updatedEvent, otherEvents)) {
      setError("Overlapping event");
      return;
    }

    onSave(updatedEvent, isEdit);
  };

  return (
    <>
      {/* Local validation error */}
      {error && <p className="error">{error}</p>}

      {/* Backend save error */}
      {saveError && <p className="error">{saveError}</p>}

      <label>
        Title
        <input
          value={title}
          onChange={e => {
            setTitle(e.target.value);
            setError("");
          }}
        />
      </label>

      <label>
        Event Type
        <select value={type} onChange={e => setType(e.target.value)}>
          {Object.entries(EVENT_TYPES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Date
        <input
          type="date"
          min={todayISO()}
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </label>

      <label>
        Start Time
        <input
          type="time"
          list="start-time-options"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
        />
      </label>

      <label>
        End Time
        <input
          type="time"
          list="end-time-options"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
        />
      </label>

      {/* Time dropdown helpers */}
      <datalist id="start-time-options">
        {startOptions.map(t => (
          <option key={t} value={t} />
        ))}
      </datalist>

      <datalist id="end-time-options">
        {endOptions.map(t => (
          <option key={t} value={t} />
        ))}
      </datalist>

      <div className="modal-footer">
        <button onClick={onCancel}>Cancel</button>
        <button onClick={save}>
          {isEdit ? "Save Changes" : "Add Event"}
        </button>
      </div>
    </>
  );
}
