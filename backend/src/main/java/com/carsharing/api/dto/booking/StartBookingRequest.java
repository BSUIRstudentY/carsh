package com.carsharing.api.dto.booking;

import jakarta.validation.constraints.NotNull;

public record StartBookingRequest(
        @NotNull Long vehicleId
) {}
