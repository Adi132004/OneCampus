package com.OneCampus.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SendMessageRequest(
        @NotNull UUID conversationId,
        @NotNull UUID receiverId,
        @NotBlank String message
) {
}
