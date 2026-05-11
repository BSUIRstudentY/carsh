package com.carsharing.api.service.telemetry;

import com.carsharing.api.domain.mongo.TelemetryPoint;
import com.carsharing.api.repository.mongo.TelemetryPointRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class TelemetryKafkaConsumer {

    private final TelemetryPointRepository telemetryPointRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "vehicle-telemetry", groupId = "carsharing-telemetry")
    public void consume(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);
            TelemetryPoint point = TelemetryPoint.builder()
                    .vehicleId(node.get("vehicleId").asLong())
                    .bookingId(node.has("bookingId") && !node.get("bookingId").isNull()
                            ? node.get("bookingId").asLong() : null)
                    .ts(Instant.parse(node.get("ts").asText()))
                    .lat(node.get("lat").asDouble())
                    .lon(node.get("lon").asDouble())
                    .speed(node.has("speed") ? node.get("speed").asDouble() : 0.0)
                    .ignition(node.has("ignition") && node.get("ignition").asBoolean())
                    .build();
            telemetryPointRepository.save(point);
            log.debug("Saved telemetry point for vehicle {}", point.getVehicleId());
        } catch (Exception e) {
            log.error("Failed to process telemetry message: {}", message, e);
        }
    }
}
