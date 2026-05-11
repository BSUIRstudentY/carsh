package com.carsharing.api.dto.publicapi;

import com.carsharing.api.domain.TariffMode;
import com.carsharing.api.domain.Vehicle;

import java.math.BigDecimal;

/**
 * Автомобиль для витрины автопарка; поминутная цена из тарифа класса (режим PER_TIME).
 */
public record VehiclePublicDto(
        Long id,
        String displayTitle,
        String description,
        String imageUrl,
        String vehicleClassCode,
        String vehicleClassTitle,
        BigDecimal pricePerMinute,
        Integer seats,
        Double latitude,
        Double longitude
) {
    public static VehiclePublicDto from(Vehicle v) {
        var vc = v.getVehicleClass();
        BigDecimal ppm = null;
        if (vc.getDefaultTariff() != null && vc.getDefaultTariff().getTariffMode() == TariffMode.PER_TIME) {
            ppm = vc.getDefaultTariff().getPricePerMinute();
        }
        Integer seats = vc.getSeats() != null ? vc.getSeats().intValue() : null;
        return new VehiclePublicDto(
                v.getId(),
                v.getDisplayTitle(),
                v.getDescription(),
                v.getImageUrl(),
                vc.getCode(),
                vc.getTitle(),
                ppm,
                seats,
                v.getLastLatitude(),
                v.getLastLongitude()
        );
    }
}
