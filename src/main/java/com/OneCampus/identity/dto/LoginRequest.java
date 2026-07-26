package com.OneCampus.identity.dto;

public record LoginRequest(
        String email,
        String password
) {}
