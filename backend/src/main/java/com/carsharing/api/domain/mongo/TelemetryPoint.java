package com.carsharing.api.domain.mongo;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "telemetry_points")
@CompoundIndex(name = "idx_vehicle_ts", def = "{'vehicleId': 1, 'ts': -1}")
@Getter
@Setter
@Builder
public class TelemetryPoint {

    @Id
    private String id;

    private Long vehicleId;
    private Long bookingId;
    private Instant ts;
    private double lat;
    private double lon;
    private double speed;
    private boolean ignition;
}
