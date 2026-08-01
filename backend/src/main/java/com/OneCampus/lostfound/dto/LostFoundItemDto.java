package com.OneCampus.lostfound.dto;

import java.time.Instant;
import java.util.UUID;

public record LostFoundItemDto(
        UUID id,
        String name,
        String description,
        String status,
        String location,
        String date,
        String contact,
        String college,
        String emoji,
        String image,
        String imageUrl,
        String category,
        UUID ownerId,
        String ownerName,
        String ownerEmail,
        Instant createdAt
) {
}
