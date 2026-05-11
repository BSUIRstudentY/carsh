package com.carsharing.api.web;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/telemetry")
@RequiredArgsConstructor
public class TelemetryController {

    private final TelemetryService telemetryService;

    @PostMapping("/simulate")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Map<String, String> simulate(@Valid @RequestBody TelemetrySimulateRequest request) {
        telemetryService.sendTelemetryPoint(request);
        return Map.of("status", "sent");
    }

    @PostMapping("/simulate/batch")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Map<String, Object> simulateBatch(@Valid @RequestBody SimulateBatchRequest request) {
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
}
