package com.OneCampus.common.security;

import java.util.UUID;

public record AuthenticatedUser(UUID userId, String campusId) {
}
