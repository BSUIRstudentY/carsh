package com.carsharing.api.service.telemetry;

import com.carsharing.api.domain.Vehicle;
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
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class TelemetryKafkaConsumer {

    private static final double COORD_EPSILON = 0.000005;

    private final TelemetryPointRepository telemetryPointRepository;
    private final VehicleRepository vehicleRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "vehicle-telemetry", groupId = "carsharing-telemetry")
    @Transactional
    public void consume(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);

            long vehicleId = node.get("vehicleId").asLong();
            double lat = node.get("lat").asDouble();
            double lon = node.get("lon").asDouble();
            Instant ts = Instant.parse(node.get("ts").asText());

            if (isDuplicate(vehicleId, lat, lon)) {
                log.debug("Skipping duplicate point for vehicle {}: [{}, {}]", vehicleId, lat, lon);
                return;
            }

            TelemetryPoint point = TelemetryPoint.builder()
                    .vehicleId(vehicleId)
                    .bookingId(node.has("bookingId") && !node.get("bookingId").isNull()
                            ? node.get("bookingId").asLong() : null)
                    .ts(ts)
                    .lat(lat)
                    .lon(lon)
                    .speed(node.has("speed") ? node.get("speed").asDouble() : 0.0)
                    .ignition(node.has("ignition") && node.get("ignition").asBoolean())
                    .build();
            telemetryPointRepository.save(point);

            updateVehiclePosition(vehicleId, lat, lon);

            log.debug("Saved telemetry point for vehicle {}", vehicleId);
        } catch (Exception e) {
            log.error("Failed to process telemetry message: {}", message, e);
        }
    }

    private boolean isDuplicate(long vehicleId, double lat, double lon) {
        Sort sort = Sort.by(Sort.Direction.DESC, "ts");
        List<TelemetryPoint> last = telemetryPointRepository.findByVehicleId(
                vehicleId, PageRequest.of(0, 1, sort));
        if (last.isEmpty()) return false;

        TelemetryPoint prev = last.get(0);
        return Math.abs(prev.getLat() - lat) < COORD_EPSILON
                && Math.abs(prev.getLon() - lon) < COORD_EPSILON;
    }

    private void updateVehiclePosition(long vehicleId, double lat, double lon) {
        vehicleRepository.findById(vehicleId).ifPresent(vehicle -> {
            vehicle.setLastLatitude(lat);
            vehicle.setLastLongitude(lon);
            vehicleRepository.save(vehicle);
        });
    }
}
