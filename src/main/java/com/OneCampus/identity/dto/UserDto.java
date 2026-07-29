package com.OneCampus.identity.dto;

import java.util.UUID;

public record UserDto(
        UUID id,
        String name,
        String email,
        UUID campusId,
        String campusName
) {
}
