package com.OneCampus.identity.dto;

public record RegisterRequest(
        String name,
        String email,
        String password,
        String campusName
) {}
