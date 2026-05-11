package com.carsharing.api.dto.telemetry;

import java.time.Instant;
import java.util.List;

public record RouteResponse(
        Instant startedAt,
        Instant endedAt,
        double distanceKm,
        double avgSpeedKph,
        int pointCount,
        List<PointDto> points
) {
    public record PointDto(
            Instant ts,
            double lat,
            double lon,
            double speedKph
    ) {}
}
