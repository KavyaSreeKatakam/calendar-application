// Base URL for all event-related API calls
const API_BASE = "http://localhost:8080/api/events";

/**
 * Generic response handler for POST/PUT requests
 * - Throws an error if response is not OK
 * - Reads text first so backend error messages are preserved
 * - Returns parsed JSON on success
 */
async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return res.json();
}

// Create a new event
export const addEvent = (event) =>
  fetch(`${API_BASE}/addEvent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event)
  }).then(handleResponse);


// Update existing event using id 

export const updateEvent = (id, event) =>
  fetch(`${API_BASE}/editEvent/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event)
  }).then(handleResponse);

/**
 Generic JSON handler for GET requests
  - Throws a custom error message if response fails
  - Returns parsed JSON on success
 */
async function handleJson(res, errorMessage) {
  if (!res.ok) {
    throw new Error(errorMessage);
  }
  return res.json();
}


// Fetch all events (used in Month view)

export async function getAllEvents() {
  const res = await fetch(`${API_BASE}/getEvents`);
  return handleJson(res, "Failed to fetch all events");
}

// Fetch event by id
export async function getEventById(id) {
  const res = await fetch(`${API_BASE}/getEvent/${id}`);
  return handleJson(res, "Failed to fetch event");
}

// Fetch events for specific date
export async function getEventsByDate(date) {
  const isoDate = date.toISOString().split("T")[0];
  const res = await fetch(`${API_BASE}/byDate?date=${isoDate}`);
  return handleJson(res, "Failed to fetch events for date");
}

// Fetch all events scheduled for today
export async function getEventsForToday() {
  const res = await fetch(`${API_BASE}/todayDate`);
  return handleJson(res, "Failed to fetch today's events");
}

// Fetch only remaining events for today
export async function getRemainingEventsForToday() {
  const res = await fetch(`${API_BASE}/todayRemaining`);
  return handleJson(res, "Failed to fetch remaining events");
}

// delete an event by id
export async function deleteEvent(id) {
  const res = await fetch(`${API_BASE}/deleteEvent/${id}`, {
    method: "DELETE"
  });

  if (!res.ok) {
    throw new Error("Failed to delete event");
  }
}

/**
 * Fetch the next available time slot for a given date & duration
 * JS Date object
 * Duration in minutes
 * Slot info or null if none available
 */
export async function getNextAvailableSlot(date, minutes) {
  const isoDate = date.toISOString().split("T")[0];

  const res = await fetch(
    `${API_BASE}/availableSlot?date=${isoDate}&minutes=${minutes}`
  );

  // Backend may return empty body if no slot exists
  const text = await res.text();
  if (!text) return null;

  return JSON.parse(text);
}
