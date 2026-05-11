package com.carsharing.api.config;

import com.carsharing.api.domain.mongo.TelemetryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class MongoIndexConfig {

    private final MongoTemplate mongoTemplate;
    private final TelemetryProperties telemetryProperties;

    @EventListener(ApplicationReadyEvent.class)
    public void ensureIndexes() {
        mongoTemplate.indexOps(TelemetryPoint.class).ensureIndex(
                new Index()
                        .on("ts", Sort.Direction.DESC)
                        .expire(Duration.ofDays(telemetryProperties.ttlDays()))
                        .named("idx_ttl_ts")
        );

        mongoTemplate.indexOps(TelemetryPoint.class).ensureIndex(
                new Index()
                        .on("bookingId", Sort.Direction.ASC)
                        .on("ts", Sort.Direction.ASC)
                        .named("idx_booking_ts")
        );
    }
}
