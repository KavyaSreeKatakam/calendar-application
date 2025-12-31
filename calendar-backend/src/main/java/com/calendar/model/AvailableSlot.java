package com.calendar.model;

public class AvailableSlot {

    private String start;
    private String end;

    public AvailableSlot(String start, String end) {
        this.start = start;
        this.end = end;
    }

    public String getStart() {
        return start;
    }

    public String getEnd() {
        return end;
    }
}
