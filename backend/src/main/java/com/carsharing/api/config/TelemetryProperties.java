package com.carsharing.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "app.telemetry")
@Validated
public record TelemetryProperties(
        /**
         * Minimum gap between accepted points for the same vehicle, using each point's {@code ts}.
         * Values {@code <= 0} disable rate limiting (full fidelity for simulators and dense traces).
         */
        int rateLimitSeconds,
        int ttlDays,
        String simulateApiKey,
        /**
         * When true, drops consecutive points with nearly identical coordinates for a vehicle.
         */
        boolean deduplicateIdenticalCoordinates
) {}
