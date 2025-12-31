import { useState, useEffect, useRef } from "react";
import TopBar from "./components/TopBar";
import MonthCalendar from "./components/MonthCalendar";
import DayView from "./components/DayView";
import Modal from "./components/Modal";
import EventModal from "./components/EventModal";
import AvailableSlotDialog from "./components/AvailableSlotDialog";
import EventsPanel from "./components/EventsPanel";
import RightDrawer from "./components/RightDrawer";

// API helpers for event operations
import {
  getAllEvents,
  getEventById,
  getEventsForToday,
  getEventsByDate,
  getRemainingEventsForToday,
  addEvent,
  updateEvent,
  deleteEvent
} from "./api/eventsApi";

import "./App.css";

export default function App() {
  // State

  // All loaded events (month or day based)
  const [events, setEvents] = useState([]);

  // Currently selected date
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Current view: "month" or "day"
  const [view, setView] = useState("month");

  // Add/Edit modal visibility
  const [showEventModal, setShowEventModal] = useState(false);

  // Event currently being edited or deleted
  const [activeEvent, setActiveEvent] = useState(null);

  // Event opened in view-only modal
  const [viewOnlyEvent, setViewOnlyEvent] = useState(null);

  // Draft event created from grid click
  const [draftEvent, setDraftEvent] = useState(null);

  // Right-click context menu state
  const [menu, setMenu] = useState(null);

  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Available slots modal
  const [showSlots, setShowSlots] = useState(false);

  // Right drawer (Today's Events)
  const [showRemaining, setShowRemaining] = useState(false);

  // Events for today
  const [todayEvents, setTodayEvents] = useState([]);

  // Remaining (upcoming) events for today
  const [remainingEvents, setRemainingEvents] = useState([]);

  // Error shown when saving event fails
  const [saveError, setSaveError] = useState("");

  // Ref used to detect outside clicks for context menu
  const menuRef = useRef(null);


  // Load events whenever view or selected date changes
  useEffect(() => {
    // Day view → load events for selected date
    if (view === "day") {
      getEventsByDate(selectedDate).then(data => {
        setEvents(
          data.map(e => ({
            ...e,
            start: new Date(`${e.date}T${e.startTime}`),
            end: new Date(`${e.date}T${e.endTime}`)
          }))
        );
      });
    }

    // Month view → load all events
    if (view === "month") {
      getAllEvents().then(data => {
        setEvents(
          data.map(e => ({
            ...e,
            start: new Date(`${e.date}T${e.startTime}`),
            end: new Date(`${e.date}T${e.endTime}`)
          }))
        );
      });
    }
  }, [view, selectedDate]);


  // Helpers

  // Check if a date is before today
  const isPastDay = date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    return d < today;
  };

  
  // Top Bar Actions

  // Load today's events and remaining events, open right drawer
  const handleRemainingEvents = async () => {
    setShowRemaining(true);

    try {
      const [today, remaining] = await Promise.all([
        getEventsForToday(),
        getRemainingEventsForToday()
      ]);

      setTodayEvents(today);
      setRemainingEvents(remaining);
    } catch (e) {
      console.error(e);
    }
  };

  // Close context menu when clicking outside of it
  useEffect(() => {
    if (!menu) return;

    const handleOutsideMouseDown = (e) => {
      // Ignore clicks inside the menu
      if (menuRef.current && menuRef.current.contains(e.target)) {
        return;
      }
      setMenu(null);
    };

    document.addEventListener("mousedown", handleOutsideMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideMouseDown);
    };
  }, [menu]);



  return (
    <>
      {/* Top navigation bar */}
      <TopBar
        isDayView={view === "day"}
        onBack={() => setView("month")}
        onRemaining={handleRemainingEvents}
        onAdd={() => {
          setMenu(null);
          setActiveEvent(null);
          setDraftEvent(null);
          setShowEventModal(true);
        }}
        onSlots={() => {
          setMenu(null);
          setShowSlots(true);
        }}
      />

      {/* Month view */}
      {view === "month" && (
        <MonthCalendar
          selectedDate={selectedDate}
          events={events}
          onSelectDate={date => {
            setMenu(null);
            setSelectedDate(date);
            setView("day");
          }}
        />
      )}

      {/* Day view */}
      {view === "day" && (
        <DayView
          date={selectedDate}
          events={events}
          onEventClick={event => {
            setMenu(null);
            getEventById(event.id).then(fullEvent => {
              setViewOnlyEvent({
                ...fullEvent,
                type:
                  fullEvent.type === "OOO"
                    ? "OUT OF OFFICE"
                    : fullEvent.type
              });
            });
          }}
          onEventRightClick={(event, evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            setMenu({ event, x: evt.pageX, y: evt.pageY });
          }}
          onTimeSlotClick={({ hour, minute }) => {
            setMenu(null);
            if (isPastDay(selectedDate)) return;

            const start = new Date(selectedDate);
            start.setHours(hour, minute, 0, 0);

            const end = new Date(start);
            end.setMinutes(end.getMinutes() + 30);

            setDraftEvent({ start, end });
            setActiveEvent(null);
            setShowEventModal(true);
          }}
        />
      )}

      {/* Right-click context menu */}
      {menu && (
        <ul
          ref={menuRef}
          className="context-menu"
          style={{ top: menu.y, left: menu.x }}
        >
          <li
            onClick={() => {
              setActiveEvent(menu.event);
              setShowEventModal(true);
              setMenu(null);
            }}
          >
            Edit
          </li>
          <li
            onClick={() => {
              setActiveEvent(menu.event);
              setShowDeleteConfirm(true);
              setMenu(null);
            }}
          >
            Delete
          </li>
        </ul>
      )}

      {/* Add / Edit Event Modal */}
      {showEventModal && (
        <Modal
          title={activeEvent ? "Edit Event" : "Add Event"}
          onClose={() => {
            setShowEventModal(false);
            setActiveEvent(null);
            setDraftEvent(null);
            setSaveError("");
          }}
        >
          <EventModal
            event={activeEvent}
            events={events}
            defaultStart={draftEvent?.start}
            defaultEnd={draftEvent?.end}
            saveError={saveError}
            onCancel={() => setShowEventModal(false)}
            onSave={(updated, isEdit) => {
              const action = isEdit
                ? updateEvent(updated.id, updated)
                : addEvent(updated);

              action
                .then(saved => {
                  const eventFromBackend = {
                    ...saved,
                    start: new Date(`${saved.date}T${saved.startTime}`),
                    end: new Date(`${saved.date}T${saved.endTime}`)
                  };

                  setEvents(prev =>
                    isEdit
                      ? prev.map(e =>
                          e.id === eventFromBackend.id ? eventFromBackend : e
                        )
                      : [...prev, eventFromBackend]
                  );

                  setSelectedDate(new Date(`${eventFromBackend.date}T00:00:00`));
                  setView("day");

                  setShowEventModal(false);
                  setSaveError("");
                })
                .catch(err => {
                  setSaveError("Overlapping event.");
                });
            }}
          />
        </Modal>
      )}

      {/* View-only Event Modal */}
      {viewOnlyEvent && (
        <Modal title="Event Details" onClose={() => setViewOnlyEvent(null)}>
          <p><b>Title:</b> {viewOnlyEvent.title}</p>
          <p><b>Type:</b> {viewOnlyEvent.type}</p>
          <p><b>Date:</b> {viewOnlyEvent.date}</p>
          <p><b>Time:</b> {viewOnlyEvent.startTime} – {viewOnlyEvent.endTime}</p>
        </Modal>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && activeEvent && (
        <Modal title="Confirm Delete" onClose={() => setShowDeleteConfirm(false)}>
          <p>Are you sure you want to delete this event?</p>
          <div className="modal-footer">
            <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            <button
              className="danger"
              onClick={() => {
                deleteEvent(activeEvent.id).then(() => {
                  setEvents(events.filter(e => e.id !== activeEvent.id));
                  setShowDeleteConfirm(false);
                });
              }}
            >
              Yes, Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Available slot finder */}
      {showSlots && (
        <Modal title="Find Available Slot" onClose={() => setShowSlots(false)}>
          <AvailableSlotDialog />
        </Modal>
      )}

      {/* Right drawer showing today's events */}
      {showRemaining && (
        <RightDrawer
          title="Today's Events"
          onClose={() => setShowRemaining(false)}
        >
          <EventsPanel
            todayEvents={todayEvents}
            remainingEvents={remainingEvents}
          />
        </RightDrawer>
      )}
    </>
  );
}
