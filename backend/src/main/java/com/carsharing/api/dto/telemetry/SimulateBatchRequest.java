package com.carsharing.api.dto.telemetry;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record SimulateBatchRequest(
        @NotNull Long vehicleId,
        Long bookingId,
        @NotNull List<PointInput> points
) {
    public record PointInput(
            Double lat,
            Double lon,
            Double speed,
            Boolean ignition
    ) {}
}
