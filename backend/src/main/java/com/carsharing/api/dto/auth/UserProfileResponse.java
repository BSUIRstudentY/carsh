package com.carsharing.api.dto.auth;

public record UserProfileResponse(
        Long id,
        String email,
        String phone,
        String status
) {}
