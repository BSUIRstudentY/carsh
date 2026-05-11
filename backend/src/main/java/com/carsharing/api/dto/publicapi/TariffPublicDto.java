package com.carsharing.api.dto.publicapi;

import com.carsharing.api.domain.Tariff;
import com.carsharing.api.domain.TariffMode;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TariffPublicDto(
        Long id,
        String code,
        String title,
        String currency,
        TariffMode tariffMode,
        BigDecimal pricePerMinute,
        BigDecimal pricePerKm,
        BigDecimal dailyCapAmount,
        BigDecimal bulkTimeHours,
        BigDecimal bulkPackagePrice,
        LocalDate validFrom,
        LocalDate validTo
) {
    public static TariffPublicDto from(Tariff t) {
        return new TariffPublicDto(
                t.getId(),
                t.getCode(),
                t.getTitle(),
                t.getCurrency(),
                t.getTariffMode(),
                t.getPricePerMinute(),
                t.getPricePerKm(),
                t.getDailyCapAmount(),
                t.getBulkTimeHours(),
                t.getBulkPackagePrice(),
                t.getValidFrom(),
                t.getValidTo()
        );
    }
}
