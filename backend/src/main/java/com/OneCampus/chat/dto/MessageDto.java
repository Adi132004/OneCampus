package com.OneCampus.chat.dto;

import java.time.Instant;
import java.util.UUID;

public record MessageDto(
        UUID id,
        UUID conversationId,
        UUID senderId,
        UUID receiverId,
        String message,
        Instant timestamp,
        boolean read,
        boolean delivered
) {
}
