package com.calendar.controller;

import com.calendar.model.AvailableSlot;
import com.calendar.model.Event;
import com.calendar.service.EventService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// REST controller that exposes APIs for calendar events.

@RestController
@RequestMapping("/api/events")

// Allow frontend (React running on localhost:3000) to access these APIs
@CrossOrigin(origins = "http://localhost:3000")
public class EventController {

    // Service layer dependency
    private final EventService service;

    // Constructor injection of EventService
    public EventController(EventService service) {
        this.service = service;
    }


    // Fetch all events (used for Month view).
    @GetMapping("/getEvents")
    public List<Event> getEvents() {
        return service.getAllEvents();
    }


    //Fetch a single event by its ID
    @GetMapping("/getEvent/{id}")
    public Event getEventById(@PathVariable String id) {
        return service.getEventById(id);
    }


    // Fetch events for a specific date (YYYY-MM-DD).
    @GetMapping("/byDate")
    public List<Event> getEventsByDate(@RequestParam String date) {
        return service.getEventsByDate(date);
    }

    // Fetch all events scheduled for today.
    @GetMapping("/todayDate")
    public List<Event> getEventsByTodayDate() {
        return service.getEventsByTodayDate();
    }


     // Fetch remaining (upcoming) events for today.
    @GetMapping("/todayRemaining")
    public List<Event> getRemainingEventsForToday() {
        return service.getRemainingEventsForToday();
    }

    /**
     * Find the next available time slot for a given date and duration.
     * Returns null if no slot is available.
     */
    @GetMapping("/availableSlot")
    public AvailableSlot findAvailableSlot(
            @RequestParam String date,
            @RequestParam int minutes
    ) {
        return service.findNextAvailableSlot(date, minutes); // may return null
    }


    // Create a new event.

    @PostMapping("/addEvent")
    public Event add(@RequestBody Event event) {
        return service.addEvent(event);
    }


     // Update an existing event by ID.
    @PutMapping("/editEvent/{id}")
    public Event edit(
            @PathVariable String id,
            @RequestBody Event event
    ) {
        return service.updateEvent(id, event);
    }

    // Delete an event by ID.
    @DeleteMapping("/deleteEvent/{id}")
    public void delete(@PathVariable String id) {
        service.deleteEvent(id);
    }
}
