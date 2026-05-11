package com.carsharing.api.dto.publicapi;

import com.carsharing.api.domain.TariffMode;
import com.carsharing.api.domain.VehicleClass;

import java.math.BigDecimal;

public record VehicleClassPublicDto(
        Long id,
        String code,
        String title,
        String description,
        String imageUrl,
        Integer seats,
        Integer sortOrder,
        /** Поминутная ставка из тарифа по умолчанию, если режим PER_TIME. */
        BigDecimal pricePerMinute
) {
    public static VehicleClassPublicDto from(VehicleClass vc) {
        BigDecimal ppm = null;
        if (vc.getDefaultTariff() != null
                && vc.getDefaultTariff().getTariffMode() == TariffMode.PER_TIME) {
            ppm = vc.getDefaultTariff().getPricePerMinute();
        }
        return new VehicleClassPublicDto(
                vc.getId(),
                vc.getCode(),
                vc.getTitle(),
                vc.getDescription(),
                vc.getImageUrl(),
                vc.getSeats() != null ? vc.getSeats().intValue() : null,
                vc.getSortOrder(),
                ppm
        );
    }
}
