package com.carsharing.api.dto.admin;

import com.carsharing.api.domain.User;

import java.time.Instant;

public record AdminUserResponse(
        Long id,
        String email,
        String phone,
        String firstName,
        String lastName,
        String role,
        String status,
        Instant createdAt
) {
    public static AdminUserResponse from(User u) {
        return new AdminUserResponse(
                u.getId(), u.getEmail(), u.getPhone(),
                u.getFirstName(), u.getLastName(),
                u.getRole(), u.getStatus(), u.getCreatedAt()
        );
    }
}
