package com.carsharing.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "app.telemetry")
@Validated
public record TelemetryProperties(
        int rateLimitSeconds,
        int ttlDays,
        String simulateApiKey
) {}
