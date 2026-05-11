package com.carsharing.api.service.telemetry;

import com.carsharing.api.domain.mongo.TelemetryPoint;
import com.carsharing.api.dto.telemetry.RouteResponse;
import com.carsharing.api.dto.telemetry.TelemetrySimulateRequest;
import com.carsharing.api.repository.mongo.TelemetryPointRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelemetryService {

    private final TelemetryPointRepository telemetryPointRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    private static final String TOPIC = "vehicle-telemetry";

    public void sendTelemetryPoint(TelemetrySimulateRequest request) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("vehicleId", request.vehicleId());
            payload.put("bookingId", request.bookingId());
            payload.put("ts", (request.ts() != null ? request.ts() : Instant.now()).toString());
            payload.put("lat", request.lat());
            payload.put("lon", request.lon());
            payload.put("speed", request.speed() != null ? request.speed() : 0.0);
            payload.put("ignition", request.ignition() != null ? request.ignition() : true);

            String json = objectMapper.writeValueAsString(payload);
            kafkaTemplate.send(TOPIC, String.valueOf(request.vehicleId()), json);
            log.info("Sent telemetry to Kafka for vehicle {}", request.vehicleId());
        } catch (Exception e) {
            log.error("Failed to send telemetry to Kafka", e);
            throw new RuntimeException("Failed to send telemetry", e);
        }
    }

    public RouteResponse getRouteByBooking(Long bookingId) {
        Sort sort = Sort.by(Sort.Order.asc("ts"), Sort.Order.asc("receivedAt"));
        List<TelemetryPoint> points = telemetryPointRepository.findByBookingId(bookingId, sort);
        return buildRouteResponse(points);
    }

    public RouteResponse getLiveRoute(Long vehicleId) {
        Sort sort = Sort.by(Sort.Order.asc("ts"), Sort.Order.asc("receivedAt"));
        List<TelemetryPoint> points = telemetryPointRepository.findByVehicleId(vehicleId, sort);
        return buildRouteResponse(points);
    }

    private RouteResponse buildRouteResponse(List<TelemetryPoint> points) {
        double totalDistanceKm = 0.0;
        double speedSum = 0.0;
        List<RouteResponse.PointDto> routePoints = new java.util.ArrayList<>();

        for (int i = 0; i < points.size(); i++) {
            TelemetryPoint p = points.get(i);
            speedSum += p.getSpeed();
            routePoints.add(new RouteResponse.PointDto(p.getTs(), p.getLat(), p.getLon(), p.getSpeed()));
            if (i > 0) {
                TelemetryPoint prev = points.get(i - 1);
                totalDistanceKm += GeoDistance.haversineKm(prev.getLat(), prev.getLon(), p.getLat(), p.getLon());
            }
        }

        double avgSpeed = points.isEmpty() ? 0 : speedSum / points.size();
        Instant startedAt = points.isEmpty() ? null : points.get(0).getTs();
        Instant endedAt = points.isEmpty() ? null : points.get(points.size() - 1).getTs();

        return new RouteResponse(
                startedAt, endedAt, totalDistanceKm, avgSpeed, routePoints.size(), routePoints
        );
    }
}
