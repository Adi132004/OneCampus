package com.OneCampus.chat.dto;

import java.time.Instant;
import java.util.UUID;

public record ConversationDto(
        UUID id,
        UUID lostReportId,
        UUID user1Id,
        UUID user2Id,
        UUID otherUserId,
        Instant createdAt,
        String otherUserName,
        String otherUserEmail,
        String lastMessage,
        Instant lastMessageAt,
        long unreadCount
) {
}
