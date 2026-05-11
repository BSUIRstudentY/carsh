package com.carsharing.api.dto.booking;

import com.carsharing.api.domain.Booking;

import java.math.BigDecimal;
import java.time.Instant;

public record BookingResponse(
        Long id,
        Long userId,
        Long vehicleId,
        String vehicleTitle,
        String vehicleImageUrl,
        String status,
        String tariffMode,
        int discountPercent,
        Instant startAt,
        Instant endAt,
        BigDecimal totalAmount,
        String currency,
        Instant createdAt
) {
    public static BookingResponse from(Booking b) {
        return new BookingResponse(
                b.getId(),
                b.getUser().getId(),
                b.getVehicle().getId(),
                b.getVehicle().getDisplayTitle(),
                b.getVehicle().getImageUrl(),
                b.getStatus(),
                b.getTariffMode(),
                b.getDiscountPercent() != null ? b.getDiscountPercent() : 0,
                b.getStartAt(),
                b.getEndAt(),
                b.getTotalAmount(),
                b.getCurrency(),
                b.getCreatedAt()
        );
    }
}
