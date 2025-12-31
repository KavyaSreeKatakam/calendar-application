# Simple Calendar Backend Application

## Overview

This project implements the backend for a Simple Calendar and Appointment Management System using Spring Boot.
It allows users to create, update, delete, and query calendar events while preventing overlapping events.
All data is stored locally in a JSON file, so no database setup is required.

The backend supports:
* Add an event
* Update an event
* Delete an event
* Listing all events for today
* Listing remaining events for today
* Listing events for any specified date
* Finding the next available slot of a specified size for today or the specified day.


## Approach and Design

### Architecture

* Layered architecture:

* Model -> Controller → Service → File Storage
* REST APIs built using Spring Boot
* Business logic handled in the service layer
* File-based persistence using a JSON file

### Key Design Decisions

* No database is used; events are stored in a local file
* Overlapping events are strictly prevented
* Working hours are enforced "when finding available slots" (9:00 AM – 5:00 PM)
* File read/write operations are synchronized to ensure consistency


## Project Structure

calendar-backend
│
├── src/main/java/com/calendar
│   ├── controller
│   │   └── EventController.java
│   ├── service
│   │   └── EventService.java
│   ├── model
│   │   ├── Event.java
│   │   └── AvailableSlot.java
│   └── CalendarBackendApplication.java
│
├── data
│   └── events.json
│
└── README.md


## Key Components

### EventController

* Exposes all REST endpoints
* Handles HTTP requests and responses
* Delegates business logic to the service layer

### EventService

* Contains core business logic
* Prevents overlapping events
* Computes remaining events and available slots
* Reads and writes data from the JSON file

### Models

* Event: Represents a calendar event
* AvailableSlot: Represents a free time slot with start and end times

## Supported APIs

### Event APIs

GET /api/events/getEvents
Fetch all events

GET /api/events/getEvent/{id}
Fetch an event by ID

GET /api/events/byDate?date=YYYY-MM-DD
Fetch events for a specific date

GET /api/events/todayDate
Fetch all events scheduled for today

GET /api/events/todayRemaining
Fetch remaining (upcoming or ongoing) events for today

POST /api/events/addEvent
Create a new event

PUT /api/events/editEvent/{id}
Update an existing event

DELETE /api/events/deleteEvent/{id}
Delete an event

### Available Slot API

GET /api/events/availableSlot?date=YYYY-MM-DD&minutes=30

Returns the next available time slot for the given date and duration.
Returns null if no slot is available.


## Overlap Prevention

An event is considered overlapping if:

New event start time is before an existing event’s end time
AND
New event end time is after an existing event’s start time

Overlap checks are performed during:

* Event creation
* Event updates (excluding the same event ID)

If an overlap is detected, the API returns HTTP 409 Conflict.


## Data Storage

* Data is stored in calendar-backend/data/events.json
* The file is created automatically on first run
* All add, edit, and delete operations update this file

### Sample Event Data

Title: Team Meeting
Type: REMINDER
Date: 2025-12-30
Start Time: 13:00
End Time: 14:00


## Running the Application

### Prerequisites

* Java 17 or higher
* Maven

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

## Test the application using UI 

or

## Testing and Verification

Use Postman or curl to test the APIs.

### Create Event Example

Send a POST request to /api/events/addEvent with JSON body containing event details.

### Available Slot Example

Send a GET request to /api/events/availableSlot with date and duration.

### Overlap Verification

Attempt to create or update an event that overlaps with an existing one.
The API will respond with HTTP 409 Conflict.


## Assumptions

* Date format: yyyy-MM-dd
* Time format: HH:mm
* Events do not span multiple days
* Working hours are from 9:00 AM to 5:00 PM
* This project focuses on backend functionality only


