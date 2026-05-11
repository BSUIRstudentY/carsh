package com.carsharing.api.dto.admin;

import com.carsharing.api.domain.Vehicle;

import java.time.Instant;

public record AdminVehicleResponse(
        Long id,
        String displayTitle,
        String plateNumber,
        String status,
        String vehicleClassCode,
        String cityName,
        Double latitude,
        Double longitude,
        Instant updatedAt
) {
    public static AdminVehicleResponse from(Vehicle v) {
        return new AdminVehicleResponse(
                v.getId(),
                v.getDisplayTitle(),
                v.getPlateNumber(),
                v.getStatus(),
                v.getVehicleClass() != null ? v.getVehicleClass().getCode() : null,
                v.getCity() != null ? v.getCity().getName() : null,
                v.getLastLatitude(),
                v.getLastLongitude(),
                v.getUpdatedAt()
        );
    }
}
