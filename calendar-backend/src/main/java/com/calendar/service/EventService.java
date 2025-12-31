package com.calendar.service;

import com.calendar.model.Event;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.calendar.model.AvailableSlot;
import org.springframework.web.bind.annotation.ResponseStatus;

import javax.annotation.PostConstruct;
import java.io.File;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;

@Service
public class EventService {

    private static final String FILE_PATH =
            System.getProperty("user.dir")
                    + File.separator
                    + "data"
                    + File.separator
                    + "events.json";

    private final ObjectMapper mapper = new ObjectMapper();
    private File file;

    private boolean isOverlapping(Event candidate, List<Event> events, String ignoreId) {
        LocalDateTime cStart = LocalDateTime.parse(
                candidate.getDate() + "T" + candidate.getStartTime()
        );
        LocalDateTime cEnd = LocalDateTime.parse(
                candidate.getDate() + "T" + candidate.getEndTime()
        );

        for (Event e : events) {

            // Ignore same event when editing
            if (ignoreId != null && ignoreId.equals(e.getId())) {
                continue;
            }

            // Only same date
            if (!candidate.getDate().equals(e.getDate())) {
                continue;
            }

            LocalDateTime eStart = LocalDateTime.parse(
                    e.getDate() + "T" + e.getStartTime()
            );
            LocalDateTime eEnd = LocalDateTime.parse(
                    e.getDate() + "T" + e.getEndTime()
            );

            // STRICT overlap check
            if (cStart.isBefore(eEnd) && cEnd.isAfter(eStart)) {
                return true;
            }
        }
        return false;
    }



    // Init

    @PostConstruct
    public void init() {
        try {
            file = new File(FILE_PATH);
            file.getParentFile().mkdirs();

            if (!file.exists()) {
                mapper.writeValue(file, new ArrayList<Event>());
            }

            System.out.println("EVENT FILE USED = " + file.getAbsolutePath());
        } catch (Exception e) {
            throw new RuntimeException("Failed to init file", e);
        }
    }

   // Helpers

    private synchronized List<Event> readAll() {
        try {
            return mapper.readValue(file, new TypeReference<List<Event>>() {});
        } catch (Exception e) {
            try {
                List<Event> empty = new ArrayList<>();
                mapper.writeValue(file, empty);
                return empty;
            } catch (Exception ex) {
                throw new RuntimeException("File recovery failed", ex);
            }
        }
    }

    private synchronized void writeAll(List<Event> events) {
        try {
            mapper.writeValue(file, events);
        } catch (Exception e) {
            throw new RuntimeException("Write failed", e);
        }
    }

    // Public APIs

    // Get All events
    public List<Event> getAllEvents() {
        return readAll();
    }

   // Get Event by ID
    public Event getEventById(String id) {
        return readAll().stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Event not found: " + id)
                );
    }

    // Get events by date
    public List<Event> getEventsByDate(String date) {
        // date expected in yyyy-MM-dd
        return readAll().stream()
                .filter(e -> date.equals(e.getDate()))
                .collect(Collectors.toList());
    }

    // get today's events
    public List<Event> getEventsByTodayDate() {

        String today = LocalDate.now()
                .format(DateTimeFormatter.ISO_DATE); // yyyy-MM-dd

        return readAll().stream()
                .filter(e -> today.equals(e.getDate()))
                .collect(Collectors.toList());
    }


    // Get remaining events for today
    public List<Event> getRemainingEventsForToday() {

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        return readAll().stream()
                // Only today's events
                .filter(e -> LocalDate.parse(e.getDate()).equals(today))
                // Include ongoing or future events
                .filter(e -> {
                    LocalDateTime eventEnd =
                            LocalDateTime.parse(
                                    e.getDate() + "T" + e.getEndTime()
                            );
                    return !eventEnd.isBefore(now);
                })
                // Sort by start time
                .sorted(Comparator.comparing(e ->
                        LocalDateTime.parse(
                                e.getDate() + "T" + e.getStartTime()
                        )
                ))
                .collect(Collectors.toList());
    }




    // Add event
    public Event addEvent(Event event) {
        List<Event> events = readAll();

        if (isOverlapping(event, events, null)) {
            throw new OverlapException("Overlapping event");
        }

        if (event.getId() == null || event.getId().isEmpty()) {
            event.setId(UUID.randomUUID().toString());
        }

        events.add(event);
        writeAll(events);
        return event;
    }



    // Update event
    public Event updateEvent(String id, Event updated) {
        List<Event> events = readAll();

        // MUST set ID before checking overlap
        updated.setId(id);

        if (isOverlapping(updated, events, id)) {
            throw new OverlapException("Overlapping event");
        }

        for (int i = 0; i < events.size(); i++) {
            if (events.get(i).getId().equals(id)) {
                events.set(i, updated);
                writeAll(events);
                return updated;
            }
        }

        throw new RuntimeException("Event not found: " + id);
    }


    // Delete event
    public void deleteEvent(String id) {
        List<Event> events = readAll();
        events.removeIf(e -> e.getId().equals(id));
        writeAll(events);
    }

    // Find NEXT available slot
    public AvailableSlot findNextAvailableSlot(String date, int minutes) {

        LocalDate targetDate = LocalDate.parse(date);

        LocalTime WORK_START = LocalTime.of(9, 0);
        LocalTime WORK_END = LocalTime.of(17, 0);

        LocalDateTime workStart = targetDate.atTime(WORK_START);
        LocalDateTime workEnd = targetDate.atTime(WORK_END);

        LocalDateTime cursor = workStart;

        // If today, start from now but not before 9 AM
        if (targetDate.equals(LocalDate.now())) {
            LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
            if (now.isAfter(cursor)) {
                cursor = now;
            }
        }

        List<Event> dayEvents = readAll().stream()
                .filter(e -> e.getDate().equals(date))
                .sorted(Comparator.comparing(e ->
                        LocalDateTime.parse(e.getDate() + "T" + e.getStartTime())
                ))
                .collect(Collectors.toList());

        for (Event e : dayEvents) {
            LocalDateTime eventStart =
                    LocalDateTime.parse(e.getDate() + "T" + e.getStartTime());
            LocalDateTime eventEnd =
                    LocalDateTime.parse(e.getDate() + "T" + e.getEndTime());


            if (cursor.plusMinutes(minutes).isAfter(workEnd)) {
                return null;
            }

            // ✅ Gap before event
            if (!cursor.plusMinutes(minutes).isAfter(eventStart)) {
                return new AvailableSlot(
                        cursor.toString(),
                        cursor.plusMinutes(minutes).toString()
                );
            }

            // Move cursor forward
            if (eventEnd.isAfter(cursor)) {
                cursor = eventEnd;
            }
        }

        // After last event
        if (cursor.plusMinutes(minutes).isAfter(workEnd)) {
            return null;
        }

        return new AvailableSlot(
                cursor.toString(),
                cursor.plusMinutes(minutes).toString()
        );
    }

    @ResponseStatus(HttpStatus.CONFLICT)
    public static class OverlapException extends RuntimeException {
        public OverlapException(String msg) {
            super(msg);
        }
    }

}
