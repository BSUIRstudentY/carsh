package com.carsharing.api.service.telemetry;

import com.carsharing.api.config.TelemetryProperties;
import com.carsharing.api.domain.mongo.TelemetryPoint;
import com.carsharing.api.repository.VehicleRepository;
import com.carsharing.api.repository.mongo.TelemetryPointRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TelemetryKafkaConsumerTest {

    private static final long VEHICLE_ID = 42L;

    private TelemetryPointRepository telemetryPointRepository;
    private VehicleRepository vehicleRepository;
    private KafkaTemplate<String, String> kafkaTemplate;
    private SimpMessagingTemplate webSocket;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        telemetryPointRepository = mock(TelemetryPointRepository.class);
        vehicleRepository = mock(VehicleRepository.class);
        kafkaTemplate = mock(KafkaTemplate.class);
        webSocket = mock(SimpMessagingTemplate.class);
        objectMapper = new ObjectMapper();

        when(telemetryPointRepository.findByVehicleId(anyLong(), any(Pageable.class))).thenReturn(List.of());
        when(telemetryPointRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(vehicleRepository.findById(anyLong())).thenReturn(Optional.empty());
    }

    @Test
    void consumeBatch_savesAllLongFutureSequenceWithoutDropping() throws Exception {
        TelemetryKafkaConsumer consumer = new TelemetryKafkaConsumer(
                telemetryPointRepository,
                vehicleRepository,
                objectMapper,
                kafkaTemplate,
                webSocket,
                new TelemetryProperties(2, 90, "test-key")
        );

        Instant start = Instant.now();
        List<String> messages = new ArrayList<>();
        for (int i = 0; i < 120; i++) {
            messages.add(jsonPoint(start.plusSeconds(i * 5L), 53.9 + i * 0.0001, 27.56 + i * 0.0001));
        }

        consumer.consumeBatch(messages);

        ArgumentCaptor<List<TelemetryPoint>> savedCaptor = ArgumentCaptor.forClass(List.class);
        verify(telemetryPointRepository).saveAll(savedCaptor.capture());

        List<TelemetryPoint> saved = savedCaptor.getValue();
        assertEquals(120, saved.size(), "Все точки батча должны сохраняться");
        verify(kafkaTemplate, never()).send(any(), any());
    }

    @Test
    void consumeBatch_sortsSavedPointsByTimestamp() throws Exception {
        TelemetryKafkaConsumer consumer = new TelemetryKafkaConsumer(
                telemetryPointRepository,
                vehicleRepository,
                objectMapper,
                kafkaTemplate,
                webSocket,
                new TelemetryProperties(0, 90, "test-key")
        );

        Instant base = Instant.now();
        List<String> messages = List.of(
                jsonPoint(base.plusSeconds(30), 53.9003, 27.5603),
                jsonPoint(base.plusSeconds(10), 53.9001, 27.5601),
                jsonPoint(base.plusSeconds(20), 53.9002, 27.5602)
        );

        consumer.consumeBatch(messages);

        ArgumentCaptor<List<TelemetryPoint>> savedCaptor = ArgumentCaptor.forClass(List.class);
        verify(telemetryPointRepository).saveAll(savedCaptor.capture());

        List<TelemetryPoint> saved = savedCaptor.getValue();
        assertEquals(3, saved.size());
        assertTrue(!saved.get(0).getTs().isAfter(saved.get(1).getTs()));
        assertTrue(!saved.get(1).getTs().isAfter(saved.get(2).getTs()));
    }

    private String jsonPoint(Instant ts, double lat, double lon) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "vehicleId", VEHICLE_ID,
                "bookingId", 10L,
                "ts", ts.toString(),
                "lat", lat,
                "lon", lon,
                "speed", 42.0,
                "ignition", true
        ));
    }
}
