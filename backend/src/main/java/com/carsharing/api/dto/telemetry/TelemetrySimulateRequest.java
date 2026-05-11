package com.carsharing.api.dto.telemetry;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record TelemetrySimulateRequest(
        @NotNull Long vehicleId,
        Long bookingId,
        Instant ts,
        @NotNull Double lat,
        @NotNull Double lon,
        Double speed,
        Boolean ignition
) {}
