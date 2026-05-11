package com.carsharing.api.service.telemetry;

import com.carsharing.api.config.TelemetryProperties;
import com.carsharing.api.domain.mongo.TelemetryPoint;
import com.carsharing.api.repository.VehicleRepository;
import com.carsharing.api.repository.mongo.TelemetryPointRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TelemetryKafkaConsumerTest {

    @Mock
    private TelemetryPointRepository telemetryPointRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    @Mock
    private SimpMessagingTemplate webSocket;

    private TelemetryKafkaConsumer consumer;

    @BeforeEach
    void setUp() {
        consumer = new TelemetryKafkaConsumer(
                telemetryPointRepository,
                vehicleRepository,
                new ObjectMapper(),
                kafkaTemplate,
                webSocket,
                new TelemetryProperties(2, 90, "test-key")
        );
    }

    @Test
    @SuppressWarnings("unchecked")
    void persistsEveryValidPointEvenWhenLiveUpdatesAreRateLimited() {
        long vehicleId = 42L;
        when(telemetryPointRepository.findByVehicleId(eq(vehicleId), any(Pageable.class)))
                .thenReturn(List.of());

        List<String> messages = new ArrayList<>();
        Instant baseTs = Instant.now().minusSeconds(300);
        for (int i = 0; i < 120; i++) {
            messages.add(message(vehicleId, 700L, baseTs.plusMillis(i * 200L),
                    53.900000 + i * 0.0001,
                    27.560000 + i * 0.0001));
        }

        consumer.consumeBatch(messages);

        ArgumentCaptor<Iterable<TelemetryPoint>> savedCaptor = ArgumentCaptor.forClass(Iterable.class);
        verify(telemetryPointRepository).saveAll(savedCaptor.capture());
        assertThat(savedCaptor.getValue()).hasSize(120);
    }

    @Test
    @SuppressWarnings("unchecked")
    void persistsStationaryPointsEvenWhenLiveUpdatesAreDeduplicated() {
        long vehicleId = 43L;
        when(telemetryPointRepository.findByVehicleId(eq(vehicleId), any(Pageable.class)))
                .thenReturn(List.of());

        Instant baseTs = Instant.now().minusSeconds(300);
        List<String> messages = List.of(
                message(vehicleId, 701L, baseTs, 53.9, 27.56),
                message(vehicleId, 701L, baseTs.plusSeconds(3), 53.9, 27.56),
                message(vehicleId, 701L, baseTs.plusSeconds(6), 53.9, 27.56)
        );

        consumer.consumeBatch(messages);

        ArgumentCaptor<Iterable<TelemetryPoint>> savedCaptor = ArgumentCaptor.forClass(Iterable.class);
        verify(telemetryPointRepository).saveAll(savedCaptor.capture());
        assertThat(savedCaptor.getValue()).hasSize(3);
    }

    private String message(long vehicleId, long bookingId, Instant ts, double lat, double lon) {
        return """
                {"vehicleId":%d,"bookingId":%d,"ts":"%s","lat":%s,"lon":%s,"speed":40.0,"ignition":true}
                """.formatted(vehicleId, bookingId, ts, lat, lon);
    }
}
