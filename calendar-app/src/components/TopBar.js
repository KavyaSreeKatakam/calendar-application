import { FaPlus, FaCalendarAlt, FaClock, FaList } from "react-icons/fa";

export default function TopBar({
  onAdd,        // Open Add Event modal
  onBack,       // Switch back to Month view
  onSlots,      // Open Available Slots dialog
  onRemaining,  // Open Today's Events right drawer
  isDayView     // Indicates whether Day view is active
}) {
  return (
    // Sticky top navigation bar
    <div className="topbar sticky-topbar">
      <h2>Calendar Application</h2>

      <div className="actions">
        {/* Show "Month" button only in Day view */}
        {isDayView && (
          <button onClick={onBack}>
            <FaCalendarAlt /> Month
          </button>
        )}

        {/* Open right drawer with today's events */}
        <button
          onClick={(e) => {
            e.stopPropagation();   // Prevents closing other overlays/menus
            onRemaining();
          }}
        >
          <FaList /> Today's Events
        </button>

        {/* Open available slot finder */}
        <button
          onClick={(e) => {
            e.stopPropagation();   // Prevents bubbling to global click handlers
            onSlots();
          }}
        >
          <FaClock /> Available Slots
        </button>

        {/* Open Add Event modal */}
        <button
          onClick={(e) => {
            e.stopPropagation();   // Prevents accidental menu dismissal
            onAdd();
          }}
        >
          <FaPlus /> Add Event
        </button>
      </div>
    </div>
  );
}
