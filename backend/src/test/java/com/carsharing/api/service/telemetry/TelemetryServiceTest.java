package com.carsharing.api.service.telemetry;

import com.carsharing.api.repository.mongo.TelemetryPointRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TelemetryServiceTest {

    @Mock
    private TelemetryPointRepository telemetryPointRepository;

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    private TelemetryService telemetryService;

    @BeforeEach
    void setUp() {
        telemetryService = new TelemetryService(
                telemetryPointRepository,
                kafkaTemplate,
                new ObjectMapper()
        );
    }

    @Test
    void routeByBookingUsesStableTimestampThenIdSort() {
        long bookingId = 700L;
        when(telemetryPointRepository.findByBookingId(eq(bookingId), org.mockito.ArgumentMatchers.any(Sort.class)))
                .thenReturn(List.of());

        telemetryService.getRouteByBooking(bookingId);

        ArgumentCaptor<Sort> sortCaptor = ArgumentCaptor.forClass(Sort.class);
        verify(telemetryPointRepository).findByBookingId(eq(bookingId), sortCaptor.capture());
        assertThat(sortCaptor.getValue().getOrderFor("ts")).isNotNull()
                .extracting(Sort.Order::getDirection)
                .isEqualTo(Sort.Direction.ASC);
        assertThat(sortCaptor.getValue().getOrderFor("id")).isNotNull()
                .extracting(Sort.Order::getDirection)
                .isEqualTo(Sort.Direction.ASC);
    }

    @Test
    void liveRouteUsesStableTimestampThenIdSort() {
        long vehicleId = 42L;
        when(telemetryPointRepository.findByVehicleId(eq(vehicleId), org.mockito.ArgumentMatchers.any(Sort.class)))
                .thenReturn(List.of());

        telemetryService.getLiveRoute(vehicleId);

        ArgumentCaptor<Sort> sortCaptor = ArgumentCaptor.forClass(Sort.class);
        verify(telemetryPointRepository).findByVehicleId(eq(vehicleId), sortCaptor.capture());
        assertThat(sortCaptor.getValue().getOrderFor("ts")).isNotNull()
                .extracting(Sort.Order::getDirection)
                .isEqualTo(Sort.Direction.ASC);
        assertThat(sortCaptor.getValue().getOrderFor("id")).isNotNull()
                .extracting(Sort.Order::getDirection)
                .isEqualTo(Sort.Direction.ASC);
    }
}
