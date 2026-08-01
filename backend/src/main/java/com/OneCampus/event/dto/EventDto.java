package com.OneCampus.event.dto;

import java.time.Instant;
import java.util.UUID;

public record EventDto(
        UUID id,
        String title,
        String description,
        String date,
        String time,
        String location,
        String college,
        String campusId,
        UUID organizerId,
        String organizerName,
        Instant createdAt
) {
}
