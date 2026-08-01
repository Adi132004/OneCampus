package com.OneCampus.event.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateEventRequest(
        @NotBlank(message = "Event title is required") String title,
        String description,
        @NotBlank(message = "Date is required") String date,
        String time,
        @NotBlank(message = "Location is required") String location,
        String college
) {
}
