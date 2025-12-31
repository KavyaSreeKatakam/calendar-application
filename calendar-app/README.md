
# Simple Calendar UI Application

## Overview

This project contains the UI for the Simple Calendar application, built using React
It provides an interactive calendar interface to create, view, edit, and delete events while integrating with the Spring Boot backend APIs.

The UI supports:

* Month and day calendar views (Which shows only a months range for now)
* Adding and editing events via modal dialogs
* Viewing today’s and remaining events
* Finding the next available time slot
* Visual indication of event types and status


## UI Architecture

### Key Concepts

* Component-based React architecture
* Centralized API calls in `eventsApi.js`
* Stateless UI components where possible
* Client-side validation before API calls
* Backend remains the source of truth

## Key Files and Components

### API Layer

**eventsApi.js**

* Centralized wrapper for all backend API calls
* Handles errors and response parsing
* Keeps UI components free from fetch logic

Supported API methods:

* addEvent
* updateEvent
* deleteEvent
* getAllEvents
* getEventById
* getEventsByDate
* getEventsForToday
* getRemainingEventsForToday
* getNextAvailableSlot


### Core UI Components

**MonthCalendar**

* Displays a month grid
* Shows event indicators per day
* Clicking a day switches to Day view

**DayView**

* Displays a full-day timeline (0–24 hours)
* Events rendered as vertical blocks
* Click empty slot → add event
* Right-click event → edit/delete menu

**TopBar**

* Global navigation bar
* Actions:

  * Switch to Month view
  * Open Today’s Events drawer
  * Open Available Slots dialog
  * Add new event

**EventModal**

* Add and edit event dialog
* Performs client-side validation
* Prevents overlapping events before save
* Supports edit and create modes

**AvailableSlotDialog**

* Finds next available time slot
* Supports “Today” or specific date
* Duration-based search
* Displays slot or no-slot message

**EventsPanel**

* Displays today’s events
* Highlights completed vs remaining events
* Sorted by start time

**Modal / RightDrawer**

* Reusable UI wrappers for dialogs and drawers


## Utilities

**calendarUtils.js**

* Overlap detection (client-side)
* Remaining events helper
* Local slot calculation helper (UI-side)

**eventTypes.js**

* Defines event categories
* Maps event type → label and color
* Used consistently across UI


## API Integration Summary

The UI communicates with the backend at:

[http://localhost:8080/api/events](http://localhost:8080/api/events)

Key endpoints used:

* GET /getEvents
* GET /byDate
* GET /todayDate
* GET /todayRemaining
* POST /addEvent
* PUT /editEvent/{id}
* DELETE /deleteEvent/{id}
* GET /availableSlot

All API calls are made via `eventsApi.js`.


## Validation and Error Handling

* Prevents creating events in the past
* Ensures end time is after start time
* Prevents overlapping events on the UI before calling backend
* Displays backend errors (e.g., overlap conflicts)
* Graceful handling of empty or unavailable slots


## How to Run the UI

### Prerequisites

* Node.js (16+ recommended)
* npm or yarn
* Backend must be running on port 8080

### Steps

1. Clone the calender-application repository
2. Open calender-app directory in VS Code
3. Open calender-backend directory in IntelliJ

- Navigate to the calendar-backend directory
- Run the application using:

mvn spring-boot:run

The application will start on:

[http://localhost:8080](http://localhost:8080)

and 

- Navigate to the calendar-app directory
- Run the application using:

npm install
npm start

FE will start running on - 

[http://localhost:3000](http://localhost:3000)


## Assumptions

* BACKEND is running and reachable
* Date format: yyyy-MM-dd
* Time format: HH:mm
* Events do not span multiple days
* Working hours logic is enforced by backend
* UI focuses on usability; backend enforces final validation


## PPT is available in the BE folder
