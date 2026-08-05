package com.OneCampus.chat.dto;

import java.util.UUID;

public record UserSearchDto(
        UUID id,
        String name,
        String email
) {
}
