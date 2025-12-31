import { useState, useEffect } from "react";
import { getNextAvailableSlot } from "../api/eventsApi";

export default function AvailableSlotDialog() {
  const [minutes, setMinutes] = useState(30);
  const [useToday, setUseToday] = useState(true);
  const [date, setDate] = useState("");
  const [result, setResult] = useState(undefined);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  // Today's date in YYYY-MM-DD format (for date input)
  const todayISO = new Date().toISOString().split("T")[0];

  // Reset result whenever inputs change
  useEffect(() => {
    setResult(undefined);
    setSearched(false);
    setError(null);
  }, [date, useToday, minutes]);

  // Fetch next available slot from backend
  const findSlot = async () => {
    setSearched(true);
    setError(null);

    let targetDate;

    if (useToday) {
      // Use current date if "Today" is selected
      targetDate = new Date();
    } else {
      // Use selected date (start of day)
      targetDate = new Date(`${date}T00:00:00`);

      // Prevent selecting past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (targetDate < today) {
        setError("Please select today or a future date.");
        return;
      }
    }

    try {
      const slot = await getNextAvailableSlot(targetDate, minutes);

      if (slot) {
        // Convert backend response to Date objects
        setResult({
          start: new Date(slot.start),
          end: new Date(slot.end)
        });
      } else {
        // No slot found
        setResult(null);
      }
    } catch (e) {
      console.error(e);
      setError("Unable to reach server. Please try again.");
    }
  };

  // Inline style helpers for radio layout
  const radioRowStyle = {
    display: "inline-flex",
    alignItems: "center",
    flexDirection: "row-reverse",
    gap: "50px",
    cursor: "pointer"
  };

  const radioGroupStyle = {
    marginTop: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "15px"
  };

  return (
    <>
      {/* Slot duration input */}
      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        Slot Duration (minutes)
        <input
          type="number"
          min="1"
          value={minutes}
          onChange={e => setMinutes(+e.target.value)}
          style={{ width: "120px" }}
        />
      </label>

      {/* Date selection options */}
      <div style={radioGroupStyle}>
        <label style={radioRowStyle}>
          <input
            type="radio"
            checked={useToday}
            onChange={() => setUseToday(true)}
            style={{ margin: 0 }}
          />
          <span>Today</span>
        </label>

        <label
          style={radioRowStyle}
          onClick={() => {
            setUseToday(false);
            if (!date) setDate(todayISO);
          }}
        >
          <input
            type="radio"
            checked={!useToday}
            onChange={() => {
              setUseToday(false);
              setDate(todayISO);
            }}
            style={{ margin: 0 }}
          />
          <span>Pick Date</span>
        </label>

        {/* Date picker shown only when "Pick Date" is selected */}
        {!useToday && (
          <input
            type="date"
            min={todayISO}
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ marginTop: "6px" }}
          />
        )}
      </div>

      {/* Search button */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={findSlot}>Find Slot</button>
      </div>

      {/* Error message */}
      {error && (
        <p style={{ marginTop: "10px", color: "#dc2626" }}>
          {error}
        </p>
      )}

      {/* No slot found message */}
      {searched && result === null && !error && (
        <p style={{ marginTop: "20px" }}>
          No available slot found.
        </p>
      )}

      {/* Slot result */}
      {result && (
        <p style={{ marginTop: "15px" }}>
          <b>Next Available Slot:</b><br />
          {result.start.toLocaleString()} → {result.end.toLocaleString()}
        </p>
      )}
    </>
  );
}
