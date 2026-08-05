package com.OneCampus.chat.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateConversationRequest(
        UUID lostReportId,          // nullable for direct messaging
        @NotNull UUID otherUserId
) {
}
