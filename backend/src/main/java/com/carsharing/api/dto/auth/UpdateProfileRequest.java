package com.carsharing.api.dto.auth;

public record UpdateProfileRequest(
        String firstName,
        String lastName,
        String phone
) {}
