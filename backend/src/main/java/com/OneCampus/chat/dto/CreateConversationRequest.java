package com.OneCampus.chat.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateConversationRequest(
        @NotNull UUID lostReportId,
        @NotNull UUID otherUserId
) {
}
