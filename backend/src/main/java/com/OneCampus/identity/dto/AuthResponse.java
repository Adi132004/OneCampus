package com.OneCampus.identity.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken
) {}