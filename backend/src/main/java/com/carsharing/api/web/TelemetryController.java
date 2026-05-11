package com.carsharing.api.web;

import com.carsharing.api.config.TelemetryProperties;
import com.carsharing.api.dto.telemetry.RouteResponse;
import com.carsharing.api.dto.telemetry.SimulateBatchRequest;
import com.carsharing.api.dto.telemetry.TelemetrySimulateRequest;
import com.carsharing.api.service.telemetry.TelemetryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/telemetry")
@RequiredArgsConstructor
public class TelemetryController {

    private final TelemetryService telemetryService;
    private final TelemetryProperties telemetryProperties;

    @PostMapping("/simulate")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Map<String, String> simulate(
            @RequestHeader(value = "X-Telemetry-Key", required = false) String apiKey,
            @Valid @RequestBody TelemetrySimulateRequest request
    ) {
        validateApiKey(apiKey);
        telemetryService.sendTelemetryPoint(request);
        return Map.of("status", "sent");
    }

    @PostMapping("/simulate/batch")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Map<String, Object> simulateBatch(
            @RequestHeader(value = "X-Telemetry-Key", required = false) String apiKey,
            @Valid @RequestBody SimulateBatchRequest request
    ) {
        validateApiKey(apiKey);
        int count = 0;
        Instant baseTs = Instant.now();
        for (SimulateBatchRequest.PointInput p : request.points()) {
            TelemetrySimulateRequest single = new TelemetrySimulateRequest(
                    request.vehicleId(),
                    request.bookingId(),
                    baseTs.plusSeconds(count * 5L),
                    p.lat(),
                    p.lon(),
                    p.speed() != null ? p.speed() : 40.0,
                    p.ignition() != null ? p.ignition() : true
            );
            telemetryService.sendTelemetryPoint(single);
            count++;
        }
        return Map.of("status", "sent", "count", count);
    }

    @GetMapping("/vehicle/{vehicleId}/route")
    public RouteResponse vehicleLiveRoute(@PathVariable Long vehicleId) {
        return telemetryService.getLiveRoute(vehicleId);
    }

    private void validateApiKey(String apiKey) {
        String expected = telemetryProperties.simulateApiKey();
        if (apiKey != null && apiKey.equals(expected)) return;
        if (apiKey == null && expected.startsWith("dev-")) return;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid telemetry API key");
    }
}
