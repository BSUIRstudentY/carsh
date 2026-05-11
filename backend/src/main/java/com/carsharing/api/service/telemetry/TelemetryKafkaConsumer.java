package com.carsharing.api.service.telemetry;

import com.carsharing.api.config.TelemetryProperties;
import com.carsharing.api.domain.mongo.TelemetryPoint;
import com.carsharing.api.repository.VehicleRepository;
import com.carsharing.api.repository.mongo.TelemetryPointRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class TelemetryKafkaConsumer {

    private static final double COORD_EPSILON = 0.000005;
    private static final String DLQ_TOPIC = "vehicle-telemetry-dlq";

    private final TelemetryPointRepository telemetryPointRepository;
    private final VehicleRepository vehicleRepository;
    private final ObjectMapper objectMapper;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final SimpMessagingTemplate webSocket;
    private final TelemetryProperties telemetryProperties;

    private final ConcurrentHashMap<Long, Instant> lastPointTime = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, double[]> lastPointCoords = new ConcurrentHashMap<>();

    @KafkaListener(topics = "vehicle-telemetry", groupId = "carsharing-telemetry")
    public void consumeBatch(List<String> messages) {
        List<TelemetryPoint> parsed = new ArrayList<>();
        List<TelemetryPoint> toSave = new ArrayList<>();
        Map<Long, double[]> vehiclePositions = new ConcurrentHashMap<>();

        for (String message : messages) {
            try {
                TelemetryPoint point = parseAndValidate(message);
                if (point == null) continue;
                parsed.add(point);
            } catch (Exception e) {
                sendToDlq(message, e);
            }
        }

        parsed.sort(
                Comparator.comparing(TelemetryPoint::getTs)
                        .thenComparing(TelemetryPoint::getVehicleId)
        );

        for (TelemetryPoint point : parsed) {
            try {

                if (isRateLimited(point.getVehicleId(), point.getTs())) {
                    log.debug("Rate limited point for vehicle {}", point.getVehicleId());
                    continue;
                }

                if (isDuplicate(point.getVehicleId(), point.getLat(), point.getLon())) {
                    log.debug("Duplicate point for vehicle {}", point.getVehicleId());
                    continue;
                }

                toSave.add(point);
                vehiclePositions.put(
                        point.getVehicleId(),
                        new double[]{point.getLat(), point.getLon()}
                );
                lastPointTime.put(point.getVehicleId(), point.getTs());
                lastPointCoords.put(
                        point.getVehicleId(),
                        new double[]{point.getLat(), point.getLon()}
                );
            } catch (Exception e) {
                sendToDlq(safeSerialize(point), e);
            }
        }

        if (!toSave.isEmpty()) {
            telemetryPointRepository.saveAll(toSave);
            log.info("Batch saved {} telemetry points", toSave.size());
        }

        vehiclePositions.forEach(this::updateVehiclePosition);

        for (TelemetryPoint point : toSave) {
            pushToWebSocket(point);
        }
    }

    private TelemetryPoint parseAndValidate(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);

            if (!node.has("vehicleId") || !node.has("lat") || !node.has("lon") || !node.has("ts")) {
                log.warn("Missing required fields in telemetry message");
                sendToDlq(message, new IllegalArgumentException("Missing required fields"));
                return null;
            }

            long vehicleId = node.get("vehicleId").asLong();
            double lat = node.get("lat").asDouble();
            double lon = node.get("lon").asDouble();
            double speed = node.has("speed") ? node.get("speed").asDouble() : 0.0;
            Instant ts = Instant.parse(node.get("ts").asText());

            if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                log.warn("Invalid coordinates [{}, {}] for vehicle {}", lat, lon, vehicleId);
                sendToDlq(message, new IllegalArgumentException("Coordinates out of range"));
                return null;
            }

            if (speed < 0 || speed > 300) {
                log.warn("Invalid speed {} for vehicle {}", speed, vehicleId);
                speed = Math.max(0, Math.min(speed, 300));
            }

            if (ts.isAfter(Instant.now().plusSeconds(60))) {
                log.debug("Accepted future timestamp for vehicle {}: {}", vehicleId, ts);
            }

            return TelemetryPoint.builder()
                    .vehicleId(vehicleId)
                    .bookingId(node.has("bookingId") && !node.get("bookingId").isNull()
                            ? node.get("bookingId").asLong() : null)
                    .ts(ts)
                    .lat(lat)
                    .lon(lon)
                    .speed(speed)
                    .ignition(node.has("ignition") && node.get("ignition").asBoolean())
                    .build();
        } catch (Exception e) {
            sendToDlq(message, e);
            return null;
        }
    }

    private boolean isRateLimited(long vehicleId, Instant ts) {
        Instant last = lastPointTime.get(vehicleId);
        if (last == null) return false;
        long diffSeconds = ts.getEpochSecond() - last.getEpochSecond();
        return diffSeconds >= 0 && diffSeconds < telemetryProperties.rateLimitSeconds();
    }

    private boolean isDuplicate(long vehicleId, double lat, double lon) {
        double[] prev = lastPointCoords.get(vehicleId);
        if (prev == null) {
            Sort sort = Sort.by(Sort.Direction.DESC, "ts");
            var last = telemetryPointRepository.findByVehicleId(vehicleId, PageRequest.of(0, 1, sort));
            if (last.isEmpty()) return false;
            prev = new double[]{last.get(0).getLat(), last.get(0).getLon()};
            lastPointCoords.put(vehicleId, prev);
        }
        return Math.abs(prev[0] - lat) < COORD_EPSILON
                && Math.abs(prev[1] - lon) < COORD_EPSILON;
    }

    private void updateVehiclePosition(long vehicleId, double[] coords) {
        vehicleRepository.findById(vehicleId).ifPresent(vehicle -> {
            vehicle.setLastLatitude(coords[0]);
            vehicle.setLastLongitude(coords[1]);
            vehicleRepository.save(vehicle);
        });
    }

    private void pushToWebSocket(TelemetryPoint point) {
        try {
            Map<String, Object> payload = Map.of(
                    "vehicleId", point.getVehicleId(),
                    "bookingId", point.getBookingId() != null ? point.getBookingId() : 0,
                    "lat", point.getLat(),
                    "lon", point.getLon(),
                    "speed", point.getSpeed(),
                    "ts", point.getTs().toString()
            );
            webSocket.convertAndSend(
                    "/topic/vehicle/" + point.getVehicleId(), payload);
            if (point.getBookingId() != null) {
                webSocket.convertAndSend(
                        "/topic/booking/" + point.getBookingId(), payload);
            }
        } catch (Exception e) {
            log.debug("WebSocket push failed: {}", e.getMessage());
        }
    }

    private void sendToDlq(String message, Exception e) {
        try {
            String dlqPayload = objectMapper.writeValueAsString(Map.of(
                    "originalMessage", message,
                    "error", e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName(),
                    "timestamp", Instant.now().toString()
            ));
            kafkaTemplate.send(DLQ_TOPIC, dlqPayload);
            log.warn("Sent message to DLQ: {}", e.getMessage());
        } catch (Exception dlqEx) {
            log.error("Failed to send to DLQ: {}", dlqEx.getMessage());
        }
    }

    private String safeSerialize(TelemetryPoint point) {
        try {
            return objectMapper.writeValueAsString(point);
        } catch (Exception ex) {
            return "serialization_error";
        }
    }
}
